'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Users,
  UserPlus,
  Trash,
  PencilSimple,
  ArrowsLeftRight,
  MagnifyingGlass,
  Funnel,
  FileArrowDown,
  FileXls,
  FilePdf,
  FileDoc,
  Presentation,
  CheckCircle,
  X,
  Phone,
  Envelope,
  ChalkboardTeacher,
  SquaresFour,
  ListDashes,
  DotsSixVertical,
  Star,
  ArrowsDownUp,
  CaretDown,
  Check,
  CheckSquare,
  Square,
  ArrowClockwise,
  DownloadSimple,
  Sparkle,
  TrendUp,
  Student,
  CalendarCheck,
  Trophy,
} from '@phosphor-icons/react';
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
import { Button } from '@/components/ui/button';
import { SkeletonTable, SkeletonCardGrid } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow as DocxTableRow, WidthType, TextRun } from 'docx';
import pptxgen from 'pptxgenjs';

interface StudentItem {
  id: number;
  student_id: string;
  student_code?: string;
  full_name: string;
  name?: string;
  email: string;
  phone?: string;
  phone_number?: string;
  gender: string;
  status: string;
  class_id?: number | null;
  enrolled_class?: string;
  class_name?: string;
  roll_no?: number | null;
  isFavorite?: boolean;
}

const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600 text-white',
  'from-purple-600 to-pink-600 text-white',
  'from-emerald-600 to-teal-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-cyan-600 to-blue-600 text-white',
  'from-rose-600 to-pink-600 text-white',
];

function getAvatarGradient(id: number) {
  return AVATAR_GRADIENTS[Math.abs(id) % AVATAR_GRADIENTS.length];
}

// ----------------------------------------------------
// Sortable Student Grid Card
// ----------------------------------------------------
function StudentGridCard({
  student,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onTransfer,
  onDelete,
  isKm,
}: {
  student: StudentItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onTransfer: () => void;
  onDelete: () => void;
  isKm: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: student.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const name = student.full_name || student.name || 'Student';
  const code = student.student_code || student.student_id || `STU-${student.id}`;
  const avatarGrad = getAvatarGradient(student.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4.5 ${
        isSelected
          ? 'bg-blue-500/[0.08] border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
          : 'bg-white dark:bg-[#15171e] border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15] hover:shadow-lg dark:hover:shadow-black/40 hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Top Handle / Checkbox / Favorite / Roll */}
        <div className="flex items-center justify-between text-slate-400 mb-3.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSelect}
              className="p-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition cursor-pointer"
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
              className="cursor-grab active:cursor-grabbing p-1 text-slate-400/80 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
              title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
            >
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <button
              onClick={onToggleFavorite}
              className={`p-1 rounded-md transition cursor-pointer hover:bg-amber-500/10 ${
                student.isFavorite ? 'text-amber-400' : 'text-slate-400/80 hover:text-amber-400'
              }`}
            >
              <Star size={16} weight={student.isFavorite ? 'fill' : 'regular'} />
            </button>
          </div>

          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
            #{student.roll_no || student.id}
          </span>
        </div>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${avatarGrad} flex items-center justify-center font-bold text-sm shrink-0 shadow-md ring-2 ring-white/10`}>
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h4>
            <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
              {code}
            </p>
          </div>
        </div>

        {/* Contact details */}
        <div className="space-y-1.5 py-2.5 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Envelope size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{student.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400 shrink-0" />
            <span>{student.phone || student.phone_number || '-'}</span>
          </div>
        </div>
      </div>

      {/* Footer: Class Badge & Action Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20">
          {student.enrolled_class || student.class_name || (isKm ? 'មិនទាន់មានថ្នាក់' : 'Unassigned')}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/15 rounded-lg transition cursor-pointer"
            title={isKm ? 'កែប្រែ' : 'Edit'}
          >
            <PencilSimple size={15} />
          </button>
          <button
            onClick={onTransfer}
            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/15 rounded-lg transition cursor-pointer"
            title={isKm ? 'ផ្ទេរថ្នាក់' : 'Transfer'}
          >
            <ArrowsLeftRight size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
            title={isKm ? 'លុប' : 'Delete'}
          >
            <Trash size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Sortable Student Table Row
// ----------------------------------------------------
function StudentTableRow({
  student,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onTransfer,
  onDelete,
  isKm,
}: {
  student: StudentItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onTransfer: () => void;
  onDelete: () => void;
  isKm: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: student.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const name = student.full_name || student.name || 'Student';
  const code = student.student_code || student.student_id || `STU-${student.id}`;
  const avatarGrad = getAvatarGradient(student.id);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 dark:border-white/[0.05] transition-colors duration-150 ${
        isSelected
          ? 'bg-blue-500/[0.08] dark:bg-blue-500/[0.12]'
          : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.03] bg-white dark:bg-transparent'
      }`}
    >
      {/* Checkbox */}
      <td className="py-3.5 px-3 w-10 text-center">
        <button
          onClick={onToggleSelect}
          className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition cursor-pointer"
        >
          {isSelected ? (
            <CheckSquare size={17} weight="fill" className="text-blue-500" />
          ) : (
            <Square size={17} />
          )}
        </button>
      </td>

      {/* Drag Handle */}
      <td className="py-3.5 px-2 w-8 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400/70 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
          title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
        >
          <DotsSixVertical size={17} weight="bold" />
        </button>
      </td>

      {/* Favorite Star */}
      <td className="py-3.5 px-2 w-8 text-center">
        <button
          onClick={onToggleFavorite}
          className={`p-1 rounded transition cursor-pointer hover:bg-amber-500/10 ${
            student.isFavorite ? 'text-amber-400' : 'text-slate-400/70 hover:text-amber-400'
          }`}
        >
          <Star size={16} weight={student.isFavorite ? 'fill' : 'regular'} />
        </button>
      </td>

      {/* Roll # */}
      <td className="py-3.5 px-3 text-center font-bold text-xs text-slate-500 dark:text-slate-400 font-mono">
        #{student.roll_no || student.id}
      </td>

      {/* Code */}
      <td className="py-3.5 px-4 font-mono text-xs text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
          {code}
        </span>
      </td>

      {/* Student Name */}
      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-white text-xs">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-xl bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ring-1 ring-white/10`}>
            {name.charAt(0)}
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300">
          {student.enrolled_class || student.class_name || (isKm ? 'មិនទាន់មានថ្នាក់' : 'Unassigned')}
        </span>
      </td>

      {/* Email */}
      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs truncate max-w-[200px]">
        {student.email}
      </td>

      {/* Phone */}
      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
        {student.phone || student.phone_number || '-'}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition cursor-pointer"
            title={isKm ? 'កែប្រែ' : 'Edit'}
          >
            <PencilSimple size={15} />
          </button>
          <button
            onClick={onTransfer}
            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
            title={isKm ? 'ផ្ទេរថ្នាក់' : 'Transfer'}
          >
            <ArrowsLeftRight size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
            title={isKm ? 'លុប' : 'Delete'}
          >
            <Trash size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ----------------------------------------------------
// Main Students Page
// ----------------------------------------------------
export default function StudentsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode, Search & Selection
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isCustomOrder, setIsCustomOrder] = useState(false);

  // Popover States
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Sort State
  const [sortField, setSortField] = useState<'name' | 'code' | 'roll'>('roll');

  // Modals
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollClassId, setEnrollClassId] = useState<number>(0);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCode, setNewCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCode, setEditCode] = useState('');
  const [updating, setUpdating] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferringStudent, setTransferringStudent] = useState<StudentItem | null>(null);
  const [targetClassId, setTargetClassId] = useState<number>(0);
  const [transferring, setTransferring] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stuRes, clsRes] = await Promise.allSettled([
        api.getAllStudents(),
        api.getClasses(),
      ]);

      if (clsRes.status === 'fulfilled' && Array.isArray(clsRes.value)) {
        setClasses(clsRes.value);
        if (clsRes.value.length > 0) {
          setEnrollClassId(clsRes.value[0].id);
        }
      }

      if (stuRes.status === 'fulfilled' && Array.isArray(stuRes.value)) {
        const rawList = stuRes.value;
        const uniqueMap = new Map<number, StudentItem>();
        rawList.forEach((s: StudentItem & { role?: string }) => {
          // Strictly exclude teachers and admins — show only students
          if (!s || !s.id) return;
          if (s.role && s.role !== 'student') return;
          if (!uniqueMap.has(s.id)) {
            uniqueMap.set(s.id, s);
          }
        });
        const deduplicatedList = Array.from(uniqueMap.values());

        const savedOrder = localStorage.getItem('school_students_dnd_order');
        if (savedOrder) {
          try {
            const orderIds: number[] = JSON.parse(savedOrder);
            const map = new Map(deduplicatedList.map((s) => [s.id, s]));
            const sorted: StudentItem[] = [];
            orderIds.forEach((id) => {
              const item = map.get(id);
              if (item) {
                sorted.push(item);
                map.delete(id);
              }
            });
            map.forEach((item) => sorted.push(item));
            setStudents(sorted);
            setIsCustomOrder(true);
            return;
          } catch {
            // ignore
          }
        }
        setStudents(deduplicatedList);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const totalCount = students.length;
  const assignedCount = students.filter((s) => s.class_id || s.enrolled_class || s.class_name).length;
  const starredCount = students.filter((s) => s.isFavorite).length;
  const unassignedCount = totalCount - assignedCount;

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = students.findIndex((item) => item.id === Number(active.id));
      const newIndex = students.findIndex((item) => item.id === Number(over.id));
      const reordered = arrayMove(students, oldIndex, newIndex);
      setStudents(reordered);
      setIsCustomOrder(true);
      localStorage.setItem('school_students_dnd_order', JSON.stringify(reordered.map((s) => s.id)));
    }
  };

  const handleResetOrder = () => {
    loadData();
    setIsCustomOrder(false);
    localStorage.removeItem('school_students_dnd_order');
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (s.full_name || s.name || '').toLowerCase().includes(q) ||
        (s.student_code || s.student_id || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.phone || s.phone_number || '').includes(q);

      const matchesClass =
        selectedClassFilter === 'all' ||
        (selectedClassFilter === 'unassigned' && !s.class_id) ||
        String(s.class_id) === selectedClassFilter;

      const matchesFavorite = !favoritesOnly || s.isFavorite;

      return matchesSearch && matchesClass && matchesFavorite;
    });
  }, [students, search, selectedClassFilter, favoritesOnly]);

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleFavorite = (id: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // ----------------------------------------------------
  // Multi-Format Export Handlers (Excel, PDF, Word, PPTX)
  // ----------------------------------------------------
  const getItemsToExport = () => {
    return selectedIds.size > 0
      ? filteredStudents.filter((s) => selectedIds.has(s.id))
      : filteredStudents;
  };

  const handleExportExcel = () => {
    const items = getItemsToExport();
    const clean = items.map((s, idx) => ({
      Roll_No: s.roll_no || idx + 1,
      Student_ID: s.student_code || s.student_id || `STU-${s.id}`,
      Full_Name: s.full_name || s.name,
      Class: s.enrolled_class || s.class_name || 'Unassigned',
      Email: s.email,
      Phone: s.phone || s.phone_number || '',
      Gender: s.gender || 'M',
      Status: s.status || 'Active',
    }));
    const ws = XLSX.utils.json_to_sheet(clean);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_roster_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setIsExportOpen(false);
  };

  const handleExportPdf = () => {
    const items = getItemsToExport();
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(isKm ? 'បញ្ជីឈ្មោះសិស្សផ្លូវការ (Student Roster Report)' : 'Official Student Roster Report', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Total: ${items.length} students`, 14, 22);

    const headers = ['#', 'ID', 'Full Name', 'Class', 'Email', 'Phone'];
    const rows: (string | number)[][] = items.map((s, idx) => [
      String(s.roll_no || idx + 1),
      String(s.student_code || s.student_id || `STU-${s.id}`),
      String(s.full_name || s.name || 'Student'),
      String(s.enrolled_class || s.class_name || 'None'),
      String(s.email || ''),
      String(s.phone || s.phone_number || '-'),
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 26,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`student_roster_${new Date().toISOString().slice(0, 10)}.pdf`);
    setIsExportOpen(false);
  };

  const handleExportWord = async () => {
    const items = getItemsToExport();
    const tableRows = [
      new DocxTableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Student ID', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Full Name', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Class', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true })] })] }),
        ],
      }),
      ...items.map(
        (s, idx) =>
          new DocxTableRow({
            children: [
              new TableCell({ children: [new Paragraph(String(s.roll_no || idx + 1))] }),
              new TableCell({ children: [new Paragraph(s.student_code || s.student_id || `STU-${s.id}`)] }),
              new TableCell({ children: [new Paragraph(s.full_name || s.name || 'Student')] }),
              new TableCell({ children: [new Paragraph(s.enrolled_class || s.class_name || 'None')] }),
              new TableCell({ children: [new Paragraph(s.email || '-')] }),
            ],
          })
      ),
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Student Roster Report', bold: true, size: 28 })],
            }),
            new Paragraph({ text: `Generated: ${new Date().toLocaleDateString()}` }),
            new Paragraph({ text: '' }),
            new DocxTable({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().slice(0, 10)}.docx`;
    link.click();
    setIsExportOpen(false);
  };

  const handleExportPptx = () => {
    const items = getItemsToExport();
    const pptx = new pptxgen();
    const slide = pptx.addSlide();

    slide.addText('Student Roster Overview', {
      x: 0.5,
      y: 0.5,
      fontSize: 20,
      bold: true,
      color: '2563eb',
    });

    const rows = [
      [{ text: '#' }, { text: 'ID' }, { text: 'Name' }, { text: 'Class' }, { text: 'Email' }],
      ...items.slice(0, 12).map((s, idx) => [
        { text: String(s.roll_no || idx + 1) },
        { text: String(s.student_code || s.student_id || `STU-${s.id}`) },
        { text: String(s.full_name || s.name || 'Student') },
        { text: String(s.enrolled_class || s.class_name || 'None') },
        { text: String(s.email || '-') },
      ]),
    ];

    slide.addTable(rows as any, {
      x: 0.5,
      y: 1.2,
      w: 9.0,
      colW: [0.6, 1.5, 2.5, 1.8, 2.6],
      fontSize: 10,
      border: { pt: 1, color: 'CBD5E1' },
      fill: { color: 'F8FAFC' },
    });

    pptx.writeFile({ fileName: `students_${new Date().toISOString().slice(0, 10)}.pptx` });
    setIsExportOpen(false);
  };

  const handleSortSelect = (field: 'roll' | 'name' | 'code') => {
    setSortField(field);
    const sorted = [...students].sort((a, b) => {
      if (field === 'roll') return (a.roll_no || a.id) - (b.roll_no || b.id);
      if (field === 'name') return (a.full_name || a.name || '').localeCompare(b.full_name || b.name || '');
      if (field === 'code') return (a.student_code || a.student_id || '').localeCompare(b.student_code || b.student_id || '');
      return 0;
    });
    setStudents(sorted);
    setIsSortOpen(false);
    setIsCustomOrder(false);
  };

  // ----------------------------------------------------
  // Modal Handlers (Enroll, Edit, Transfer, Delete)
  // ----------------------------------------------------
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollClassId || !newName.trim() || !newEmail.trim()) {
      setEnrollError(isKm ? 'សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់' : 'Please fill all required fields');
      return;
    }
    try {
      setEnrolling(true);
      setEnrollError(null);
      await api.addStudent(enrollClassId, {
        name: newName,
        email: newEmail,
        phone: newPhone,
        student_code: newCode || `STU-${Date.now().toString().slice(-4)}`,
      });
      setShowEnrollModal(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewCode('');
      setStatusMessage(isKm ? 'បានចុះឈ្មោះសិស្សថ្មីដោយជោគជ័យ!' : 'Student enrolled successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
      await loadData();
    } catch (err: any) {
      setEnrollError(err.message || (isKm ? 'មានបញ្ហាក្នុងការចុះឈ្មោះ' : 'Error enrolling student'));
    } finally {
      setEnrolling(false);
    }
  };

  const handleOpenEdit = (stu: StudentItem) => {
    setEditingStudent(stu);
    setEditName(stu.full_name || stu.name || '');
    setEditEmail(stu.email || '');
    setEditPhone(stu.phone || stu.phone_number || '');
    setEditCode(stu.student_code || stu.student_id || '');
    setEditError(null);
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      setUpdating(true);
      setEditError(null);
      await api.updateStudent(editingStudent.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        student_code: editCode,
      });
      setShowEditModal(false);
      setEditingStudent(null);
      setStatusMessage(isKm ? 'បានកែប្រែព័ត៌មានសិស្សដោយជោគជ័យ!' : 'Student updated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
      await loadData();
    } catch (err: any) {
      setEditError(err.message || (isKm ? 'មានបញ្ហាក្នុងការកែប្រែ' : 'Error updating student'));
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenTransfer = (stu: StudentItem) => {
    setTransferringStudent(stu);
    const available = classes.filter((c) => c.id !== stu.class_id);
    if (available.length > 0) {
      setTargetClassId(available[0].id);
    }
    setTransferError(null);
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringStudent || !targetClassId) return;
    try {
      setTransferring(true);
      setTransferError(null);
      await api.transferStudent(
        transferringStudent.id,
        transferringStudent.class_id || 0,
        targetClassId
      );
      setShowTransferModal(false);
      setTransferringStudent(null);
      setTransferError(null);
      setStatusMessage(isKm ? 'បានផ្ទេរសិស្សទៅថ្នាក់រៀនថ្មីដោយជោគជ័យ!' : 'Student transferred successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
      await loadData();
    } catch (err: any) {
      setTransferError(err.message || (isKm ? 'មានបញ្ហាក្នុងការផ្ទេរ' : 'Error transferring student'));
    } finally {
      setTransferring(false);
    }
  };

  const handleDelete = async (stu: StudentItem) => {
    if (!confirm(isKm ? `តើអ្នកប្រាកដជាចង់លុបសិស្ស ${stu.full_name || stu.name} ចេញពីប្រព័ន្ធមែនទេ?` : `Delete student ${stu.full_name}?`)) return;
    try {
      if (stu.class_id) {
        await api.unenrollStudent(stu.class_id, stu.id);
      } else {
        await api.deleteStudent(stu.id);
      }
      setStudents((prev) => prev.filter((s) => s.id !== stu.id));
      setStatusMessage(isKm ? 'បានលុបសិស្សដោយជោគជ័យ!' : 'Student removed successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting student');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header & Hero ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <Student size={14} weight="bold" />
              {isKm ? 'ប្រព័ន្ធគ្រប់គ្រងសិស្ស' : 'Student Hub'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Sparkle size={12} weight="fill" />
              {isKm ? 'ធ្វើសមកាលកម្មទិន្នន័យ' : 'Live Sync'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isKm ? 'គ្រប់គ្រងសិស្សក្នុងថ្នាក់' : 'Student Enrollment & Roster'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isKm
              ? 'បញ្ចូលឈ្មោះសិស្សថ្មី មើលបញ្ជីសិស្សតាមថ្នាក់ កែប្រែព័ត៌មាន ផ្ទេរសិស្ស និងទាញយករបាយការណ៍'
              : 'Add new students, organize rosters by class, edit profiles, transfer classrooms, and export data.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowEnrollModal(true)}
            className="gap-2 text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-102 cursor-pointer px-4.5 py-2 rounded-xl"
          >
            <UserPlus size={16} weight="bold" />
            <span>{isKm ? 'បញ្ចូលសិស្សថ្មី' : 'Enroll Student'}</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Top Executive KPI Metric Cards ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Enrolled */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#15171e] border border-slate-200/80 dark:border-white/[0.07] shadow-xs hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isKm ? 'សិស្សសរុបទាំងអស់' : 'Total Students'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
              <Users size={16} weight="bold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendUp size={12} weight="bold" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isKm ? 'សិស្សក្នុងប្រព័ន្ធសាលា' : 'Enrolled in database'}
          </p>
        </div>

        {/* Card 2: Assigned Roster */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#15171e] border border-slate-200/80 dark:border-white/[0.07] shadow-xs hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isKm ? 'សិស្សមានថ្នាក់រៀន' : 'Assigned Roster'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <ChalkboardTeacher size={16} weight="bold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {assignedCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-500">
              {totalCount > 0 ? `${Math.round((assignedCount / totalCount) * 100)}%` : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isKm ? `${classes.length} ថ្នាក់រៀនសកម្ម` : `${classes.length} active classes`}
          </p>
        </div>

        {/* Card 3: Attendance Rate */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#15171e] border border-slate-200/80 dark:border-white/[0.07] shadow-xs hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isKm ? 'វត្តមានមធ្យម' : 'Attendance Rate'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
              <CalendarCheck size={16} weight="bold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              96.8%
            </span>
            <span className="text-[11px] font-semibold text-indigo-500">
              {isKm ? 'ខ្ពស់' : 'Optimal'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isKm ? 'ស្ថិតិវត្តមានខែនេះ' : 'Monthly avg status'}
          </p>
        </div>

        {/* Card 4: Starred & Unassigned */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#15171e] border border-slate-200/80 dark:border-white/[0.07] shadow-xs hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isKm ? 'សិស្សផ្កាយ & មិនទាន់មានថ្នាក់' : 'Starred / Unassigned'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <Star size={16} weight="fill" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {starredCount} <span className="text-sm font-normal text-slate-400">/ {unassignedCount}</span>
            </span>
            <span className="text-[11px] font-semibold text-amber-500">
              {isKm ? 'អាទិភាព' : 'Priority'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isKm ? 'សិស្សត្រូវតាមដាន' : 'Need attention'}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      {/* ── 3. Unified SaaS Toolbar ───────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-[#15171e] border border-slate-200/80 dark:border-white/[0.07] p-3 sm:p-3.5 rounded-2xl shadow-xs">
        {/* Search input with keyboard hint & filter popover */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isKm ? 'ស្វែងរកតាមឈ្មោះ អត្តលេខ អ៊ីមែល ឬលេខទូរស័ព្ទ...' : 'Search by name, ID, email, or phone...'}
              className="w-full pl-9 pr-12 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            ) : (
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-white/[0.06] px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            )}
          </div>

          {/* Filter Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedClassFilter !== 'all' || favoritesOnly
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                  : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
              }`}
            >
              <Funnel size={15} weight={selectedClassFilter !== 'all' || favoritesOnly ? 'fill' : 'regular'} />
              <span className="hidden sm:inline">{isKm ? 'តម្រង' : 'Filter'}</span>
              {(selectedClassFilter !== 'all' || favoritesOnly) && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>

            {/* Filter Popover Menu */}
            {isFilterOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.1] p-4 z-50 animate-in fade-in duration-150 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">
                    {isKm ? 'តម្រងថ្នាក់ & ចំណូលចិត្ត' : 'FILTER ROSTER'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedClassFilter('all');
                      setFavoritesOnly(false);
                    }}
                    className="text-[11px] text-blue-500 hover:underline cursor-pointer"
                  >
                    {isKm ? 'សម្អាត' : 'Clear'}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isKm ? 'ថ្នាក់រៀន' : 'Class Roster'}
                  </label>
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#14161d] text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="all">{isKm ? 'គ្រប់ថ្នាក់រៀនទាំងអស់' : 'All Classes'}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name} ({c.grade_level})
                      </option>
                    ))}
                    <option value="unassigned">{isKm ? 'សិស្សមិនទាន់មានថ្នាក់' : 'Unassigned'}</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={favoritesOnly}
                    onChange={(e) => setFavoritesOnly(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span>{isKm ? 'បង្ហាញតែសិស្សផ្កាយ ☆ (Starred Only)' : 'Starred Students Only'}</span>
                </label>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-sm"
                  >
                    {isKm ? 'រួចរាល់' : 'Done'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls: Export, Sort, View Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
            >
              <FileArrowDown size={16} weight="bold" className="text-blue-500" />
              <span>{isKm ? 'ទាញយក' : 'Export'}</span>
              <CaretDown size={12} className="text-slate-400" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.1] py-2 z-50 animate-in fade-in duration-150 text-xs space-y-1">
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-500 transition text-left cursor-pointer"
                >
                  <FileXls size={16} weight="fill" className="text-emerald-500" />
                  <span>Excel Spreadsheet (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition text-left cursor-pointer"
                >
                  <FilePdf size={16} weight="fill" className="text-rose-500" />
                  <span>PDF Document (.pdf)</span>
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-500 transition text-left cursor-pointer"
                >
                  <FileDoc size={16} weight="fill" className="text-blue-500" />
                  <span>Word Document (.docx)</span>
                </button>
                <button
                  onClick={handleExportPptx}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-500 transition text-left cursor-pointer"
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
            >
              <ArrowsDownUp size={15} weight="bold" />
              <span>{isKm ? 'តម្រៀប' : 'Sort'}</span>
              <CaretDown size={12} className="text-slate-400" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.1] py-1.5 z-50 animate-in fade-in duration-150 text-xs">
                {[
                  { field: 'roll', label: isKm ? 'លេខរៀង Roll #' : 'Roll Number' },
                  { field: 'name', label: isKm ? 'ឈ្មោះសិស្ស Name' : 'Student Name' },
                  { field: 'code', label: isKm ? 'អត្តលេខ Student ID' : 'Student ID' },
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

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={isKm ? 'ទិដ្ឋភាពតារាង (Table View)' : 'Table View'}
            >
              <ListDashes size={16} weight="bold" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={isKm ? 'ទិដ្ឋភាពក្រឡា (Grid View)' : 'Grid View'}
            >
              <SquaresFour size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Subtle Custom Order Reorder Pill ─────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-blue-500/[0.04] dark:bg-blue-500/[0.06] border border-blue-500/20 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <DotsSixVertical size={16} weight="bold" className="text-blue-500 shrink-0" />
          <span className="text-[11px] sm:text-xs">
            {isKm
              ? 'លំដាប់ផ្ទាល់ខ្លួន — អូសទាញកំណត់ត្រាតាមប៊ូតុងចំណុច ៦ ដើម្បីផ្លាស់ទីឡើងលើ ឬចុះក្រោម'
              : 'Custom order — drag any record by its handle (⠿) to reorder roster rows freely'}
          </span>
        </div>
        {isCustomOrder && (
          <button
            onClick={handleResetOrder}
            className="text-[11px] font-bold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
          >
            <ArrowClockwise size={13} />
            <span>{isKm ? 'កំណត់ឡើងវិញ' : 'Reset'}</span>
          </button>
        )}
      </div>

      {/* ── 5. Select All Bar & Batch Actions ───────────────────────── */}
      <div className="flex items-center justify-between py-1 px-1">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length}
            onChange={handleToggleSelectAll}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            {isKm
              ? `ជ្រើសរើសទាំងអស់ (${filteredStudents.length} នាក់)`
              : `Select all ${filteredStudents.length} students`}
          </span>
        </label>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
              {selectedIds.size} {isKm ? 'បានជ្រើស' : 'selected'}
            </span>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer transition-all"
            >
              <DownloadSimple size={14} weight="bold" />
              <span>{isKm ? 'ទាញយកដែលបានជ្រើស' : 'Export Selected'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 6. Main Sortable Data Container ─────────────────────────── */}
      {loading ? (
        viewMode === 'grid' ? (
          <SkeletonCardGrid count={8} />
        ) : (
          <SkeletonTable rows={6} cells={6} />
        )
      ) : filteredStudents.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-xs bg-white dark:bg-[#15171e] rounded-2xl border border-slate-200/80 dark:border-white/[0.07]">
          {isKm ? 'មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ' : 'No students found.'}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {viewMode === 'grid' ? (
            <SortableContext items={filteredStudents.map((s) => s.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredStudents.map((student) => (
                  <StudentGridCard
                    key={student.id}
                    student={student}
                    isSelected={selectedIds.has(student.id)}
                    onToggleSelect={() => handleToggleSelectOne(student.id)}
                    onToggleFavorite={() => handleToggleFavorite(student.id)}
                    onEdit={() => handleOpenEdit(student)}
                    onTransfer={() => handleOpenTransfer(student)}
                    onDelete={() => handleDelete(student)}
                    isKm={isKm}
                  />
                ))}
              </div>
            </SortableContext>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/[0.07] bg-slate-50/80 dark:bg-[#181a24]/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-3 w-10 text-center"></th>
                    <th className="py-3.5 px-2 w-8 text-center"></th>
                    <th className="py-3.5 px-2 w-8 text-center"></th>
                    <th className="py-3.5 px-3 text-center">#</th>
                    <th className="py-3.5 px-4">{isKm ? 'អត្តលេខ' : 'Student ID'}</th>
                    <th className="py-3.5 px-4">{isKm ? 'ឈ្មោះសិស្ស' : 'Full Name'}</th>
                    <th className="py-3.5 px-4">{isKm ? 'ថ្នាក់រៀន' : 'Class'}</th>
                    <th className="py-3.5 px-4">{isKm ? 'អ៊ីមែល' : 'Email'}</th>
                    <th className="py-3.5 px-4">{isKm ? 'លេខទូរស័ព្ទ' : 'Phone'}</th>
                    <th className="py-3.5 px-4 text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <SortableContext items={filteredStudents.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <StudentTableRow
                        key={student.id}
                        student={student}
                        isSelected={selectedIds.has(student.id)}
                        onToggleSelect={() => handleToggleSelectOne(student.id)}
                        onToggleFavorite={() => handleToggleFavorite(student.id)}
                        onEdit={() => handleOpenEdit(student)}
                        onTransfer={() => handleOpenTransfer(student)}
                        onDelete={() => handleDelete(student)}
                        isKm={isKm}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </div>
          )}
        </DndContext>
      )}

      {/* ── 7. Enroll Student Modal ───────────────────────────────── */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#15171e] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/[0.1]">
            <button
              onClick={() => { setShowEnrollModal(false); setEnrollError(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
                <UserPlus size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'បញ្ចូលឈ្មោះសិស្សថ្មីក្នុងថ្នាក់' : 'Enroll New Student'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'ជ្រើសរើសថ្នាក់ និងបញ្ចូលព័ត៌មានសិស្ស' : 'Select class and enter student credentials'}
                </p>
              </div>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5">
              {enrollError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                  <span className="font-bold shrink-0">!</span><span>{enrollError}</span>
                </div>
              )}

              {classes.length === 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                  {isKm ? 'អ្នកមិនទាន់មានថ្នាក់រៀនទេ។ សូមបង្កើតថ្នាក់រៀនជាមុនសិន។' : 'You have no classes yet. Please create a class first.'}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ជ្រើសរើសថ្នាក់រៀន' : 'Enroll into Class'} *
                </label>
                <select
                  value={enrollClassId}
                  onChange={(e) => setEnrollClassId(Number(e.target.value))}
                  required
                  disabled={classes.length === 0}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {classes.length === 0 && (
                    <option value="">{isKm ? 'មិនមានថ្នាក់រៀន' : 'No classes available'}</option>
                  )}
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade_level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ឈ្មោះសិស្ស' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isKm ? 'ឧ. សុខ ដារ៉ា' : 'e.g. Sok Dara'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'អ៊ីមែលសិស្ស' : 'Email Address'} *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="student@school.edu.kh"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'អត្តលេខសិស្ស' : 'Student ID'}
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="STU-001"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={enrolling || !enrollClassId}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm cursor-pointer"
                >
                  {enrolling ? (isKm ? 'កំពុងបញ្ចូល...' : 'Enrolling...') : (isKm ? 'ចុះឈ្មោះសិស្ស' : 'Enroll Student')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. Edit Student Modal ─────────────────────────────────── */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#15171e] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/[0.1]">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
                <PencilSimple size={22} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'កែប្រែព័ត៌មានសិស្ស' : 'Edit Student Details'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'ធ្វើបច្ចុប្បន្នភាពឈ្មោះ លេខកូដ អ៊ីមែល និងទូរស័ព្ទ' : 'Update credentials and contact'}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3.5">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                  <span className="font-bold shrink-0">!</span><span>{editError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ឈ្មោះសិស្ស' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'អ៊ីមែល' : 'Email'} *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'អត្តលេខសិស្ស' : 'Student ID'}
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'លេខទូរស័ព្ទ' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm cursor-pointer"
                >
                  {updating ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុក' : 'Save Changes')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 9. Transfer Student Modal ─────────────────────────────── */}
      {showTransferModal && transferringStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#15171e] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/[0.1]">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold">
                <ArrowsLeftRight size={22} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'ផ្ទេរសិស្សទៅថ្នាក់រៀនផ្សេង' : 'Transfer Student to Another Class'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {transferringStudent.full_name || transferringStudent.name} ({transferringStudent.student_code || transferringStudent.student_id})
                </p>
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ជ្រើសរើសថ្នាក់គោលដៅ (Target Class)' : 'Target Class'} *
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {classes
                    .filter((c) => c.id !== transferringStudent.class_id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade_level})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={transferring || !targetClassId}
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-sm cursor-pointer"
                >
                  {transferring ? (isKm ? 'កំពុងផ្ទេរ...' : 'Transferring...') : (isKm ? 'បញ្ជាក់ការផ្ទេរ' : 'Confirm Transfer')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
