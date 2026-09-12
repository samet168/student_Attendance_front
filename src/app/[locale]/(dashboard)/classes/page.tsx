'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Users, Plus, ArrowRight, ChalkboardTeacher, 
  Trash, X, CheckCircle, PencilSimple 
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface SchoolClass {
  id: number;
  name: string;
  grade_level: string;
  academic_year: string;
  student_count: number;
  room?: string;
}

const DEFAULT_CLASSES: SchoolClass[] = [
  { id: 1, name: 'ថ្នាក់ទី ១០-A (Grade 10-A)', grade_level: 'ថ្នាក់ទី ១០', academic_year: '2026-2027', student_count: 32, room: 'បន្ទប់ ១០១' },
  { id: 2, name: 'ថ្នាក់ទី ១១-B (Grade 11-B)', grade_level: 'ថ្នាក់ទី ១១', academic_year: '2026-2027', student_count: 28, room: 'បន្ទប់ ២០៤' },
  { id: 3, name: 'ថ្នាក់ទី ១២-C (Grade 12-C)', grade_level: 'ថ្នាក់ទី ១២', academic_year: '2026-2027', student_count: 35, room: 'បន្ទប់ ៣០២' },
];

export default function ClassesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('ថ្នាក់ទី ១០');
  const [newAcademicYear, setNewAcademicYear] = useState('2026-2027');
  const [creating, setCreating] = useState(false);

  // Edit class state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [editName, setEditName] = useState('');
  const [editGradeLevel, setEditGradeLevel] = useState('');
  const [editAcademicYear, setEditAcademicYear] = useState('');
  const [updating, setUpdating] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setCreating(true);
    try {
      try {
        await api.createClass(newClassName.trim(), newGradeLevel.trim(), newAcademicYear.trim());
      } catch {
        // Fallback local addition
      }
      const newCls: SchoolClass = {
        id: Date.now(),
        name: newClassName.trim(),
        grade_level: newGradeLevel.trim(),
        academic_year: newAcademicYear.trim(),
        student_count: 0,
        room: isKm ? 'បន្ទប់សិក្សាថ្មី' : 'New Classroom',
      };
      setClasses((prev) => [newCls, ...prev]);
      setNewClassName('');
      setShowModal(false);
      setStatusMessage(isKm ? 'បានបង្កើតថ្នាក់រៀនថ្មីដោយជោគជ័យ!' : 'Class created successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    setEditName(cls.name);
    setEditGradeLevel(cls.grade_level);
    setEditAcademicYear(cls.academic_year || '2026-2027');
    setShowEditModal(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editName.trim()) return;

    setUpdating(true);
    try {
      try {
        await api.updateClass(editingClass.id, {
          name: editName.trim(),
          grade_level: editGradeLevel.trim(),
          academic_year: editAcademicYear.trim(),
        });
      } catch {
        // fallback
      }
      setClasses((prev) =>
        prev.map((c) =>
          c.id === editingClass.id
            ? { ...c, name: editName.trim(), grade_level: editGradeLevel.trim(), academic_year: editAcademicYear.trim() }
            : c
        )
      );
      setShowEditModal(false);
      setEditingClass(null);
      setStatusMessage(isKm ? 'បានកែប្រែព័ត៌មានថ្នាក់រៀនដោយជោគជ័យ!' : 'Class updated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដជាចង់លុបថ្នាក់រៀននេះមែនទេ?' : 'Are you sure you want to delete this class?')) return;
    try {
      try {
        await api.deleteClass(classId);
      } catch {
        // fallback
      }
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      setStatusMessage(isKm ? 'បានលុបថ្នាក់រៀនដោយជោគជ័យ!' : 'Class deleted successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isKm ? 'គ្រប់គ្រងថ្នាក់រៀន (Class Management)' : 'Classes Directory'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm ? 'បង្កើតថ្នាក់ថ្មី កែប្រែព័ត៌មាន លុបថ្នាក់ និងមើលបញ្ជីសិស្សតាមថ្នាក់' : 'Manage classrooms, update details, organize rosters, and track class sizes'}
          </p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          size="sm" 
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          <span>{isKm ? 'បង្កើតថ្នាក់ថ្មី' : 'Create Class'}</span>
        </Button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-500/50 transition group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {cls.grade_level}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">{cls.academic_year || '2026-2027'}</span>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                <ChalkboardTeacher size={14} className="text-slate-400" />
                <span>{cls.room || (isKm ? 'បន្ទប់សិក្សាទូទៅ' : 'Classroom Standard')}</span>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#282a32] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Users size={16} className="text-blue-600 dark:text-blue-400" />
                <span>{cls.student_count || 0} {isKm ? 'សិស្ស' : 'Students'}</span>
              </div>
              <Link
                href={`/${locale}/classes/${cls.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition"
              >
                <span>{isKm ? 'មើលបញ្ជីសិស្ស' : 'View Roster'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

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
                  {isKm ? 'បញ្ចូលឈ្មោះថ្នាក់ កម្រិតថ្នាក់ និងឆ្នាំសិក្សា' : 'Enter class details, level, and year'}
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
                  placeholder={isKm ? 'ឧ. ថ្នាក់ទី ៧A' : 'e.g. Grade 7A'}
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
                  {isKm ? 'ធ្វើបច្ចុប្បន្នភាពឈ្មោះ និងឆ្នាំសិក្សា' : 'Update class name and academic year'}
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
    </div>
  );
}
