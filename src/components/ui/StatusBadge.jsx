import React from 'react';
import { STATUS_CONFIG } from '@/lib/droneUtils';

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center font-mono border rounded-full ${
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    } ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {cfg.label}
    </span>
  );
}