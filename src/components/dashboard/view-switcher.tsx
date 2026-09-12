'use client';

import React from 'react';
import { Table, SquaresFour } from '@phosphor-icons/react';
import { useAppStore, translations } from '@/lib/store';

export const ViewSwitcher: React.FC = () => {
  const { viewMode, setViewMode, language } = useAppStore();
  const t = translations[language];

  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
      <button
        onClick={() => setViewMode('table')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
          viewMode === 'table'
            ? 'bg-white text-blue-600 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title={t.tableView}
      >
        <Table size={16} weight={viewMode === 'table' ? 'fill' : 'regular'} />
        <span>{t.tableView}</span>
      </button>

      <button
        onClick={() => setViewMode('grid')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
          viewMode === 'grid'
            ? 'bg-white text-blue-600 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title={t.gridView}
      >
        <SquaresFour size={16} weight={viewMode === 'grid' ? 'fill' : 'regular'} />
        <span>{t.gridView}</span>
      </button>
    </div>
  );
};
