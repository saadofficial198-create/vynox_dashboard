import React from 'react';
import { Database, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

export default function BackupStatus({ backup }) {
  if (!backup) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
      <Database size={14} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>No Backup Data</span>
    </div>
  );

  const hasPlugin = backup.hasBackupPlugin;
  const lastBackup = backup.lastBackupTime;
  const isStale = lastBackup && (new Date() - new Date(lastBackup)) / (1000 * 60 * 60 * 24) > 7;

  let statusColor = 'var(--accent)';
  let statusText = 'Backups OK';
  let Icon = ShieldCheck;

  if (!hasPlugin) {
    statusColor = 'var(--danger)';
    statusText = 'No Plugin';
    Icon = ShieldAlert;
  } else if (!lastBackup) {
    statusColor = 'var(--warning)';
    statusText = 'No Backups';
    Icon = ShieldAlert;
  } else if (isStale) {
    statusColor = 'var(--warning)';
    statusText = 'Stale Backup';
    Icon = Clock;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ 
        width: 32, height: 32, borderRadius: 8, 
        background: `${statusColor}22`, border: `1px solid ${statusColor}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={16} style={{ color: statusColor }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: statusColor, lineHeight: 1 }}>{statusText}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {lastBackup ? new Date(lastBackup).toLocaleDateString() : (hasPlugin ? 'Not yet run' : 'Install WPvivid')}
        </div>
      </div>
    </div>
  );
}
