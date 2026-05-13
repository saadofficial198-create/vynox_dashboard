import React from 'react';

export default function ScoreBadge({ score, size = 'md' }) {
  const isPending = score === null;
  const val = isPending ? '—' : score;
  
  let color = 'var(--text-muted)';
  let label = 'Pending';
  
  if (!isPending) {
    if (score >= 90) { color = 'var(--accent)'; label = 'Excellent'; }
    else if (score >= 80) { color = 'var(--accent)'; label = 'Good'; }
    else if (score >= 60) { color = 'var(--warning)'; label = 'Fair'; }
    else if (score >= 40) { color = 'var(--danger)'; label = 'Poor'; }
    else { color = 'var(--danger)'; label = 'Critical'; }
  }

  const sizes = {
    sm: { font: 14, label: 10, gap: 4 },
    md: { font: 24, label: 11, gap: 2 },
    lg: { font: 48, label: 13, gap: 0 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        fontSize: s.font, 
        fontWeight: 900, 
        color, 
        lineHeight: 1,
        textShadow: isPending ? 'none' : `0 0 10px ${color}44`
      }}>
        {val}{!isPending && <span style={{ fontSize: s.font * 0.5, marginLeft: 1 }}>%</span>}
      </div>
      <div style={{ 
        fontSize: s.label, 
        fontWeight: 700, 
        color: 'var(--text-muted)', 
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginTop: s.gap
      }}>
        {label}
      </div>
    </div>
  );
}
