// src/pages/BlockedIPs.jsx
import { useEffect, useState, useCallback } from 'react';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import PageLoader from '../components/PageLoader';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function BlockedIPs({ onRefreshRef }) {
  const [ips,     setIps]    = useState([]);
  const [loading, setLoading]= useState(true);
  const [modal,   setModal]  = useState(false);
  const [form,    setForm]   = useState({ ip: '', reason: '', blockedBy: 'manual' });
  const [saving,  setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.getBlockedIps(); setIps(r.data.blockedIps || []); }
    catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); if (onRefreshRef) onRefreshRef.current = load; }, [load]);

  const handleBlock = async (e) => {
    e.preventDefault();
    if (!form.ip.trim() || !form.reason.trim()) return;
    setSaving(true);
    try {
      await api.blockIp(form);
      setModal(false);
      setForm({ ip: '', reason: '', blockedBy: 'manual' });
      load();
      toast.success(`IP ${form.ip} blocked`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to block IP');
    } finally { setSaving(false); }
  };

  const handleUnblock = async (ip) => {
    if (!confirm(`Unblock ${ip}?`)) return;
    try { await api.unblockIp(ip); load(); toast.success(`${ip} unblocked`); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="page-enter" style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {ips.length} IP{ips.length !== 1 ? 's' : ''} blocked
        </div>
        <button className="btn btn-accent" onClick={() => setModal(true)}>
          <Plus size={15} /> Block IP
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <PageLoader /> : ips.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldCheck size={36} style={{ color: 'var(--accent)', marginBottom: 12 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No blocked IPs</div>
            <div style={{ fontSize: 13 }}>IPs blocked by the plugin appear here automatically</div>
          </div>
        ) : (
          <table className="vynox-table">
            <thead><tr>
              <th>IP Address</th><th>Reason</th><th>Site</th><th>Blocked By</th>
              <th>Abuse Score</th><th>Country</th><th>Time</th><th>Action</th>
            </tr></thead>
            <tbody>
              {ips.map(ip => (
                <tr key={ip._id}>
                  <td>
                    <code style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 700 }}>{ip.ip}</code>
                  </td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    {ip.reason}
                  </td>
                  <td style={{ color: 'var(--info)', fontSize: 12 }}>{ip.domain || '—'}</td>
                  <td>
                    <span className={`badge ${ip.blockedBy === 'auto' ? 'badge-warning' : 'badge-muted'}`}>
                      {ip.blockedBy}
                    </span>
                  </td>
                  <td style={{ color: ip.abuseScore > 50 ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 700 }}>
                    {ip.abuseScore ?? '—'}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ip.country || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {timeAgo(ip.createdAt)}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleUnblock(ip.ip)}>
                      <Trash2 size={12} /> Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Block IP Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Block IP Address</h2>
            <form onSubmit={handleBlock} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>IP Address *</label>
                <input className="vynox-input" placeholder="192.168.1.1"
                  value={form.ip} onChange={e => setForm(f => ({ ...f, ip: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Reason *</label>
                <input className="vynox-input" placeholder="Brute force attack"
                  value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Blocked By</label>
                <select className="vynox-input" value={form.blockedBy} onChange={e => setForm(f => ({ ...f, blockedBy: e.target.value }))}>
                  <option value="manual">Manual</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="submit" className="btn btn-danger" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Blocking...' : '🚫 Block IP'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
