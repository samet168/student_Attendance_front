'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MagnifyingGlass,
  Funnel,
  FileArrowDown,
  FileXls,
  FilePdf,
  FileDoc,
  Presentation,
  ArrowsDownUp,
  SquaresFour,
  ListDashes,
  DotsSixVertical,
  Star,
  Plus,
  Trash,
  PencilSimple,
  ArrowClockwise,
  CheckSquare,
  Square,
  CaretDown,
  Check,
  Tag,
  ArrowsLeftRight,
  DownloadSimple,
} from '@phosphor-icons/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow as DocxTableRow, WidthType, TextRun } from 'docx';
import pptxgen from 'pptxgenjs';

export interface EnterpriseRecord {
  id: string | number;
  code: string;
  name: string;
  category: string;
  department: string;
  amountOrScore: string | number;
  status: 'Paid' | 'Pending' | 'Rejected' | 'Returned' | 'Active' | 'Inactive';
  date: string;
  avatarText?: string;
  avatarBg?: string;
  isFavorite?: boolean;
  email?: string;
  phone?: string;
  raw?: any;
}

interface EnterpriseDataViewProps {
  title?: string;
  initialRecords: EnterpriseRecord[];
  isKm?: boolean;
  onAddNew?: () => void;
  onEdit?: (record: EnterpriseRecord) => void;
  onDelete?: (record: EnterpriseRecord) => void;
  onTransfer?: (record: EnterpriseRecord) => void;
  storageKey?: string;
}

// ----------------------------------------------------
// Sortable Card Item (Grid View)
// ----------------------------------------------------
function SortableGridCard({
  record,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  isKm,
}: {
  record: EnterpriseRecord;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isKm: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: record.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Active':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Rejected':
      case 'Inactive':
        return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      case 'Returned':
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      default:
        return 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-3xl border p-4.5 bg-white dark:bg-[#15171e] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15]'
      }`}
    >
      <div>
        {/* Top Handle / Checkbox / Favorite */}
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSelect}
              className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition cursor-pointer"
            >
              {isSelected ? (
                <CheckSquare size={18} weight="fill" className="text-blue-500" />
              ) : (
                <Square size={18} />
              )}
            </button>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-slate-400/80 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
              title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
            >
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <button
              onClick={onToggleFavorite}
              className={`p-1 rounded transition cursor-pointer hover:bg-amber-500/10 ${
                record.isFavorite ? 'text-amber-400' : 'text-slate-400/80 hover:text-amber-400'
              }`}
            >
              <Star size={16} weight={record.isFavorite ? 'fill' : 'regular'} />
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">{record.date}</span>
        </div>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm ${
              record.avatarBg || 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600'
            }`}
          >
            {record.avatarText || record.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{record.name}</h4>
            <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate">{record.code}</p>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="space-y-1.5 py-2.5 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{isKm ? 'ប្រភេទ/មុខវិជ្ជា:' : 'Category:'}</span>
            <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{record.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{isKm ? 'ថ្នាក់/ដេប៉ាតឺម៉ង់:' : 'Dept/Class:'}</span>
            <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{record.department}</span>
          </div>
        </div>
      </div>

      {/* Footer: Status Pill & Amount/Score */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
            record.status
          )}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{record.status}</span>
        </span>

        <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
          {record.amountOrScore}
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Sortable Table Row (List View)
// ----------------------------------------------------
function SortableTableRow({
  record,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  onTransfer,
  isKm,
}: {
  record: EnterpriseRecord;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTransfer?: () => void;
  isKm: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: record.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Active':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Rejected':
      case 'Inactive':
        return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      case 'Returned':
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      default:
        return 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]';
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 dark:border-white/[0.06] transition ${
        isSelected
          ? 'bg-blue-500/[0.08] dark:bg-blue-500/[0.12]'
          : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.03] bg-white dark:bg-transparent'
      }`}
    >
      {/* Checkbox */}
      <td className="py-3 px-3 w-10 text-center">
        <button
          onClick={onToggleSelect}
          className="p-1 rounded text-slate-400 hover:text-blue-500 transition cursor-pointer"
        >
          {isSelected ? (
            <CheckSquare size={17} weight="fill" className="text-blue-500" />
          ) : (
            <Square size={17} />
          )}
        </button>
      </td>

      {/* Drag Handle */}
      <td className="py-3 px-2 w-8 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
          title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
        >
          <DotsSixVertical size={17} weight="bold" />
        </button>
      </td>

      {/* Favorite Star */}
      <td className="py-3 px-2 w-8 text-center">
        <button
          onClick={onToggleFavorite}
          className={`p-0.5 rounded transition cursor-pointer hover:bg-amber-500/10 ${
            record.isFavorite ? 'text-amber-400' : 'text-slate-400/80 hover:text-amber-400'
          }`}
        >
          <Star size={16} weight={record.isFavorite ? 'fill' : 'regular'} />
        </button>
      </td>

      {/* Name / Avatar / Code */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
              record.avatarBg || 'bg-gradient-to-tr from-blue-600 to-indigo-600'
            }`}
          >
            {record.avatarText || record.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{record.name}</p>
            <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{record.code}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
        {record.category}
      </td>

      {/* Department / Class */}
      <td className="py-3 px-4 text-xs">
        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          {record.department}
        </span>
      </td>

      {/* Amount / Score */}
      <td className="py-3 px-4 font-mono font-bold text-xs text-slate-900 dark:text-white">
        {record.amountOrScore}
      </td>

      {/* Status Badge */}
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
            record.status
          )}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{record.status}</span>
        </span>
      </td>

      {/* Date */}
      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
        {record.date}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/15 rounded-lg transition cursor-pointer"
              title={isKm ? 'កែប្រែ' : 'Edit'}
            >
              <PencilSimple size={14} />
            </button>
          )}
          {onTransfer && (
            <button
              onClick={onTransfer}
              className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/15 rounded-lg transition cursor-pointer"
              title={isKm ? 'ផ្ទេរ' : 'Transfer'}
            >
              <ArrowsLeftRight size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
              title={isKm ? 'លុប' : 'Delete'}
            >
              <Trash size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ----------------------------------------------------
// Main Enterprise Data View Component
// ----------------------------------------------------
export function EnterpriseDataView({
  title = 'Approvals & Roster Records',
  initialRecords,
  isKm = true,
  onAddNew,
  onEdit,
  onDelete,
  onTransfer,
  storageKey = 'enterprise_records_order',
}: EnterpriseDataViewProps) {
  const [records, setRecords] = useState<EnterpriseRecord[]>(initialRecords);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomOrder, setIsCustomOrder] = useState(false);

  // Popover & Dropdowns State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Filters State
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string>('none');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Sort State
  const [sortField, setSortField] = useState<'date' | 'amount' | 'name' | 'code'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load Initial Custom Order from LocalStorage
  useEffect(() => {
    setRecords(initialRecords);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const orderIds: (string | number)[] = JSON.parse(saved);
        if (Array.isArray(orderIds) && orderIds.length > 0) {
          const map = new Map(initialRecords.map((r) => [String(r.id), r]));
          const sorted: EnterpriseRecord[] = [];
          orderIds.forEach((id) => {
            const item = map.get(String(id));
            if (item) {
              sorted.push(item);
              map.delete(String(id));
            }
          });
          map.forEach((item) => sorted.push(item));
          setRecords(sorted);
          setIsCustomOrder(true);
        }
      }
    } catch {
      // ignore
    }
  }, [initialRecords, storageKey]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = records.findIndex((item) => item.id === active.id);
      const newIndex = records.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(records, oldIndex, newIndex);
      setRecords(reordered);
      setIsCustomOrder(true);
      localStorage.setItem(storageKey, JSON.stringify(reordered.map((r) => r.id)));
    }
  };

  const handleResetOrder = () => {
    setRecords(initialRecords);
    setIsCustomOrder(false);
    localStorage.removeItem(storageKey);
  };

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        rec.name.toLowerCase().includes(q) ||
        rec.code.toLowerCase().includes(q) ||
        rec.category.toLowerCase().includes(q) ||
        rec.department.toLowerCase().includes(q) ||
        String(rec.amountOrScore).toLowerCase().includes(q);

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(rec.status);

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(rec.category);

      const matchesFavorites = !favoritesOnly || rec.isFavorite;

      return matchesSearch && matchesStatus && matchesCategory && matchesFavorites;
    });
  }, [records, searchQuery, selectedStatuses, selectedCategories, favoritesOnly]);

  // Multi-Select Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  const handleToggleSelectOne = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleFavorite = (id: string | number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  // ----------------------------------------------------
  // Multi-Format Export Methods (Excel, PDF, Word, PPTX, CSV)
  // ----------------------------------------------------
  const getExportData = () => {
    const itemsToExport =
      selectedIds.size > 0
        ? filteredRecords.filter((r) => selectedIds.has(r.id))
        : filteredRecords;

    return itemsToExport;
  };

  const handleExportExcel = () => {
    const items = getExportData();
    const cleanData = items.map((item) => ({
      Code: item.code,
      Name: item.name,
      Category: item.category,
      Department: item.department,
      Amount_Score: item.amountOrScore,
      Status: item.status,
      Date: item.date,
    }));
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');
    XLSX.writeFile(wb, `school_records_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setIsExportOpen(false);
  };

  const handleExportPdf = () => {
    const items = getExportData();
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Total: ${items.length} records`, 14, 22);

    const headers = ['Code', 'Name', 'Category', 'Dept/Class', 'Amount/Score', 'Status', 'Date'];
    const rows = items.map((r) => [
      String(r.code),
      String(r.name),
      String(r.category),
      String(r.department),
      String(r.amountOrScore),
      String(r.status),
      String(r.date),
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });

    doc.save(`school_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setIsExportOpen(false);
  };

  const handleExportWord = async () => {
    const items = getExportData();
    const headers = ['CODE', 'NAME', 'CATEGORY', 'DEPARTMENT', 'AMOUNT/SCORE', 'STATUS', 'DATE'];
    const headerRow = new DocxTableRow({
      children: headers.map((h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })),
    });

    const dataRows = items.map(
      (r) =>
        new DocxTableRow({
          children: [r.code, r.name, r.category, r.department, String(r.amountOrScore), r.status, r.date].map(
            (c) => new TableCell({ children: [new Paragraph(String(c))] })),
        })
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: title, heading: 'Heading1' }),
            new Paragraph({ text: `Export Date: ${new Date().toLocaleDateString()}` }),
            new DocxTable({
              rows: [headerRow, ...dataRows],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `school_records_${new Date().toISOString().slice(0, 10)}.docx`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const handleExportPptx = () => {
    const items = getExportData();
    const pptx = new pptxgen();
    const slide = pptx.addSlide();

    slide.addText(title, {
      x: 0.5,
      y: 0.5,
      fontSize: 20,
      bold: true,
      color: '2563EB',
    });

    const headers = [
      { text: 'CODE', options: { bold: true, fill: { color: '2563EB' }, color: 'FFFFFF' } },
      { text: 'NAME', options: { bold: true, fill: { color: '2563EB' }, color: 'FFFFFF' } },
      { text: 'CATEGORY', options: { bold: true, fill: { color: '2563EB' }, color: 'FFFFFF' } },
      { text: 'DEPARTMENT', options: { bold: true, fill: { color: '2563EB' }, color: 'FFFFFF' } },
      { text: 'STATUS', options: { bold: true, fill: { color: '2563EB' }, color: 'FFFFFF' } },
      { text: 'DATE', options: { bold: true, fill: { color: '2563EB' }, color: 'FFFFFF' } },
    ];

    const rows = items.slice(0, 12).map((r) => [
      { text: r.code },
      { text: r.name },
      { text: r.category },
      { text: r.department },
      { text: r.status },
      { text: r.date },
    ]);

    slide.addTable([headers, ...rows] as any, { x: 0.5, y: 1.2, w: 9.0, autoPage: true });
    pptx.writeFile({ fileName: `presentation_records_${new Date().toISOString().slice(0, 10)}.pptx` });
    setIsExportOpen(false);
  };

  // Sorting
  const handleSortSelect = (field: 'date' | 'amount' | 'name' | 'code') => {
    const newOrder = sortField === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...records].sort((a, b) => {
      let valA: any = a[field === 'amount' ? 'amountOrScore' : field];
      let valB: any = b[field === 'amount' ? 'amountOrScore' : field];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return newOrder === 'asc' ? -1 : 1;
      if (valA > valB) return newOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setRecords(sorted);
    setIsSortOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>{isKm ? '+ បញ្ចូលថ្មី' : '+ New Claim'}</span>
            </button>
          )}
        </div>

        {/* Search, Filter Popover, Export, Sort, View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box with Inside Filter Funnel Button */}
          <div className="relative flex-1 sm:w-80">
            <MagnifyingGlass
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={isKm ? 'ស្វែងរកតាមឈ្មោះ កូដ ស្ថានភាព ឬចំនួន...' : 'Search claims, or filter by status, category, amount...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#15171e] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs font-medium"
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition cursor-pointer ${
                selectedStatuses.length > 0 || selectedCategories.length > 0 || favoritesOnly
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
              }`}
              title={isKm ? 'តម្រងកម្រិតខ្ពស់' : 'Advanced Filters'}
            >
              <Funnel size={14} weight={selectedStatuses.length > 0 ? 'fill' : 'bold'} />
            </button>

            {/* 3-Column Advanced Filters Popover */}
            {isFilterOpen && (
              <div className="absolute left-0 sm:left-auto right-0 mt-2 w-full sm:w-[500px] bg-white dark:bg-[#1a1d26] border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  {/* Column 1: Filters */}
                  <div className="space-y-3">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Funnel size={12} weight="bold" className="text-blue-500" />
                      <span>{isKm ? 'តម្រង (FILTERS)' : 'FILTERS'}</span>
                    </span>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{isKm ? 'ស្ថានភាព' : 'STATUS'}</span>
                      {['Pending', 'Approved', 'Paid', 'Rejected', 'Returned'].map((st) => (
                        <label key={st} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(st)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStatuses([...selectedStatuses, st]);
                              else setSelectedStatuses(selectedStatuses.filter((s) => s !== st));
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{st}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{isKm ? 'ប្រភេទ' : 'CATEGORY'}</span>
                      {['Tuition Fee', 'Exam', 'Uniform', 'Transport'].map((cat) => (
                        <label key={cat} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCategories([...selectedCategories, cat]);
                              else setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Group By */}
                  <div className="space-y-3">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag size={12} weight="bold" className="text-purple-500" />
                      <span>{isKm ? 'ក្រុមតាម (GROUP BY)' : 'GROUP BY'}</span>
                    </span>
                    <div className="space-y-1.5">
                      {['Status', 'Employee/Student', 'Category', 'Department', 'Currency', 'Submitted (month)'].map((grp) => (
                        <label key={grp} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                          <input
                            type="radio"
                            name="groupByRadio"
                            checked={groupBy === grp}
                            onChange={() => setGroupBy(grp)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>{grp}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Favorites */}
                  <div className="space-y-3">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Star size={12} weight="bold" className="text-amber-500" />
                      <span>{isKm ? 'ចំណូលចិត្ត (FAVORITES)' : 'FAVORITES'}</span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {isKm ? 'រក្សាទុកតម្រងបច្ចុប្បន្នដើម្បីប្រើពេលក្រោយ' : 'Save the current filters to reuse them later.'}
                    </p>
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={favoritesOnly}
                        onChange={(e) => setFavoritesOnly(e.target.checked)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                      />
                      <span>{isKm ? 'បង្ហាញតែផ្កាយ ☆' : 'Starred Only'}</span>
                    </label>
                  </div>
                </div>

                {/* Footer of Popover */}
                <div className="flex items-center justify-between pt-4 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium font-mono">
                    {filteredRecords.length} records match
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedStatuses([]);
                        setSelectedCategories([]);
                        setGroupBy('none');
                        setFavoritesOnly(false);
                      }}
                      className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      {isKm ? 'សម្អាតទាំងអស់' : 'Clear all'}
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-sm"
                    >
                      {isKm ? 'រួចរាល់' : 'Done'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#15171e] text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/[0.06] transition cursor-pointer shadow-xs"
            >
              <FileArrowDown size={15} weight="bold" className="text-blue-500" />
              <span>{isKm ? 'ទាញយក' : 'Export'}</span>
              <CaretDown size={11} className="text-slate-400" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.1] py-2 z-50 animate-in fade-in duration-100 backdrop-blur-xl text-xs">
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-left cursor-pointer"
                >
                  <FileXls size={16} weight="fill" className="text-emerald-500" />
                  <span>Excel Spreadsheet (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition text-left cursor-pointer"
                >
                  <FilePdf size={16} weight="fill" className="text-rose-500" />
                  <span>PDF Document (.pdf)</span>
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition text-left cursor-pointer"
                >
                  <FileDoc size={16} weight="fill" className="text-blue-500" />
                  <span>Word Document (.docx)</span>
                </button>
                <button
                  onClick={handleExportPptx}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition text-left cursor-pointer"
                >
                  <Presentation size={16} weight="fill" className="text-amber-500" />
                  <span>PowerPoint (.pptx)</span>
                </button>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#15171e] text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/[0.06] transition cursor-pointer shadow-xs"
            >
              <ArrowsDownUp size={15} weight="bold" />
              <span>{isKm ? 'តម្រៀបតាម' : 'Sort by'}</span>
              <CaretDown size={11} className="text-slate-400" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.1] py-2 z-50 animate-in fade-in duration-100 text-xs">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isKm ? 'ជម្រើសតម្រៀប' : 'SORT BY'}
                </div>
                {[
                  { field: 'date', label: isKm ? 'កាលបរិច្ឆេទ (Date)' : 'Submitted Date' },
                  { field: 'amount', label: isKm ? 'ចំនួនទឹកប្រាក់/ពិន្ទុ' : 'Amount / Score' },
                  { field: 'name', label: isKm ? 'ឈ្មោះបុគ្គលិក/សិស្ស' : 'Employee / Student' },
                  { field: 'code', label: isKm ? 'លេខកូដសម្គាល់' : 'Claim Code' },
                ].map((item) => (
                  <button
                    key={item.field}
                    onClick={() => handleSortSelect(item.field as any)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition text-left cursor-pointer"
                  >
                    <span>{item.label}</span>
                    {sortField === item.field && <Check size={14} className="text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center p-1 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#15171e] shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={isKm ? 'ទិដ្ឋភាពក្រឡា (Grid View)' : 'Grid View'}
            >
              <SquaresFour size={16} weight="bold" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={isKm ? 'ទិដ្ឋភាពតារាង (Table View)' : 'Table View'}
            >
              <ListDashes size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Order Banner */}
      <div className="flex items-center justify-between px-4.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#15171e] border border-slate-200/80 dark:border-white/[0.07] text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <DotsSixVertical size={16} weight="bold" className="text-blue-500 shrink-0" />
          <span>
            {isKm
              ? 'លំដាប់ផ្ទាល់ខ្លួន — អូសទាញកំណត់ត្រាតាមប៊ូតុងចំណុច ៦ ដើម្បីផ្លាស់ទីឡើងលើ ឬចុះក្រោម · រក្សាទុកលើឧបករណ៍នេះ'
              : 'Custom order — drag a record by its handle to move it up or down · saved on this device'}
          </span>
        </div>
        {isCustomOrder && (
          <button
            onClick={handleResetOrder}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
          >
            <ArrowClockwise size={12} weight="bold" />
            <span>{isKm ? 'កំណត់លំដាប់ឡើងវិញ' : 'Reset order'}</span>
          </button>
        )}
      </div>

      {/* Select All Bar & Batch Action Bar */}
      <div className="flex items-center justify-between py-1 px-1">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filteredRecords.length > 0 && selectedIds.size === filteredRecords.length}
            onChange={handleToggleSelectAll}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            {isKm
              ? `ជ្រើសរើសទាំងអស់ (${filteredRecords.length} កំណត់ត្រាលើទំព័រនេះ)`
              : `Select all ${filteredRecords.length} on this page`}
          </span>
        </label>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 px-3 py-1 rounded-xl font-mono">
              {selectedIds.size} {isKm ? 'បានជ្រើសរើស' : 'selected'}
            </span>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
            >
              <DownloadSimple size={14} weight="bold" />
              <span>{isKm ? 'ទាញយកដែលបានជ្រើស' : 'Export Selected'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Data Container (Dnd Sortable Context) */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {viewMode === 'grid' ? (
          <SortableContext items={filteredRecords.map((r) => r.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
              {filteredRecords.map((record) => (
                <SortableGridCard
                  key={record.id}
                  record={record}
                  isSelected={selectedIds.has(record.id)}
                  onToggleSelect={() => handleToggleSelectOne(record.id)}
                  onToggleFavorite={() => handleToggleFavorite(record.id)}
                  onEdit={() => onEdit && onEdit(record)}
                  onDelete={() => onDelete && onDelete(record)}
                  isKm={isKm}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-[#181a24]/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-10 text-center"></th>
                  <th className="py-3.5 px-2 w-8 text-center"></th>
                  <th className="py-3.5 px-2 w-8 text-center"></th>
                  <th className="py-3.5 px-4">{isKm ? 'បុគ្គលិក / សិស្ស' : 'Employee / Student'}</th>
                  <th className="py-3.5 px-4">{isKm ? 'ប្រភេទ' : 'Category'}</th>
                  <th className="py-3.5 px-4">{isKm ? 'ដេប៉ាតឺម៉ង់ / ថ្នាក់' : 'Department'}</th>
                  <th className="py-3.5 px-4">{isKm ? 'ចំនួនទឹកប្រាក់ / ពិន្ទុ' : 'Amount'}</th>
                  <th className="py-3.5 px-4">{isKm ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className="py-3.5 px-4">{isKm ? 'កាលបរិច្ឆេទ' : 'Submitted Date'}</th>
                  <th className="py-3.5 px-4 text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <SortableContext items={filteredRecords.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {filteredRecords.map((record) => (
                    <SortableTableRow
                      key={record.id}
                      record={record}
                      isSelected={selectedIds.has(record.id)}
                      onToggleSelect={() => handleToggleSelectOne(record.id)}
                      onToggleFavorite={() => handleToggleFavorite(record.id)}
                      onEdit={() => onEdit && onEdit(record)}
                      onDelete={() => onDelete && onDelete(record)}
                      onTransfer={() => onTransfer && onTransfer(record)}
                      isKm={isKm}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        )}
      </DndContext>
    </div>
  );
}

export default EnterpriseDataView;
