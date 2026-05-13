// src/pages/ScanLogs.jsx
import { useEffect, useState, useCallback } from 'react';
import { Activity } from 'lucide-react';
import { api } from '../api/client';
import PageLoader from '../components/PageLoader';
import VynoxSelect from '../components/VynoxSelect';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

const SCAN_TYPE_OPTIONS = [
  { value: '',        label: 'All Scan Types' },
  { value: 'full',    label: 'Full Scan' },
  { value: 'quick',   label: 'Quick Scan' },
  { value: 'file',    label: 'File Scan' },
  { value: 'login',   label: 'Login' },
  { value: 'db',      label: 'Database' },
  { value: 'malware', label: 'Malware' },
];

export default function ScanLogs({ onRefreshRef }) {
  const [logs,    setLogs]   = useState([]);
  const [loading, setLoading]= useState(true);
  const [filter,  setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.getAllScanLogs(); setLogs(r.data.scanLogs || []); }
    catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); if (onRefreshRef) onRefreshRef.current = load; }, [load]);

  const filtered = filter ? logs.filter(l => l.scanType === filter) : logs;

  return (
    <div className="page-enter" style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <VynoxSelect
          value={filter}
          onChange={v => setFilter(v)}
          options={SCAN_TYPE_OPTIONS}
          placeholder="All Scan Types"
          width={160}
        />
        <div style={{ flex: 1 }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{filtered.length} logs</div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Activity size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <div>No scan logs yet. Logs appear here once the plugin starts scanning.</div>
          </div>
        ) : (
          <table className="vynox-table">
            <thead><tr>
              <th>Site</th><th>Scan Type</th><th>Status</th><th>Issues Found</th>
              <th>Duration</th><th>Triggered By</th><th>Time</th>
            </tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l._id}>
                  <td style={{ color: 'var(--info)', fontSize: 12 }}>{l.domain}</td>
                  <td>
                    <span className="badge badge-muted" style={{ fontFamily: 'monospace' }}>{l.scanType}</span>
                  </td>
                  <td>
                    <span className={`badge ${l.status === 'clean' ? 'badge-success' : l.status === 'issues_found' ? 'badge-critical' : 'badge-muted'}`}>
                      {l.status === 'clean' ? '✅ Clean' : l.status === 'issues_found' ? '⚠️ Issues' : '❌ Error'}
                    </span>
                  </td>
                  <td style={{ color: l.issuesFound > 0 ? 'var(--danger)' : 'var(--accent)', fontWeight: 700 }}>
                    {l.issuesFound}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12 }}>
                    {l.durationMs ? `${l.durationMs}ms` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${l.triggeredBy === 'manual' ? 'badge-info' : 'badge-muted'}`}>
                      {l.triggeredBy}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {timeAgo(l.createdAt)}
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
