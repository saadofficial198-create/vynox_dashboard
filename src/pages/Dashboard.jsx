// src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, AlertTriangle, ShieldCheck, ShieldBan, CheckCircle2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../api/client';
import KpiCard from '../components/KpiCard';
import AlertBadge from '../components/AlertBadge';
import SiteStatusDot from '../components/SiteStatusDot';
import PageLoader from '../components/PageLoader';

const COLORS = { CRITICAL: '#FF2D55', WARNING: '#FF6B35', INFO: '#00B4FF' };

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function ScoreRing({ score }) {
  const color = score >= 80 ? 'var(--accent)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const r = 18, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
        strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
}

export default function Dashboard({ onRefreshRef }) {
  const navigate = useNavigate();
  const [sites,  setSites]  = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [ips,    setIps]    = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, aRes, iRes] = await Promise.all([
        api.getSites(),
        api.getAlerts({ limit: 10, resolved: false }),
        api.getBlockedIps(),
      ]);
      setSites(sRes.data.sites || []);
      setAlerts(aRes.data.alerts || []);
      setIps(iRes.data.blockedIps || []);
    } catch { /* backend offline */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); if (onRefreshRef) onRefreshRef.current = load; }, [load]);

  // KPI calculations
  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
  const online   = sites.filter(s => s.status === 'online').length;

  // Donut chart data
  const severityCounts = ['CRITICAL','WARNING','INFO'].map(s => ({
    name: s, value: alerts.filter(a => a.severity === s).length,
  })).filter(d => d.value > 0);

  if (loading) return <PageLoader />;

  return (
    <div className="page-enter" style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard icon={Globe}        label="Total Sites"       value={sites.length}  sub="Registered sites"             color="var(--info)" />
        <KpiCard icon={AlertTriangle} label="Critical Alerts"  value={critical}      sub="Unresolved"                   color="var(--danger)" />
        <KpiCard icon={ShieldCheck}  label="Sites Online"      value={online}        sub={`of ${sites.length} total`}   color="var(--accent)" />
        <KpiCard icon={ShieldBan}    label="Blocked IPs"       value={ips.length}    sub="Active blocks"                color="var(--warning)" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>

        {/* Recent Alerts */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Recent Alerts</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>View All</button>
          </div>
          {alerts.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShieldCheck size={32} style={{ color: 'var(--accent)', marginBottom: 8 }} />
              <div>No active alerts — all clear!</div>
            </div>
          ) : (
            <table className="vynox-table">
              <thead><tr>
                <th>Severity</th><th>Type</th><th>Message</th><th>Site</th><th>Time</th><th></th>
              </tr></thead>
              <tbody>
                {alerts.map(a => (
                  <tr key={a._id}>
                    <td><AlertBadge severity={a.severity} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12 }}>{a.type}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</td>
                    <td style={{ color: 'var(--info)', fontSize: 12 }}>{a.domain}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(a.createdAt)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={async () => { await api.resolveAlert(a._id); load(); }}>
                        <CheckCircle2 size={12} /> Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Alert Distribution Donut */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Alert Distribution</div>
          {severityCounts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-muted)', gap: 8 }}>
              <ShieldCheck size={28} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 12 }}>All clear</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {severityCounts.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sites Health Grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Sites Health</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sites')}>Manage Sites</button>
        </div>
        {sites.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Globe size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
            <div>No sites registered yet.</div>
            <button className="btn btn-accent" style={{ marginTop: 12 }} onClick={() => navigate('/sites')}>Register First Site</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, padding: 16 }}>
            {sites.map(s => (
              <div key={s._id} onClick={() => navigate(`/sites/${s._id}`)}
                style={{
                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <SiteStatusDot status={s.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.domain}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Clock size={10} />
                    {s.lastScan ? timeAgo(s.lastScan) : 'Never scanned'}
                  </div>
                </div>
                <ScoreRing score={s.securityScore ?? 100} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
