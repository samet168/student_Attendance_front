'use client';

/**
 * ExportMenu — reusable dropdown for multi-format data export.
 *
 * Usage:
 *   <ExportMenu
 *     data={rows}                         // array of objects (for Excel) or custom getter
 *     filename="students"
 *     tableHeaders={['#', 'Name', ...]}  // for PDF / Word / PPTX
 *     tableRows={rowsAs2DArray}           // for PDF / Word / PPTX
 *     title="Student Roster"
 *     isKm={isKm}
 *   />
 *
 * Supports: Excel (.xlsx) · PDF (.pdf) · Word (.docx) · PowerPoint (.pptx)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  DownloadSimple, FileXls, FilePdf, FileDoc, FilePpt, CaretDown,
} from '@phosphor-icons/react';
import { exportToExcelFile } from '@/lib/exporters/export-excel';
import { exportToPdfFile } from '@/lib/exporters/export-pdf';
import { exportToWordFile } from '@/lib/exporters/export-word';
import { exportToPptxFile } from '@/lib/exporters/export-pptx';

export interface ExportMenuProps {
  /** Array of plain objects — used for Excel export */
  excelData: Record<string, string | number | null | undefined>[];
  /** Column headers for PDF / Word / PPTX */
  tableHeaders: string[];
  /** 2-D array of row values for PDF / Word / PPTX */
  tableRows: (string | number)[][];
  /** Title shown in reports */
  title: string;
  /** Base filename (no extension) */
  filename?: string;
  /** Khmer mode flag */
  isKm?: boolean;
  /** Optional extra CSS classes for the trigger button */
  className?: string;
  /** Which formats to show — default all 4 */
  formats?: ('excel' | 'pdf' | 'word' | 'pptx')[];
  /** Label on the button */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

export function ExportMenu({
  excelData,
  tableHeaders,
  tableRows,
  title,
  filename = 'export',
  isKm = false,
  className = '',
  formats = ['excel', 'pdf', 'word', 'pptx'],
  label,
  size = 'sm',
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const btnSize = size === 'sm'
    ? 'px-3 py-1.5 text-xs gap-1.5'
    : 'px-4 py-2 text-sm gap-2';

  const handleExcel = () => {
    exportToExcelFile(excelData, `${filename}.xlsx`, title);
    setOpen(false);
  };

  const handlePdf = () => {
    exportToPdfFile(title, tableHeaders, tableRows, `${filename}.pdf`);
    setOpen(false);
  };

  const handleWord = async () => {
    await exportToWordFile(title, tableHeaders, tableRows, `${filename}.docx`);
    setOpen(false);
  };

  const handlePptx = () => {
    exportToPptxFile(title, tableHeaders, tableRows, `${filename}.pptx`);
    setOpen(false);
  };

  const items = [
    {
      key: 'excel' as const,
      label: isKm ? 'តារាង Excel (.xlsx)' : 'Excel Spreadsheet (.xlsx)',
      desc: isKm ? 'ទិន្នន័យតារាងពេញលេញ' : 'Full spreadsheet data',
      icon: <FileXls size={17} weight="fill" className="text-emerald-500 shrink-0" />,
      hoverClass: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300',
      onClick: handleExcel,
    },
    {
      key: 'pdf' as const,
      label: isKm ? 'ឯកសារ PDF (.pdf)' : 'PDF Document (.pdf)',
      desc: isKm ? 'ទម្រង់ PDF ផ្លូវការ' : 'Printable PDF report',
      icon: <FilePdf size={17} weight="fill" className="text-rose-500 shrink-0" />,
      hoverClass: 'hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300',
      onClick: handlePdf,
    },
    {
      key: 'word' as const,
      label: isKm ? 'ឯកសារ Word (.docx)' : 'Word Document (.docx)',
      desc: isKm ? 'ទម្រង់ Word ស្ថាប័ន' : 'Official document format',
      icon: <FileDoc size={17} weight="fill" className="text-blue-500 shrink-0" />,
      hoverClass: 'hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300',
      onClick: handleWord,
    },
    {
      key: 'pptx' as const,
      label: isKm ? 'ស្លាយ PowerPoint (.pptx)' : 'PowerPoint (.pptx)',
      desc: isKm ? 'ស្លាយបទបង្ហាញ' : 'Presentation slides',
      icon: <FilePpt size={17} weight="fill" className="text-amber-500 shrink-0" />,
      hoverClass: 'hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300',
      onClick: handlePptx,
    },
  ].filter((item) => formats.includes(item.key));

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center font-semibold rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1c1d25] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition cursor-pointer shadow-xs ${btnSize}`}
      >
        <DownloadSimple size={size === 'sm' ? 14 : 16} weight="bold" className="text-blue-500" />
        <span>{label ?? (isKm ? 'ទាញយក' : 'Export')}</span>
        <CaretDown size={11} className={`text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-60 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1a1d26] shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isKm ? 'ជ្រើសរើសទម្រង់ការទាញយក' : 'Choose export format'}
            </p>
          </div>

          {items.map((item) => (
            <button
              key={item.key}
              onClick={item.onClick}
              className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-slate-700 dark:text-slate-300 transition text-left cursor-pointer ${item.hoverClass}`}
            >
              <div className="mt-0.5">{item.icon}</div>
              <div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
