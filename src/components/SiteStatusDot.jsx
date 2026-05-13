// src/components/SiteStatusDot.jsx
export default function SiteStatusDot({ status, showLabel = false }) {
  const map = {
    online:   { cls: 'dot-online',   label: 'Online'   },
    offline:  { cls: 'dot-offline',  label: 'Offline'  },
    warning:  { cls: 'dot-warning',  label: 'Warning'  },
    critical: { cls: 'dot-critical', label: 'Critical' },
  };
  const { cls, label } = map[status] || { cls: 'dot-offline', label: status };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span className={`dot ${cls}`} />
      {showLabel && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>}
    </span>
  );
}
