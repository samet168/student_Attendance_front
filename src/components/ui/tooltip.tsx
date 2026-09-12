'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Tooltip({
  content,
  children,
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-200 shadow-md animate-in fade-in zoom-in-95 pointer-events-none',
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
