'use client';

import React from 'react';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ViewModeToggle } from './view-mode-toggle';
import { ExportDropdown } from './export-dropdown';
import { FilterPopover } from './filter-popover';
import { useUIStore } from '@/stores/use-ui-store';

interface DataToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  genderFilter: string;
  setGenderFilter: (val: string) => void;
  onResetFilters: () => void;
  exportData: any[];
  exportFilename?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
}

export function DataToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  genderFilter,
  setGenderFilter,
  onResetFilters,
  exportData,
  exportFilename = 'students_export',
  onAddNew,
  addNewLabel,
}: DataToolbarProps) {
  const { language } = useUIStore();
  const isKm = language === 'km';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <MagnifyingGlass size={16} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isKm ? 'ស្វែងរកតាមឈ្មោះ ឬ អត្តលេខ...' : 'Search by name or ID...'}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterPopover
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          genderFilter={genderFilter}
          setGenderFilter={setGenderFilter}
          onReset={onResetFilters}
        />

        <ViewModeToggle />

        <ExportDropdown
          data={exportData}
          filename={exportFilename}
          title={isKm ? 'បញ្ជីសិស្ស' : 'Students List'}
        />

        {onAddNew && (
          <Button onClick={onAddNew} size="sm" className="gap-1.5 text-xs font-bold shadow-sm shadow-blue-500/20">
            <Plus size={14} weight="bold" />
            <span>{addNewLabel || (isKm ? 'បន្ថែមថ្មី' : 'Add New')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default DataToolbar;
