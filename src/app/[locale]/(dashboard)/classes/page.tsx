'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Users, Plus, ArrowRight, ChalkboardTeacher, 
  Trash, X, CheckCircle, PencilSimple, UserSwitch, ShieldCheck,
  MagnifyingGlass, Funnel, FileArrowDown
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/use-auth-store';
import { useUIStore } from '@/stores/use-ui-store';
import { ViewModeToggle } from '@/components/dashboard/view-mode-toggle';

interface SchoolClass {
  id: number;
  name: string;
  grade_level: string;
  academic_year: string;
  student_count: number;
  teacher_id?: number;
  teacher_name?: string;
  room?: string;
}

interface TeacherOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ClassesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { user } = useAuthStore();
  const { viewMode } = useUIStore();
  const isAdmin = user?.role === 'admin';

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Create class state
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('ថ្នាក់ទី ១០');
  const [newAcademicYear, setNewAcademicYear] = useState('2026-2027');
  const [newTeacherId, setNewTeacherId] = useState<number | undefined>(undefined);
  const [creating, setCreating] = useState(false);

  // Edit class state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [editName, setEditName] = useState('');
  const [editGradeLevel, setEditGradeLevel] = useState('');
  const [editAcademicYear, setEditAcademicYear] = useState('');
  const [editTeacherId, setEditTeacherId] = useState<number | undefined>(undefined);
  const [updating, setUpdating] = useState(false);

  // Quick Assign Teacher Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignClass, setAssignClass] = useState<SchoolClass | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>(undefined);
  const [assigning, setAssigning] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
    if (isAdmin) {
      loadTeachers();
    }
  }, [isAdmin]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await api.getClasses();
      if (Array.isArray(data)) {
        setClasses(data);
      } else {
        setClasses([]);
      }
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await api.getAdminTeachers();
      if (Array.isArray(data)) {
        setTeachers(data);
      }
    } catch {
      // ignore
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setCreating(true);
    try {
      await api.createClass(
        newClassName.trim(), 
        newGradeLevel.trim(), 
        newAcademicYear.trim(), 
        isAdmin ? newTeacherId : undefined
      );
      await loadClasses();
      setNewClassName('');
      setNewTeacherId(undefined);
      setShowModal(false);
      setStatusMessage(isKm ? 'បានបង្កើតថ្នាក់រៀនថ្មីដោយជោគជ័យ!' : 'Class created successfully!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'បរាជ័យក្នុងការបង្កើតថ្នាក់');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    setEditName(cls.name);
    setEditGradeLevel(cls.grade_level);
    setEditAcademicYear(cls.academic_year || '2026-2027');
    setEditTeacherId(cls.teacher_id);
    setShowEditModal(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editName.trim()) return;

    setUpdating(true);
    try {
      await api.updateClass(editingClass.id, {
        name: editName.trim(),
        grade_level: editGradeLevel.trim(),
        academic_year: editAcademicYear.trim(),
        teacher_id: isAdmin ? editTeacherId : undefined,
      });
      await loadClasses();
      setShowEditModal(false);
      setEditingClass(null);
      setStatusMessage(isKm ? 'បានកែប្រែព័ត៌មានថ្នាក់រៀនដោយជោគជ័យ!' : 'Class updated successfully!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'បរាជ័យក្នុងការកែប្រែថ្នាក់');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenAssign = (cls: SchoolClass) => {
    setAssignClass(cls);
    setSelectedTeacherId(cls.teacher_id);
    setShowAssignModal(true);
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignClass || !selectedTeacherId) return;

    setAssigning(true);
    try {
      await api.assignTeacherToClass(assignClass.id, selectedTeacherId);
      await loadClasses();
      setShowAssignModal(false);
      const targetTeacher = teachers.find(t => t.id === selectedTeacherId);
      setStatusMessage(
        isKm 
          ? `បានចាត់តាំងថ្នាក់ ${assignClass.name} (និងសិស្សទាំងអស់) ទៅកាន់លោកគ្រូ/អ្នកគ្រូ ${targetTeacher?.name || ''} ដោយជោគជ័យ!`
          : `Assigned ${assignClass.name} with all students to teacher successfully!`
      );
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'បរាជ័យក្នុងការចាត់តាំងគ្រូ');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដជាចង់លុបថ្នាក់រៀននេះមែនទេ?' : 'Are you sure you want to delete this class?')) return;
    try {
      await api.deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      setStatusMessage(isKm ? 'បានលុបថ្នាក់រៀនដោយជោគជ័យ!' : 'Class deleted successfully!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'បរាជ័យក្នុងការលុបថ្នាក់');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isKm ? 'គ្រប់គ្រងថ្នាក់រៀន (Class Management)' : 'Classes Directory'}
            </h1>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <ShieldCheck size={13} weight="fill" />
                <span>Admin View (ថ្នាក់ទាំងអស់)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm 
              ? (isAdmin 
                  ? 'Admin អាចបង្កើតថ្នាក់ ចាត់តាំងថ្នាក់រៀនដែលមានសិស្សរួចស្រេចទៅគ្រូបង្រៀន ឬផ្លាស់ប្តូរគ្រូបង្រៀន' 
                  : 'មើលបញ្ជីថ្នាក់រៀន និងសិស្សដែលត្រូវបានចាត់តាំងជូនលោកគ្រូ/អ្នកគ្រូ')
              : 'Manage classrooms, update details, assign teachers, and track rosters'}
          </p>
        </div>
        <Button 
          onClick={() => {
            setNewTeacherId(user?.id ? Number(user.id) : undefined);
            setShowModal(true);
          }}
          size="sm" 
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          <span>{isKm ? 'បង្កើតថ្នាក់ថ្មី' : 'Create Class'}</span>
        </Button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      {/* Top Search & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKm ? 'ស្វែងរកថ្នាក់រៀន កម្រិតថ្នាក់ គ្រូទទួលបន្ទុក...' : 'Search classes, grade level, teacher...'}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#14161d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>
        <ViewModeToggle />
      </div>

      {/* Empty State */}
      {!loading && classes.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-[#282a32] bg-white/50 dark:bg-[#16171b]/50 p-12 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <ChalkboardTeacher size={28} weight="duotone" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
            {isKm ? 'មិនទាន់មានថ្នាក់រៀននៅឡើយទេ' : 'No Classes Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            {isKm 
              ? (isAdmin 
                  ? 'សូមចុចប៊ូតុង "បង្កើតថ្នាក់ថ្មី" ដើម្បីបង្កើតថ្នាក់ និងចាត់តាំងគ្រូបង្រៀន។'
                  : 'Admin អាចចាត់តាំងថ្នាក់រៀនដែលមានសិស្សរួចស្រេចជូនលោកគ្រូ/អ្នកគ្រូ ឬលោកគ្រូ/អ្នកគ្រូអាចបង្កើតថ្នាក់រៀនថ្មីដោយខ្លួនឯង។')
              : 'Get started by creating a new class or wait for Admin to assign existing classrooms.'}
          </p>
          <Button 
            onClick={() => setShowModal(true)}
            size="sm" 
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Plus size={14} weight="bold" />
            <span>{isKm ? 'បង្កើតថ្នាក់ថ្មីឥឡូវនេះ' : 'Create Class Now'}</span>
          </Button>
        </div>
      )}

      {/* Classes Display: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-[#282a32]">
                <TableHead className="w-40">{isKm ? 'កម្រិតថ្នាក់' : 'Grade Level'}</TableHead>
                <TableHead>{isKm ? 'ឈ្មោះថ្នាក់រៀន' : 'Class Name'}</TableHead>
                <TableHead>{isKm ? 'គ្រូទទួលបន្ទុក' : 'Class Teacher'}</TableHead>
                <TableHead className="text-center w-28">{isKm ? 'ចំនួនសិស្ស' : 'Students'}</TableHead>
                <TableHead className="text-right w-44">{isKm ? 'សកម្មភាព' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes
                .filter((c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.grade_level.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (c.teacher_name && c.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((cls) => (
                  <TableRow key={cls.id} className="hover:bg-slate-50/80 dark:hover:bg-[#16171b] border-slate-100 dark:border-[#282a32]">
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {cls.grade_level}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-800 dark:text-white">
                      {cls.name}
                      <span className="ml-2 text-[11px] font-normal text-slate-400">({cls.academic_year || '2026-2027'})</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <ChalkboardTeacher size={15} className="text-blue-500 shrink-0" />
                        <span>{cls.teacher_name || (isKm ? 'គ្មានគ្រូ' : 'Unassigned')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                        {cls.student_count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/${locale}/classes/${cls.id}`} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1">
                          <span>{isKm ? 'សិស្ស' : 'Students'}</span>
                          <ArrowRight size={13} />
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenAssign(cls)}
                            className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                            title={isKm ? 'ចាត់តាំងគ្រូ' : 'Assign Teacher'}
                          >
                            <UserSwitch size={15} />
                          </button>
                        )}
                        <button onClick={() => handleOpenEdit(cls)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600">
                          <PencilSimple size={14} />
                        </button>
                        <button onClick={() => handleDeleteClass(cls.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600">
                          <Trash size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes
            .filter((c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.grade_level.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (c.teacher_name && c.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((cls) => (
              <div
                key={cls.id}
                className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-500/50 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {cls.grade_level}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">{cls.academic_year || '2026-2027'}</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenAssign(cls)}
                          className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                          title={isKm ? 'ចាត់តាំងគ្រូបង្រៀន (Assign Teacher)' : 'Assign Teacher'}
                        >
                          <UserSwitch size={15} weight="bold" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                        title={isKm ? 'កែប្រែថ្នាក់' : 'Edit Class'}
                      >
                        <PencilSimple size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title={isKm ? 'លុបថ្នាក់' : 'Delete Class'}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {cls.name}
                  </h3>
                  
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <ChalkboardTeacher size={14} className="text-blue-500 shrink-0" />
                      <span className="text-slate-400 dark:text-slate-500">{isKm ? 'គ្រូទទួលបន្ទុក:' : 'Teacher:'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {cls.teacher_name || (isKm ? 'គ្មានគ្រូ' : 'Unassigned')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#282a32] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <Users size={16} className="text-blue-600 dark:text-blue-400" />
                    <span>{cls.student_count || 0} {isKm ? 'សិស្សក្នុងថ្នាក់' : 'Students'}</span>
                  </div>
                  <Link
                    href={`/${locale}/classes/${cls.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition"
                  >
                    <span>{isKm ? 'គ្រប់គ្រងសិស្ស' : 'Manage Students'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal: Create Class */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <ChalkboardTeacher size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'បង្កើតថ្នាក់រៀនថ្មី' : 'Create New Class'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'បញ្ចូលឈ្មោះថ្នាក់ កម្រិតថ្នាក់ និងចាត់តាំងគ្រូបង្រៀន' : 'Enter class details, level, and assign teacher'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ឈ្មោះថ្នាក់រៀន (Class Name)' : 'Class Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder={isKm ? 'ឧ. ថ្នាក់ទី ១០-A' : 'e.g. Grade 10-A'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'កម្រិតថ្នាក់ (Grade Level)' : 'Grade Level'} *
                </label>
                <select
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="ថ្នាក់ទី ៧">ថ្នាក់ទី ៧ (Grade 7)</option>
                  <option value="ថ្នាក់ទី ៨">ថ្នាក់ទី ៨ (Grade 8)</option>
                  <option value="ថ្នាក់ទី ៩">ថ្នាក់ទី ៩ (Grade 9)</option>
                  <option value="ថ្នាក់ទី ១០">ថ្នាក់ទី ១០ (Grade 10)</option>
                  <option value="ថ្នាក់ទី ១១">ថ្នាក់ទី ១១ (Grade 11)</option>
                  <option value="ថ្នាក់ទី ១២">ថ្នាក់ទី ១២ (Grade 12)</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'ចាត់តាំងគ្រូទទួលបន្ទុក (Assign Teacher)' : 'Assign Teacher'}
                  </label>
                  <select
                    value={newTeacherId || ''}
                    onChange={(e) => setNewTeacherId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer font-medium"
                  >
                    <option value="">{isKm ? '-- ជ្រើសរើសគ្រូបង្រៀន --' : '-- Select Teacher --'}</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ឆ្នាំសិក្សា (Academic Year)' : 'Academic Year'}
                </label>
                <input
                  type="text"
                  value={newAcademicYear}
                  onChange={(e) => setNewAcademicYear(e.target.value)}
                  placeholder="2026-2027"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#282a32]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {creating ? (isKm ? 'កំពុងបង្កើត...' : 'Creating...') : (isKm ? 'បង្កើតថ្នាក់' : 'Create Class')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Class */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <PencilSimple size={22} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'កែប្រែព័ត៌មានថ្នាក់រៀន' : 'Edit Class Details'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'ធ្វើបច្ចុប្បន្នភាពឈ្មោះ ឆ្នាំសិក្សា និងគ្រូទទួលបន្ទុក' : 'Update class details and teacher'}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ឈ្មោះថ្នាក់រៀន' : 'Class Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'កម្រិតថ្នាក់' : 'Grade Level'} *
                </label>
                <select
                  value={editGradeLevel}
                  onChange={(e) => setEditGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="ថ្នាក់ទី ៧">ថ្នាក់ទី ៧ (Grade 7)</option>
                  <option value="ថ្នាក់ទី ៨">ថ្នាក់ទី ៨ (Grade 8)</option>
                  <option value="ថ្នាក់ទី ៩">ថ្នាក់ទី ៩ (Grade 9)</option>
                  <option value="ថ្នាក់ទី ១០">ថ្នាក់ទី ១០ (Grade 10)</option>
                  <option value="ថ្នាក់ទី ១១">ថ្នាក់ទី ១១ (Grade 11)</option>
                  <option value="ថ្នាក់ទី ១២">ថ្នាក់ទី ១២ (Grade 12)</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'ផ្លាស់ប្តូរគ្រូទទួលបន្ទុក (Change Teacher)' : 'Change Teacher'}
                  </label>
                  <select
                    value={editTeacherId || ''}
                    onChange={(e) => setEditTeacherId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer font-medium"
                  >
                    <option value="">{isKm ? '-- ជ្រើសរើសគ្រូបង្រៀន --' : '-- Select Teacher --'}</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">
                    {isKm ? '💡 សិស្សទាំងអស់ក្នុងថ្នាក់នេះនឹងត្រូវផ្ទេរទៅគ្រូថ្មីដោយស្វ័យប្រវត្តិ' : '💡 All enrolled students will automatically transfer to the new teacher'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ឆ្នាំសិក្សា' : 'Academic Year'}
                </label>
                <input
                  type="text"
                  value={editAcademicYear}
                  onChange={(e) => setEditAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#282a32]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {updating ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុកការកែប្រែ' : 'Save Changes')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Assign Teacher */}
      {showAssignModal && assignClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <UserSwitch size={22} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'ចាត់តាំងគ្រូបង្រៀនទទួលបន្ទុកថ្នាក់' : 'Assign Teacher to Class'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {assignClass.name} • {assignClass.student_count || 0} {isKm ? 'សិស្សក្នុងថ្នាក់' : 'Students'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs leading-relaxed">
                {isKm 
                  ? '✨ សិស្សទាំងអស់ក្នុងថ្នាក់នេះ (រួមទាំងទិន្នន័យវត្តមាន ពិន្ទុ និងកិច្ចការ) នឹងបង្ហាញភ្លាមៗក្នុងគណនីរបស់គ្រូដែលបានចាត់តាំង ដោយមិនចាំបាច់បញ្ចូលសិស្សម្តងទៀតឡើយ!' 
                  : '✨ All enrolled students and class records will instantly transfer to the selected teacher.'}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKm ? 'ជ្រើសរើសលោកគ្រូ/អ្នកគ្រូ' : 'Select Teacher'} *
                </label>
                <select
                  required
                  value={selectedTeacherId || ''}
                  onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer font-medium"
                >
                  <option value="">{isKm ? '-- សូមជ្រើសរើសគ្រូបង្រៀន --' : '-- Select a Teacher --'}</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#282a32]">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={assigning || !selectedTeacherId}
                  className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {assigning ? (isKm ? 'កំពុងចាត់តាំង...' : 'Assigning...') : (isKm ? 'យល់ព្រមចាត់តាំង' : 'Confirm Assignment')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
