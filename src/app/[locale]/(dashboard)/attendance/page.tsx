'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CalendarCheck, FloppyDisk, CheckCircle,
  FileXls, FileDoc, FilePpt, CaretDown, DownloadSimple,
  SquaresFour, ListDashes, DotsSixVertical, Funnel, FileArrowDown
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { api } from '@/lib/api';
import { exportToExcelFile } from '@/lib/exporters/export-excel';
import { exportToWordFile } from '@/lib/exporters/export-word';
import { exportToPptxFile } from '@/lib/exporters/export-pptx';
import { useAuthStore } from '@/stores/use-auth-store';
import { useUIStore } from '@/stores/use-ui-store';
import { Skeleton, SkeletonCardGrid } from '@/components/ui/skeleton';
import { ViewModeToggle } from '@/components/dashboard/view-mode-toggle';

interface AttendanceRecord {
  student_id: number;
  name: string;
  student_code?: string;
  roll_no?: number;
  status: 'present' | 'absent' | 'late' | 'permission';
  notes?: string;
  present_count?: number;
  late_count?: number;
  permission_count?: number;
  absent_count?: number;
  attended_count?: number;
  total_days?: number;
  attendance_rate?: number;
}

const DEFAULT_ATTENDANCE_CLASSES = [
  { id: 1, name: 'ថ្នាក់ទី ១០-A (Grade 10-A)', grade_level: 'ថ្នាក់ទី ១០' },
  { id: 2, name: 'ថ្នាក់ទី ១១-B (Grade 11-B)', grade_level: 'ថ្នាក់ទី ១១' },
  { id: 3, name: 'ថ្នាក់ទី ១២-C (Grade 12-C)', grade_level: 'ថ្នាក់ទី ១២' },
];

const DEFAULT_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { student_id: 1, name: 'សុខ ចិន្តា (Sok Chenda)', student_code: 'STU-1001', roll_no: 1, status: 'present', notes: '', present_count: 26, late_count: 1, permission_count: 1, absent_count: 0, attended_count: 26, total_days: 28, attendance_rate: 96 },
  { student_id: 2, name: 'ចាន់ សុផល (Chan Sophal)', student_code: 'STU-1002', roll_no: 2, status: 'present', notes: '', present_count: 28, late_count: 0, permission_count: 0, absent_count: 0, attended_count: 28, total_days: 28, attendance_rate: 100 },
  { student_id: 3, name: 'ម៉ៅ វណ្ណារ៉ា (Mao Vannara)', student_code: 'STU-1003', roll_no: 3, status: 'late', notes: 'មកយឺត ១០ នាទី', present_count: 22, late_count: 3, permission_count: 2, absent_count: 1, attended_count: 24, total_days: 28, attendance_rate: 89 },
  { student_id: 4, name: 'កែវ មុន្នីរ័ត្ន (Keo Moniroth)', student_code: 'STU-1004', roll_no: 4, status: 'present', notes: '', present_count: 25, late_count: 1, permission_count: 2, absent_count: 0, attended_count: 27, total_days: 28, attendance_rate: 96 },
  { student_id: 5, name: 'ហេង គីមស៊ាន (Heng Kimsan)', student_code: 'STU-1005', roll_no: 5, status: 'permission', notes: 'សុំច្បាប់ឈឺ', present_count: 20, late_count: 2, permission_count: 5, absent_count: 1, attended_count: 23, total_days: 28, attendance_rate: 86 },
  { student_id: 6, name: 'លី សុជាតិ (Ly Socheat)', student_code: 'STU-1006', roll_no: 6, status: 'present', notes: '', present_count: 28, late_count: 0, permission_count: 0, absent_count: 0, attended_count: 28, total_days: 28, attendance_rate: 100 },
  { student_id: 7, name: 'រ៉េត វិសាល (Reth Visal)', student_code: 'STU-1007', roll_no: 7, status: 'absent', notes: 'អវត្តមានគ្មានច្បាប់', present_count: 18, late_count: 3, permission_count: 3, absent_count: 4, attended_count: 22, total_days: 28, attendance_rate: 79 },
];

export default function AttendancePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { user } = useAuthStore();
  const { viewMode } = useUIStore();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('ទូទៅ');
  const [classSubjects, setClassSubjects] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRecords((items) => {
        const oldIndex = items.findIndex((item) => item.student_id === active.id);
        const newIndex = items.findIndex((item) => item.student_id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const STANDARD_SUBJECTS = [
    'ទូទៅ',
    'ភាសាខ្មែរ',
    'គណិតវិទ្យា',
    'រូបវិទ្យា',
    'គីមីវិទ្យា',
    'ជីវវិទ្យា',
    'ប្រវត្តិវិទ្យា',
    'ភូមិវិទ្យា',
    'ភាសាអង់គ្លេស',
    'ពលរដ្ឋវិជ្ជា',
    'ព័ត៌មានវិទ្យា',
    'កីឡា'
  ];

  // Sortable Table Row Component
  function SortableTableRow({
    record,
    index,
    isKm,
    onUpdateStatus,
  }: {
    record: AttendanceRecord;
    index: number;
    isKm: boolean;
    onUpdateStatus: (studentId: number, status: 'present' | 'absent' | 'late' | 'permission') => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: record.student_id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.35 : 1,
      zIndex: isDragging ? 999 : 'auto',
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        className="hover:bg-slate-50/80 dark:hover:bg-[#16171b] border-slate-100 dark:border-[#282a32]"
      >
        <TableCell className="text-center font-bold text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
            >
              <DotsSixVertical size={16} weight="bold" />
            </button>
            {record.roll_no || index + 1}
          </div>
        </TableCell>
        <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
          {record.student_code || `STU-${record.student_id}`}
        </TableCell>
        <TableCell className="font-medium text-slate-800 dark:text-white text-xs">
          {record.name}
        </TableCell>
        <TableCell className="text-center">
          <input
            type="radio"
            name={`att-${record.student_id}`}
            checked={record.status === 'present'}
            onChange={() => onUpdateStatus(record.student_id, 'present')}
            className="cursor-pointer accent-emerald-600 w-4 h-4"
          />
        </TableCell>
        <TableCell className="text-center">
          <input
            type="radio"
            name={`att-${record.student_id}`}
            checked={record.status === 'late'}
            onChange={() => onUpdateStatus(record.student_id, 'late')}
            className="cursor-pointer accent-amber-500 w-4 h-4"
          />
        </TableCell>
        <TableCell className="text-center">
          <input
            type="radio"
            name={`att-${record.student_id}`}
            checked={record.status === 'permission'}
            onChange={() => onUpdateStatus(record.student_id, 'permission')}
            className="cursor-pointer accent-blue-600 w-4 h-4"
          />
        </TableCell>
        <TableCell className="text-center">
          <input
            type="radio"
            name={`att-${record.student_id}`}
            checked={record.status === 'absent'}
            onChange={() => onUpdateStatus(record.student_id, 'absent')}
            className="cursor-pointer accent-rose-500 w-4 h-4"
          />
        </TableCell>
        <TableCell className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-medium" title={isKm ? 'ចំនួនវត្តមាន' : 'Present'}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{isKm ? 'វត្តមាន:' : 'P:'}</span>
              <strong className="font-bold text-emerald-800 dark:text-emerald-300">{record.present_count !== undefined ? record.present_count : (record.attended_count ?? (record.status === 'present' ? 1 : 0))}</strong>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-medium" title={isKm ? 'ចំនួនមកយឺត' : 'Late'}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>{isKm ? 'យឺត:' : 'L:'}</span>
              <strong className="font-bold text-amber-800 dark:text-amber-300">{record.late_count !== undefined ? record.late_count : (record.status === 'late' ? 1 : 0)}</strong>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 text-[11px] font-medium" title={isKm ? 'ចំនួនសុំច្បាប់' : 'Permission'}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>{isKm ? 'ច្បាប់:' : 'Perm:'}</span>
              <strong className="font-bold text-blue-800 dark:text-blue-300">{record.permission_count !== undefined ? record.permission_count : (record.status === 'permission' ? 1 : 0)}</strong>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 text-[11px] font-medium" title={isKm ? 'ចំនួនអវត្តមាន' : 'Absent'}>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>{isKm ? 'អវត្តមាន:' : 'A:'}</span>
              <strong className="font-bold text-rose-800 dark:text-rose-300">{record.absent_count !== undefined ? record.absent_count : (record.status === 'absent' ? 1 : 0)}</strong>
            </span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Sortable Attendance Card Component
  function SortableAttendanceCard({
    record,
    index,
    isKm,
    onUpdateStatus,
  }: {
    record: AttendanceRecord;
    index: number;
    isKm: boolean;
    onUpdateStatus: (studentId: number, status: 'present' | 'absent' | 'late' | 'permission') => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: record.student_id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.35 : 1,
      zIndex: isDragging ? 999 : 'auto',
    };

    const statusColors = {
      present: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      absent: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      late: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      permission: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    };

    const statusLabels = {
      present: isKm ? 'វត្តមាន' : 'Present',
      absent: isKm ? 'អវត្តមាន' : 'Absent',
      late: isKm ? 'យឺត' : 'Late',
      permission: isKm ? 'ច្បាប់' : 'Permission',
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group relative rounded-2xl border bg-white dark:bg-[#15171e] border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15] hover:shadow-lg dark:hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200 p-4.5"
      >
        {/* Top Handle */}
        <div className="flex items-center justify-between text-slate-400 mb-3.5">
          <div className="flex items-center gap-1.5">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-slate-400/80 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
              title={isKm ? 'អូសដើម្បីផ្លាស់ប្ដូរទីតាំង' : 'Drag to reorder'}
            >
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
              #{record.roll_no || index + 1}
            </span>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[record.status]}`}>
            {statusLabels[record.status]}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md ring-2 ring-white/10">
            {record.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {record.name}
            </h4>
            <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
              {record.student_code || `STU-${record.student_id}`}
            </p>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-4 gap-2 py-2.5 border-t border-slate-100 dark:border-white/[0.06] text-center">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{isKm ? 'វត្តមាន' : 'Present'}</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{record.present_count}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{isKm ? 'យឺត' : 'Late'}</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{record.late_count}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{isKm ? 'ច្បាប់' : 'Perm'}</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{record.permission_count}</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/30 rounded-lg p-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{isKm ? 'អវត្តមាន' : 'Absent'}</p>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{record.absent_count}</p>
          </div>
        </div>

        {/* Status Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {(['present', 'absent', 'late', 'permission'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onUpdateStatus(record.student_id, status)}
              className={`py-1.5 rounded-lg text-[10px] font-semibold transition ${
                record.status === status
                  ? statusColors[status]
                  : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
              }`}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentClassObj = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  const availableSubjects = useMemo(() => {
    if (!currentClassObj) return STANDARD_SUBJECTS;
    if (user?.role === 'admin' || currentClassObj.teacher_id === user?.id) {
      return currentClassObj.assigned_subjects && currentClassObj.assigned_subjects.length > 0
        ? Array.from(new Set(['ទូទៅ', ...currentClassObj.assigned_subjects]))
        : STANDARD_SUBJECTS;
    } else {
      return currentClassObj.assigned_subjects && currentClassObj.assigned_subjects.length > 0
        ? currentClassObj.assigned_subjects
        : ['ទូទៅ'];
    }
  }, [currentClassObj, user]);

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [availableSubjects]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getClasses();
      if (Array.isArray(data) && data.length > 0) {
        setClasses(data);
        setSelectedClassId(data[0].id);
      } else {
        setClasses([]);
        setSelectedClassId(0);
      }
    } catch {
      setClasses([]);
      setSelectedClassId(0);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      loadAttendance();
    } else {
      setRecords([]);
    }
  }, [selectedClassId, date, selectedSubject]);

  const loadAttendance = async () => {
    if (!selectedClassId) {
      setRecords([]);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getAttendance(selectedClassId, date, selectedSubject);
      if (Array.isArray(data) && data.length > 0) {
        setRecords(
          data.map((item) => ({
            student_id: item.student_id,
            name: item.name,
            student_code: item.student_code,
            roll_no: item.roll_no,
            status: item.status || 'present',
            notes: item.notes || '',
            present_count: item.present_count ?? 0,
            late_count: item.late_count ?? 0,
            permission_count: item.permission_count ?? 0,
            absent_count: item.absent_count ?? 0,
            attended_count: item.attended_count ?? 0,
            total_days: item.total_days ?? 0,
            attendance_rate: item.attendance_rate ?? 100,
          }))
        );
      } else {
        const students = await api.getClassStudents(selectedClassId);
        if (Array.isArray(students) && students.length > 0) {
          setRecords(
            students.map((s, idx) => ({
              student_id: s.id,
              name: s.name,
              student_code: s.student_code,
              roll_no: s.roll_no || idx + 1,
              status: 'present',
              notes: '',
              present_count: 0,
              late_count: 0,
              permission_count: 0,
              absent_count: 0,
              attended_count: 0,
              total_days: 0,
              attendance_rate: 100,
            }))
          );
        } else {
          setRecords([]);
        }
      }
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (studentId: number, status: 'present' | 'absent' | 'late' | 'permission') => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status } : r))
    );
  };

  const markAll = (status: 'present' | 'absent') => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      await api.saveAttendance(
        selectedClassId,
        date,
        records.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          notes: r.notes?.trim() || undefined,
        })),
        selectedSubject
      );
      await loadAttendance();
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 3500);
    } catch (err: any) {
      alert(err.message || 'បរាជ័យក្នុងការរក្សាទុកវត្តមាន');
    } finally {
      setSaving(false);
    }
  };

  const [isExportOpen, setIsExportOpen] = useState(false);

  // 1. Export Excel (.xlsx)
  const handleExportExcel = () => {
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const className = selectedClass ? selectedClass.name : `Class_${selectedClassId}`;
    const data = records.map((r, i) => ({
      '#': r.roll_no || i + 1,
      [isKm ? 'អត្តលេខ' : 'Student ID']: r.student_code || `STU-${r.student_id}`,
      [isKm ? 'ឈ្មោះសិស្ស' : 'Name']: r.name,
      [isKm ? 'ស្ថានភាពថ្ងៃនេះ' : 'Today Status']: r.status.toUpperCase(),
      [isKm ? 'វត្តមាន (Present)' : 'Present Count']: r.present_count ?? (r.attended_count ?? (r.status === 'present' ? 1 : 0)),
      [isKm ? 'យឺត (Late)' : 'Late Count']: r.late_count ?? (r.status === 'late' ? 1 : 0),
      [isKm ? 'ច្បាប់ (Permission)' : 'Permission Count']: r.permission_count ?? (r.status === 'permission' ? 1 : 0),
      [isKm ? 'អវត្តមាន (Absent)' : 'Absent Count']: r.absent_count ?? (r.status === 'absent' ? 1 : 0),
      [isKm ? 'អត្រាវត្តមាន (%)' : 'Attendance Rate (%)']: `${r.attendance_rate ?? 100}%`,
    }));
    exportToExcelFile(data, `Attendance_${className}_${date}.xlsx`, 'Attendance');
    setIsExportOpen(false);
  };

  // 2. Export Word Document (.docx)
  const handleExportWord = async () => {
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const className = selectedClass ? selectedClass.name : `Class_${selectedClassId}`;
    const title = isKm 
      ? `របាយការណ៍វត្តមានសិស្សប្រចាំថ្ងៃ - ${className} (${date})` 
      : `Daily Student Attendance Report - ${className} (${date})`;
    
    const headers = [
      '#',
      isKm ? 'អត្តលេខ' : 'Student ID',
      isKm ? 'ឈ្មោះសិស្ស' : 'Name',
      isKm ? 'ស្ថានភាពថ្ងៃនេះ' : 'Status',
      isKm ? 'វត្តមាន' : 'Present',
      isKm ? 'យឺត' : 'Late',
      isKm ? 'ច្បាប់' : 'Perm',
      isKm ? 'អវត្តមាន' : 'Absent',
      isKm ? 'អត្រា (%)' : 'Rate (%)'
    ];

    const rows = records.map((r, i) => [
      r.roll_no || i + 1,
      r.student_code || `STU-${r.student_id}`,
      r.name,
      r.status.toUpperCase(),
      r.present_count ?? (r.attended_count ?? (r.status === 'present' ? 1 : 0)),
      r.late_count ?? (r.status === 'late' ? 1 : 0),
      r.permission_count ?? (r.status === 'permission' ? 1 : 0),
      r.absent_count ?? (r.status === 'absent' ? 1 : 0),
      `${r.attendance_rate ?? 100}%`
    ]);

    await exportToWordFile(title, headers, rows, `Attendance_${className}_${date}.docx`);
    setIsExportOpen(false);
  };

  // 3. Export PowerPoint (.pptx)
  const handleExportPptx = async () => {
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const className = selectedClass ? selectedClass.name : `Class_${selectedClassId}`;
    const title = isKm 
      ? `របាយការណ៍វត្តមានសិស្ស - ${className} (${date})` 
      : `Student Attendance - ${className} (${date})`;
    
    const headers = [
      '#',
      isKm ? 'អត្តលេខ' : 'ID',
      isKm ? 'ឈ្មោះសិស្ស' : 'Name',
      isKm ? 'ស្ថានភាព' : 'Status',
      isKm ? 'វត្តមាន' : 'Present',
      isKm ? 'យឺត' : 'Late',
      isKm ? 'ច្បាប់' : 'Perm',
      isKm ? 'អវត្តមាន' : 'Absent',
    ];

    const rows = records.map((r, i) => [
      r.roll_no || i + 1,
      r.student_code || `STU-${r.student_id}`,
      r.name,
      r.status.toUpperCase(),
      r.present_count ?? (r.attended_count ?? (r.status === 'present' ? 1 : 0)),
      r.late_count ?? (r.status === 'late' ? 1 : 0),
      r.permission_count ?? (r.status === 'permission' ? 1 : 0),
      r.absent_count ?? (r.status === 'absent' ? 1 : 0),
    ]);

    exportToPptxFile(title, headers, rows, `Attendance_${className}_${date}.pptx`);
    setIsExportOpen(false);
  };

  const presentCount = records.filter((r) => r.status === 'present').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const permCount = records.filter((r) => r.status === 'permission').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isKm ? 'កត់ត្រាវត្តមានសិស្ស (Attendance Tracking)' : 'Daily Attendance Sheet'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm
              ? 'ស្រង់វត្តមានប្រចាំថ្ងៃ ពិនិត្យប្រវត្តិចាស់ៗ ចំនួនវត្តមានសរុប និងទាញរបាយការណ៍ជា Excel, Word, PowerPoint'
              : 'Record daily student attendance, track attendance counts and percentages, and export Excel, Word, PowerPoint reports'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
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
                  <FilePpt size={16} weight="fill" className="text-amber-500" />
                  <span>PowerPoint (.pptx)</span>
                </button>
              </div>
            )}
          </div>

          <Button 
            onClick={handleSaveAttendance} 
            disabled={saving || records.length === 0}
            size="sm" 
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
          >
            <FloppyDisk size={14} weight="bold" />
            <span>{saving ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុកវត្តមាន' : 'Save Attendance')}</span>
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          <span>{isKm ? 'បានកត់ត្រា និងរក្សាទុកវត្តមានដោយជោគជ័យ!' : 'Attendance records persisted successfully!'}</span>
        </div>
      )}

      {/* Toolbar: Select Class, Select Subject, Select Date, Select Month for Export, Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] p-4 rounded-2xl shadow-xs">
        {/* View Mode Toggle & Filter */}
        <div className="sm:col-span-12 flex justify-between items-center">
          {/* Filter Popover */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1c1d25] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
            >
              <Funnel size={15} weight="regular" />
              <span>{isKm ? 'តម្រង' : 'Filter'}</span>
              <CaretDown size={12} className="text-slate-400" />
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.1] p-4 z-50 animate-in fade-in duration-150 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">
                    {isKm ? 'តម្រងថ្នាក់' : 'FILTER CLASS'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isKm ? 'ថ្នាក់រៀន' : 'Class'}
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#14161d] text-slate-900 dark:text-white cursor-pointer"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.grade_level ? `(${c.grade_level})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

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

          {/* View Mode Toggle */}
          <ViewModeToggle />
        </div>
        {/* Subject selector */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
            <span>{isKm ? 'មុខវិជ្ជាបង្រៀន (Subject)' : 'Subject'}</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal font-mono">
              {isKm ? 'កំណត់សិទ្ធិតាមមុខវិជ្ជា' : 'Isolated'}
            </span>
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {availableSubjects.map((subj: string) => (
              <option key={subj} value={subj}>
                {subj === 'ទូទៅ' ? (isKm ? 'ទូទៅ / គ្រប់មុខវិជ្ជា' : 'General / Homeroom') : subj}
              </option>
            ))}
          </select>
        </div>

        {/* Date picker */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {isKm ? 'កាលបរិច្ឆេទស្រង់វត្តមាន' : 'Attendance Date'}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          />
        </div>

        {/* Metrics Counter */}
        <div className="sm:col-span-4 flex items-end justify-between sm:justify-end gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px]">
              {isKm ? 'វត្តមាន:' : 'P:'} {presentCount}
            </span>
            <span className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px]">
              {isKm ? 'យឺត:' : 'L:'} {lateCount}
            </span>
            <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]">
              {isKm ? 'ច្បាប់:' : 'Perm:'} {permCount}
            </span>
            <span className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px]">
              {isKm ? 'អវត្តមាន:' : 'A:'} {absentCount}
            </span>
          </div>
        </div>
      </div>

      {/* Batch actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll('present')}
          className="text-xs bg-white dark:bg-[#1c1d22] border-slate-200 dark:border-[#282a32] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#16171b] cursor-pointer"
        >
          {isKm ? 'វត្តមានទាំងអស់ (Mark All Present)' : 'Mark All Present'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll('absent')}
          className="text-xs bg-white dark:bg-[#1c1d22] border-slate-200 dark:border-[#282a32] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#16171b] cursor-pointer"
        >
          {isKm ? 'អវត្តមានទាំងអស់ (Mark All Absent)' : 'Mark All Absent'}
        </Button>
      </div>

      {/* Attendance Display - Table or Card View */}
      {viewMode === 'table' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={records.map((r) => r.student_id)} strategy={verticalListSortingStrategy}>
            <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-[#282a32]">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="w-28">{isKm ? 'អត្តលេខ' : 'Student ID'}</TableHead>
                    <TableHead>{isKm ? 'ឈ្មោះសិស្ស' : 'Student Name'}</TableHead>
                    <TableHead className="text-center w-24">{isKm ? 'វត្តមាន' : 'Present'}</TableHead>
                    <TableHead className="text-center w-20">{isKm ? 'យឺត' : 'Late'}</TableHead>
                    <TableHead className="text-center w-24">{isKm ? 'ច្បាប់' : 'Permission'}</TableHead>
                    <TableHead className="text-center w-24">{isKm ? 'អវត្តមាន' : 'Absent'}</TableHead>
                    <TableHead className="text-center min-w-[280px]">{isKm ? 'ចំនួនវត្តមាន (Attended Summary)' : 'Attended Summary'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-slate-100 dark:border-[#282a32]">
                          {Array.from({ length: 8 }).map((_, c) => (
                            <TableCell key={c} className="py-3.5">
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-400">
                        {isKm ? 'មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ' : 'No students found in this class.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record, index) => (
                      <SortableTableRow
                        key={record.student_id}
                        record={record}
                        index={index}
                        isKm={isKm}
                        onUpdateStatus={updateStatus}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={records.map((r) => r.student_id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading ? (
                <div className="col-span-full">
                  <SkeletonCardGrid count={8} />
                </div>
              ) : records.length === 0 ? (
                <div className="col-span-full text-center py-8 text-xs text-slate-400">
                  {isKm ? 'មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ' : 'No students found in this class.'}
                </div>
              ) : (
                records.map((record, index) => (
                  <SortableAttendanceCard
                    key={record.student_id}
                    record={record}
                    index={index}
                    isKm={isKm}
                    onUpdateStatus={updateStatus}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
