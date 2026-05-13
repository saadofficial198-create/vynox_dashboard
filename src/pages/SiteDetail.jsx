import { ArrowLeft, Globe, Shield, Clock, Activity, Search, ShoppingBag, Database, ChevronRight, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import AlertBadge from '../components/AlertBadge';
import SiteStatusDot from '../components/SiteStatusDot';
import PageLoader from '../components/PageLoader';
import ScoreBadge from '../components/ScoreBadge';
import BackupStatus from '../components/BackupStatus';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function timeAgo(date) {
  if (!date) return 'Never';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

const TABS = ['Overview', 'Alerts', 'Backups', 'Scan Logs', 'Checksums'];

export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site,     setSite]     = useState(null);
  const [alerts,   setAlerts]   = useState([]);
  const [scans,    setScans]    = useState([]);
  const [checksums,setChecksums]= useState([]);
  const [backups,  setBackups]  = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [tab,      setTab]      = useState('Overview');
  const [loading,  setLoading]  = useState(true);
  const [scanning, setScanning] = useState(false);
  const [alertFilter, setAlertFilter] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sRes = await api.getSite(id);
      setSite(sRes.data);
      setLoading(false);

      api.getSiteAlerts(id, { limit: 100 })
        .then(res => setAlerts(res.data.alerts || []))
        .catch(() => {});

      api.getScanLogs(id, { limit: 20 })
        .then(res => setScans(res.data.scanLogs || []))
        .catch(() => {});

      api.getSiteChecksums(id, { limit: 100 })
        .then(res => setChecksums(res.data.checksums || []))
        .catch(() => {});

      api.getBackups(id)
        .then(res => setBackups(res.data.backup))
        .catch(() => {});

      api.getProducts(id, { page: 1, per_page: 1 })
        .then(res => setProductsCount(res.data.total || 0))
        .catch(() => {});

    } catch (err) {
      toast.error('Site not found');
      navigate('/sites');
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const triggerScan = async (type = 'full') => {
    if (scanning) return;
    setScanning(true);
    const tid = toast.loading(`Triggering remote ${type} scan...`);
    try {
      await api.triggerScan(id, type);
      toast.success('Scan triggered successfully!', { id: tid });
      setTimeout(load, 2000); // refresh after a bit
    } catch (err) {
      toast.error(err.response?.data?.error || 'Scan trigger failed', { id: tid });
    } finally {
      setScanning(false);
    }
  };

  const resolveAlert = async (alertId) => {
    try { await api.resolveAlert(alertId); load(); toast.success('Alert resolved'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <PageLoader />;
  if (!site) return null;

  const score = site.securityScore ?? 100;
  const scoreColor = score >= 80 ? 'var(--accent)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="page-enter" style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

      {/* Header with Scan Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sites')}>
          <ArrowLeft size={13} /> Back to Sites
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-accent" 
            onClick={() => triggerScan('full')}
            disabled={scanning}
          >
            <Search size={14} /> {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      {/* Main Site Card */}
      <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--accent-dim)', border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={32} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 24, fontWeight: 900 }}>{site.domain}</h2>
              <SiteStatusDot status={site.status} showLabel />
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6, display: 'flex', gap: 16, alignItems: 'center' }}>
              {site.name && site.name !== site.domain && <span style={{ fontWeight: 600 }}>{site.name}</span>}
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={12} /> WP {site.wpVersion || '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={12} /> PHP {site.phpVersion || '—'}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <BackupStatus backup={backups} />
            <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
            <ScoreBadge score={site.securityScore} size="lg" />
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          {[
            { icon: AlertCircle, label: 'Open Alerts', val: alerts.filter(a => !a.resolved).length, color: 'var(--danger)', bg: 'var(--danger-dim)' },
            { icon: ShoppingBag, label: 'Products', val: productsCount, color: 'var(--info)', bg: 'var(--info-dim)', action: () => navigate(`/sites/${id}/products`) },
            { icon: Activity, label: 'Total Scans', val: scans.length, color: 'var(--accent)', bg: 'var(--accent-dim)' },
            { icon: Clock, label: 'Last Scan', val: timeAgo(site.lastScan), color: 'var(--text-secondary)', bg: 'var(--border)' },
          ].map((kpi, idx) => (
            <div 
              key={idx} 
              onClick={kpi.action}
              style={{ 
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px',
                display: 'flex', alignItems: 'center', gap: 12, cursor: kpi.action ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                ...(kpi.action && { ':hover': { transform: 'translateY(-2px)' } })
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{kpi.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: kpi.color }}>{kpi.val}</div>
              </div>
              {kpi.action && <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.15s',
            }}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Latest Alerts */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Latest Critical Alerts</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('Alerts')}>View All</button>
            </div>
            <div style={{ padding: 0 }}>
              {alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).slice(0, 5).length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <CheckCircle2 size={24} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                  <div>No critical alerts pending!</div>
                </div>
              ) : (
                alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).slice(0, 5).map(a => (
                  <div key={a._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{a.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(a.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Latest Scans */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Recent Activity</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('Scan Logs')}>View Logs</button>
            </div>
            <div style={{ padding: 0 }}>
              {scans.slice(0, 5).map(s => (
                <div key={s._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: 6, 
                    background: s.status === 'clean' ? 'var(--accent-dim)' : 'var(--danger-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {s.status === 'clean' ? <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} /> : <AlertCircle size={16} style={{ color: 'var(--danger)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.scanType.toUpperCase()} Scan</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.status === 'clean' ? 'No issues' : `${s.issuesFound} issues found`}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(s.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Critical', 'Warning', 'Info', 'Resolved'].map(f => (
              <button 
                key={f} 
                onClick={() => setAlertFilter(f)}
                className={`btn btn-sm ${alertFilter === f ? 'btn-accent' : 'btn-ghost'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {alerts.filter(a => {
              if (alertFilter === 'All') return !a.resolved;
              if (alertFilter === 'Resolved') return a.resolved;
              return a.severity === alertFilter.toUpperCase() && !a.resolved;
            }).length === 0
              ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Shield size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <div>No alerts found for this filter.</div>
                </div>
              : <table className="vynox-table">
                  <thead><tr><th>Severity</th><th>Type</th><th>Message</th><th>Time</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {alerts.filter(a => {
                      if (alertFilter === 'All') return !a.resolved;
                      if (alertFilter === 'Resolved') return a.resolved;
                      return a.severity === alertFilter.toUpperCase() && !a.resolved;
                    }).map(a => (
                      <tr key={a._id} style={{ opacity: a.resolved ? 0.6 : 1 }}>
                        <td><AlertBadge severity={a.severity} /></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{a.type}</td>
                        <td style={{ maxWidth: 400, wordBreak: 'break-word', whiteSpace: 'normal', fontSize: 13 }}>{a.message}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(a.createdAt)}</td>
                        <td>
                          {a.resolved
                            ? <span className="badge badge-success">Resolved</span>
                            : <span className="badge badge-critical">Open</span>}
                        </td>
                        <td>
                          {!a.resolved && (
                            <button className="btn btn-ghost btn-sm" onClick={() => resolveAlert(a._id)}>Resolve</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>
      )}

      {tab === 'Backups' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {!backups ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Database size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div>No backup data received from site yet.</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 40 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plugin</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: backups.hasBackupPlugin ? 'var(--accent)' : 'var(--danger)', marginTop: 4 }}>
                    {backups.hasBackupPlugin ? `WPvivid (${backups.pluginVersion})` : 'Not Detected'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Backups</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{backups.backupCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Storage</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, textTransform: 'capitalize' }}>{backups.storageType}</div>
                </div>
              </div>
              <table className="vynox-table">
                <thead><tr><th>Filename</th><th>Size</th><th>Date</th><th>Storage</th><th>Status</th></tr></thead>
                <tbody>
                  {backups.backups?.map((b, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.filename}</td>
                      <td>{b.size}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{new Date(b.createdAt).toLocaleString()}</td>
                      <td style={{ textTransform: 'capitalize', fontSize: 12 }}>{b.storageType}</td>
                      <td><span className={`badge ${b.status === 'complete' ? 'badge-success' : 'badge-critical'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {tab === 'Scan Logs' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {scans.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No scan logs yet.</div>
            : <table className="vynox-table">
                <thead><tr><th>Type</th><th>Status</th><th>Issues</th><th>Duration</th><th>Triggered By</th><th>Time</th></tr></thead>
                <tbody>
                  {scans.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.scanType}</td>
                      <td>
                        <span className={`badge ${s.status === 'clean' ? 'badge-success' : s.status === 'issues_found' ? 'badge-critical' : 'badge-muted'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ color: s.issuesFound > 0 ? 'var(--danger)' : 'var(--accent)', fontWeight: 700 }}>{s.issuesFound}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.durationMs ? `${s.durationMs}ms` : '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.triggeredBy}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(s.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {tab === 'Checksums' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {checksums.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No file checksums stored yet.</div>
            : <table className="vynox-table">
                <thead><tr><th>File Path</th><th>MD5 Hash</th><th>Status</th><th>Last Checked</th></tr></thead>
                <tbody>
                  {checksums.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.filePath}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{c.md5Hash?.slice(0, 16)}...</td>
                      <td>
                        <span className={`badge ${c.status === 'clean' ? 'badge-success' : c.status === 'modified' ? 'badge-critical' : 'badge-warning'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(c.lastChecked)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}
    </div>
  );
}
