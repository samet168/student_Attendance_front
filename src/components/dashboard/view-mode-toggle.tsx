'use client';

import React from 'react';
import { Table, SquaresFour } from '@phosphor-icons/react';
import { useUIStore, ViewMode } from '@/stores/use-ui-store';
import { cn } from '@/lib/utils';

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useUIStore();

  return (
    <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-[#15171e] p-1 border border-slate-200/80 dark:border-white/[0.08] shadow-inner">
      <button
        onClick={() => setViewMode('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer',
          viewMode === 'table'
            ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        )}
        title="Table View (បញ្ជី)"
      >
        <Table size={16} weight={viewMode === 'table' ? 'bold' : 'regular'} />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        onClick={() => setViewMode('grid')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer',
          viewMode === 'grid'
            ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        )}
        title="Grid View (កាត)"
      >
        <SquaresFour size={16} weight={viewMode === 'grid' ? 'bold' : 'regular'} />
        <span className="hidden sm:inline">Grid</span>
      </button>
    </div>
  );
}

export default ViewModeToggle;
