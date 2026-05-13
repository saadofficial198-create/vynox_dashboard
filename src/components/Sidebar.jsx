// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Globe, Bell, ShieldBan,
  ClipboardList, ChevronRight
} from 'lucide-react';

const links = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sites',       icon: Globe,           label: 'Sites' },
  { to: '/alerts',      icon: Bell,            label: 'Alerts' },
  { to: '/blocked-ips', icon: ShieldBan,       label: 'Blocked IPs' },
  { to: '/scan-logs',   icon: ClipboardList,   label: 'Scan Logs' },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 16, color: '#0A1628',
            boxShadow: 'var(--accent-glow)', flexShrink: 0,
          }}>V</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 2, color: 'var(--accent)' }}>VYNOX</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 0.5, marginTop: -1 }}>IN THE SHADOWS</div>
          </div>
        </div>
      </div>

      <div className="glow-line" style={{ margin: '0 16px 12px' }} />

      {/* Nav */}
      <nav style={{ padding: '0 10px', flex: 1 }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{label}</span>
            <ChevronRight size={13} style={{ opacity: 0.3 }} />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 11 }}>VYNOX v1.0</div>
          On Your Side. Always.
        </div>
      </div>
    </aside>
  );
}
