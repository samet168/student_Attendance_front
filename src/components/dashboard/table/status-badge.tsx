import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'rejected' | 'active' | 'inactive' | 'present' | 'absent' | 'late' | 'permission' | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const styles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    present: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    late: 'bg-amber-50 text-amber-700 border-amber-200/80',
    permission: 'bg-blue-50 text-blue-700 border-blue-200/80',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200/80',
    absent: 'bg-rose-50 text-rose-700 border-rose-200/80',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border capitalize shadow-2xs',
        styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-90" />
      {status}
    </span>
  );
}

export default StatusBadge;
