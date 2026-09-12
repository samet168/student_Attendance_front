'use client';

import React from 'react';
import { Table, SquaresFour } from '@phosphor-icons/react';
import { useUIStore, ViewMode } from '@/stores/use-ui-store';
import { cn } from '@/lib/utils';

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useUIStore();

  return (
    <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-inner">
      <button
        onClick={() => setViewMode('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer',
          viewMode === 'table'
            ? 'bg-white text-blue-600 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        )}
        title="Table View"
      >
        <Table size={16} weight={viewMode === 'table' ? 'bold' : 'regular'} />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        onClick={() => setViewMode('grid')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer',
          viewMode === 'grid'
            ? 'bg-white text-blue-600 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        )}
        title="Grid View"
      >
        <SquaresFour size={16} weight={viewMode === 'grid' ? 'bold' : 'regular'} />
        <span className="hidden sm:inline">Grid</span>
      </button>
    </div>
  );
}

export default ViewModeToggle;
