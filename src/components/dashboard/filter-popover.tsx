'use client';

import React from 'react';
import { Funnel, ArrowClockwise } from '@phosphor-icons/react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useUIStore } from '@/stores/use-ui-store';

interface FilterPopoverProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  onReset: () => void;
}

export function FilterPopover({
  statusFilter,
  setStatusFilter,
  genderFilter,
  setGenderFilter,
  onReset,
}: FilterPopoverProps) {
  const { language } = useUIStore();
  const isKm = language === 'km';

  const hasFilters = statusFilter !== 'all' || genderFilter !== 'all';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative gap-1.5 text-xs ${hasFilters ? 'border-blue-500 text-blue-400 bg-blue-500/10' : ''}`}
        >
          <Funnel size={14} weight={hasFilters ? 'fill' : 'regular'} />
          <span>{isKm ? 'តម្រង' : 'Filters'}</span>
          {hasFilters && (
            <span className="h-2 w-2 rounded-full bg-blue-500 absolute -top-1 -right-1" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="right" className="w-72 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            {isKm ? 'ជម្រើសតម្រង' : 'Filter Options'}
          </h4>
          {hasFilters && (
            <button
              onClick={onReset}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowClockwise size={12} />
              {isKm ? 'កំណត់ឡើងវិញ' : 'Reset'}
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-medium">
            {isKm ? 'ស្ថានភាព' : 'Status'}
          </label>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5"
          >
            <option value="all">{isKm ? 'ទាំងអស់' : 'All Statuses'}</option>
            <option value="active">{isKm ? 'កំពុងរៀន (Active)' : 'Active'}</option>
            <option value="inactive">{isKm ? 'ឈប់រៀន (Inactive)' : 'Inactive'}</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-medium">
            {isKm ? 'ភេទ' : 'Gender'}
          </label>
          <Select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs py-1.5"
          >
            <option value="all">{isKm ? 'ទាំងអស់' : 'All Genders'}</option>
            <option value="male">{isKm ? 'ប្រុស (Male)' : 'Male'}</option>
            <option value="female">{isKm ? 'ស្រី (Female)' : 'Female'}</option>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default FilterPopover;
