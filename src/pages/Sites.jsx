// src/pages/Sites.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, Trash2, ExternalLink, ChevronRight, CheckCheck, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import SiteStatusDot from '../components/SiteStatusDot';
import PageLoader from '../components/PageLoader';

function timeAgo(date) {
  if (!date) return 'Never';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function scoreColor(n) {
  if (n === null) return 'var(--text-muted)';
  if (n >= 80) return 'var(--accent)';
  if (n >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

// ── Custom Delete Confirm Modal ────────────────────────────────────────────────
function DeleteConfirmModal({ site, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--danger-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={20} color="var(--danger)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Delete Site</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>This action cannot be undone</div>
          </div>
          <button onClick={onCancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: 'var(--danger-dim)', border: '1px solid var(--danger)',
          borderRadius: 8, padding: '12px 14px', marginBottom: 20,
        }}>
          <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: 13 }}>⚠️ Permanently deletes:</div>
          <ul style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 6, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Site: <strong style={{ color: 'var(--text-primary)' }}>{site?.domain}</strong></li>
            <li>All alerts for this site</li>
            <li>All scan logs for this site</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-danger" style={{ flex: 1 }}
            onClick={onConfirm} disabled={loading}
          >
            {loading ? 'Deleting...' : '🗑️ Yes, Delete Permanently'}
          </button>
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Sites({ onRefreshRef }) {
  const navigate = useNavigate();
  const [sites,      setSites]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState({ domain: '', name: '', scan_token: '' });
  const [saving,     setSaving]     = useState(false);
  const [copied,     setCopied]     = useState(null);
  const [newSite,    setNewSite]    = useState(null);
  const [delTarget,  setDelTarget]  = useState(null); // site to delete
  const [deleting,   setDeleting]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.getSites(); setSites(r.data.sites || []); }
    catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); if (onRefreshRef) onRefreshRef.current = load; }, [load]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.domain.trim()) return;
    setSaving(true);
    try {
      const r = await api.registerSite(form);
      setNewSite(r.data);
      setForm({ domain: '', name: '', scan_token: '' });
      setModal(false);
      load();
      toast.success(`Site registered: ${r.data.domain}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setSaving(false); }
  };

  const copyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success('API key copied!');
  };

  const confirmDelete = (site) => setDelTarget(site);

  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await api.deleteSite(delTarget._id);
      toast.success(`${delTarget.domain} permanently deleted`);
      setDelTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-enter" style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {sites.length} site{sites.length !== 1 ? 's' : ''} registered
        </div>
        <button className="btn btn-accent" onClick={() => setModal(true)}>
          <Plus size={15} /> Register New Site
        </button>
      </div>

      {/* API Key Banner */}
      {newSite && (
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <CheckCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>Site registered! Save this API key — shown only once.</div>
            <code style={{ fontSize: 12, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{newSite.apiKey}</code>
          </div>
          <button className="btn btn-accent btn-sm" onClick={() => copyKey(newSite.apiKey, 'new')}>
            {copied === 'new' ? <CheckCheck size={12} /> : <Copy size={12} />} Copy
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setNewSite(null)}>Dismiss</button>
        </div>
      )}

      {/* Sites Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {sites.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🌐</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No sites yet</div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>Register your first WordPress site to start monitoring</div>
            <button className="btn btn-accent" onClick={() => setModal(true)}><Plus size={14} /> Register Site</button>
          </div>
        ) : (
          <table className="vynox-table">
            <thead><tr>
              <th>Status</th><th>Domain</th><th>Security Score</th><th>Last Scan</th>
              <th>WP Version</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {sites.map(s => (
                <tr key={s._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/sites/${s._id}`)}>
                  <td onClick={e => e.stopPropagation()}>
                    <SiteStatusDot status={s.status} showLabel />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600 }}>{s.domain}</span>
                      <ExternalLink size={11} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {s.name !== s.domain && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.name}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${s.securityScore ?? 0}%`, height: '100%',
                          background: scoreColor(s.securityScore),
                          borderRadius: 3, transition: 'width 0.4s',
                        }} />
                      </div>
                      <span style={{ color: scoreColor(s.securityScore), fontWeight: 700, fontSize: 13 }}>
                        {s.securityScore !== null ? s.securityScore : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{timeAgo(s.lastScan)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12 }}>
                    {s.wpVersion || '—'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/sites/${s._id}`)}>
                        <ChevronRight size={12} /> Details
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(s)}
                        title="Delete site permanently">
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

      {/* Register Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 18 }}>Register New Site</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
              After registration, install the VYNOX plugin on your WordPress site and paste the generated API key.
            </p>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Domain *</label>
                <input className="vynox-input" placeholder="myshop.com"
                  value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Site Name (optional)</label>
                <input className="vynox-input" placeholder="My Shop"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Scan Token *</label>
                <input className="vynox-input vynox-monospace" placeholder="Paste from: WP Admin → VYNOX Plugin → Settings → Scan Token"
                  value={form.scan_token} onChange={e => setForm(f => ({ ...f, scan_token: e.target.value }))} required />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Copy from your WordPress site's VYNOX plugin settings page
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Registering...' : '+ Register Site'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {delTarget && (
        <DeleteConfirmModal
          site={delTarget}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}