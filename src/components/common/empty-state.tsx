'use client';

import React from 'react';
import { Tray } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
      <div className="h-12 w-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        {icon || <Tray size={28} />}
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5 text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
