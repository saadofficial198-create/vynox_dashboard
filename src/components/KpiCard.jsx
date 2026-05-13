// src/components/KpiCard.jsx
export default function KpiCard({ icon: Icon, label, value, sub, color = 'var(--accent)', trend }) {
  return (
    <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 0.5 }}>
          {label}
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: `${color}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${color}30`,
        }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
      )}
    </div>
  );
}
