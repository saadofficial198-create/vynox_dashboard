// src/pages/Alerts.jsx
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import AlertBadge from '../components/AlertBadge';
import PageLoader from '../components/PageLoader';
import VynoxSelect from '../components/VynoxSelect';

function MessageDisplay({ message }) {
  const [expanded, setExpanded] = useState(false);
  if (!message) return null;
  const isLong = message.length > 200;
  
  return (
    <div style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: 13, lineHeight: 1.4, maxWidth: 400 }}>
      {expanded ? message : (isLong ? `${message.slice(0, 200)}...` : message)}
      {isLong && (
        <button 
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{ 
            background: 'none', border: 'none', color: 'var(--accent)', 
            cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '0 4px',
            textDecoration: 'underline'
          }}
        >
          {expanded ? 'less' : 'more'}
        </button>
      )}
    </div>
  );
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

const SEVERITY_OPTIONS = [
  { value: '',         label: 'All Severities' },
  { value: 'CRITICAL', label: '🔴 Critical' },
  { value: 'WARNING',  label: '🟡 Warning' },
  { value: 'INFO',     label: '🟢 Info' },
];

const STATUS_OPTIONS = [
  { value: 'false', label: 'Unresolved' },
  { value: 'true',  label: 'Resolved' },
  { value: '',      label: 'All Statuses' },
];

const LIMIT_OPTIONS = [
  { value: '25',  label: '25 per page' },
  { value: '50',  label: '50 per page' },
  { value: '100', label: '100 per page' },
];

export default function Alerts({ onRefreshRef }) {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const [filters, setFilters] = useState({ severity: '', resolved: 'false', limit: '50' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.severity) delete params.severity;
      if (params.resolved === '') delete params.resolved;
      const r = await api.getAlerts(params);
      setAlerts(r.data.alerts || []);
      setTotal(r.data.total || 0);
    } catch { }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); if (onRefreshRef) onRefreshRef.current = load; }, [load]);

  const resolve = async (id) => {
    try { await api.resolveAlert(id); load(); toast.success('Alert resolved'); }
    catch { toast.error('Failed to resolve'); }
  };

  const remove = async (id) => {
    try { await api.deleteAlert(id); load(); toast.success('Alert deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const resolveAll = async () => {
    const open = alerts.filter(a => !a.resolved);
    if (open.length === 0) return;
    try {
      await Promise.all(open.map(a => api.resolveAlert(a._id)));
      load();
      toast.success(`${open.length} alerts resolved`);
    } catch { toast.error('Failed'); }
  };

  const openCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="page-enter" style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />

        <VynoxSelect
          value={filters.severity}
          onChange={v => setFilters(f => ({ ...f, severity: v }))}
          options={SEVERITY_OPTIONS}
          placeholder="All Severities"
          width={155}
        />

        <VynoxSelect
          value={filters.resolved}
          onChange={v => setFilters(f => ({ ...f, resolved: v }))}
          options={STATUS_OPTIONS}
          placeholder="Unresolved"
          width={145}
        />

        <VynoxSelect
          value={filters.limit}
          onChange={v => setFilters(f => ({ ...f, limit: v }))}
          options={LIMIT_OPTIONS}
          placeholder="50 per page"
          width={135}
        />

        <div style={{ flex: 1 }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {total} total — {openCount} open
        </div>
        {openCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={resolveAll}>
            <CheckCircle2 size={13} /> Resolve All
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <PageLoader /> : alerts.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
            <div>No alerts match the current filter.</div>
          </div>
        ) : (
          <table className="vynox-table">
            <thead><tr>
              <th>Severity</th><th>Type</th><th>Message</th><th>Site</th>
              <th>Source IP</th><th>Time</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a._id} style={{ opacity: a.resolved ? 0.5 : 1 }}>
                  <td><AlertBadge severity={a.severity} /></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{a.type}</td>
                  <td>
                    <MessageDisplay message={a.message} />
                  </td>
                  <td style={{ color: 'var(--info)', fontSize: 12 }}>{a.domain}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                    {a.sourceIp || '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {timeAgo(a.createdAt)}
                  </td>
                  <td>
                    {a.resolved
                      ? <span className="badge badge-success">✓ Resolved</span>
                      : <span className="badge badge-critical">Open</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!a.resolved && (
                        <button className="btn btn-ghost btn-sm" title="Resolve" onClick={() => resolve(a._id)}>
                          <CheckCircle2 size={12} />
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" title="Delete" onClick={() => remove(a._id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
