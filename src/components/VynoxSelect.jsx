// src/components/VynoxSelect.jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Premium custom dropdown — replaces native <select>
 * Props: value, onChange, options=[{value, label}], placeholder, width
 */
export default function VynoxSelect({ value, onChange, options = [], placeholder = 'Select...', width = 160 }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width, userSelect: 'none' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, padding: '7px 12px',
          background: 'var(--card-bg)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8, cursor: 'pointer',
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: 13, fontFamily: 'inherit',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: open ? '0 0 0 2px var(--accent-dim)' : 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--text-muted)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          width: '100%', minWidth: width,
          background: 'var(--sidebar-bg)',
          border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 999,
          animation: 'dropIn 0.12s ease',
        }}>
          {options.map(opt => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 8,
                  padding: '9px 14px',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 13, fontFamily: 'inherit',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span>{opt.label}</span>
                {isActive && <Check size={13} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
