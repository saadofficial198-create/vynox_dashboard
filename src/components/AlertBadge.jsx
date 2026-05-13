// src/components/AlertBadge.jsx
export default function AlertBadge({ severity }) {
  const map = {
    CRITICAL: { cls: 'badge-critical', dot: '🔴', label: 'CRITICAL' },
    WARNING:  { cls: 'badge-warning',  dot: '🟡', label: 'WARNING'  },
    INFO:     { cls: 'badge-info',     dot: '🟢', label: 'INFO'     },
  };
  const { cls, dot, label } = map[severity] || { cls: 'badge-muted', dot: '⚪', label: severity };
  return <span className={`badge ${cls}`}>{dot} {label}</span>;
}
