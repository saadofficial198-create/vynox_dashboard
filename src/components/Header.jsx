// src/components/Header.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

const titles = {
  '/':            'Dashboard',
  '/sites':       'Sites',
  '/alerts':      'Alerts',
  '/blocked-ips': 'Blocked IPs',
  '/scan-logs':   'Scan Logs',
};

export default function Header({ onRefresh }) {
  const location = useLocation();
  const [time, setTime]       = useState(new Date());
  const [online, setOnline]   = useState(null);
  const [checking, setChecking] = useState(false);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Backend ping
  const checkBackend = async () => {
    setChecking(true);
    try { await api.ping(); setOnline(true); }
    catch { setOnline(false); }
    finally { setChecking(false); }
  };

  useEffect(() => { checkBackend(); }, []);

  const pageTitle = Object.entries(titles).find(([path]) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  )?.[1] || 'VYNOX';

  return (
    <header style={{
      height: 60, display: 'flex', alignItems: 'center',
      padding: '0 24px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)', flexShrink: 0,
      justifyContent: 'space-between',
    }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
        {pageTitle}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Backend Status */}
        <button
          onClick={checkBackend}
          title="Check backend connection"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: online ? 'var(--accent-dim)' : 'var(--danger-dim)',
            border: `1px solid ${online ? 'var(--accent)' : 'var(--danger)'}`,
            borderRadius: 20, padding: '4px 10px', cursor: 'pointer',
            color: online ? 'var(--accent)' : 'var(--danger)', fontSize: 12, fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {checking
            ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
            : online
              ? <Wifi size={12} />
              : <WifiOff size={12} />
          }
          {online === null ? 'Checking...' : online ? 'Backend Online' : 'Backend Offline'}
        </button>

        {/* Refresh */}
        {onRefresh && (
          <button onClick={onRefresh} className="btn btn-ghost btn-sm">
            <RefreshCw size={13} /> Refresh
          </button>
        )}

        {/* Clock */}
        <div style={{
          fontFamily: 'monospace', fontSize: 13,
          color: 'var(--text-secondary)', letterSpacing: 1,
        }}>
          {time.toLocaleTimeString()}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </header>
  );
}
