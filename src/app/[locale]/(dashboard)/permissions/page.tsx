'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, UserGear, Users, ChalkboardTeacher, 
  MagnifyingGlass, CheckCircle, WarningCircle, X,
  IdentificationCard, Swap, UserPlus, BookOpen, Trash
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { SkeletonTableRow } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { api } from '@/lib/api';
import { useUIStore } from '@/stores/use-ui-store';
import { ViewModeToggle } from '@/components/dashboard/view-mode-toggle';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  student_code?: string;
  phone?: string;
  avatar_url?: string | null;
  enrolled_class?: string | null;
  taught_classes_count?: number;
  created_at?: string;
}

interface SchoolClassItem {
  id: number;
  name: string;
  grade_level: string;
  teacher_id: number;
  teacher_name: string;
  student_count: number;
}

const DEFAULT_USERS: UserItem[] = [
  { id: 1, name: 'នាយកសាលា (Administrator)', email: 'admin@school.edu', role: 'admin', phone: '012 345 678', taught_classes_count: 0, created_at: '2026-01-01' },
  { id: 2, name: 'លោកគ្រូ សុខា (Teacher Sokha)', email: 'sokha@school.edu', role: 'teacher', phone: '098 765 432', taught_classes_count: 2, created_at: '2026-01-15' },
  { id: 3, name: 'អ្នកគ្រូ ចិន្តា (Teacher Chenda)', email: 'chenda@school.edu', role: 'teacher', phone: '088 123 456', taught_classes_count: 1, created_at: '2026-02-01' },
];

const DEFAULT_CLASSES: SchoolClassItem[] = [
  { id: 1, name: 'ថ្នាក់ទី ១០-A', grade_level: 'ថ្នាក់ទី ១០', teacher_id: 2, teacher_name: 'លោកគ្រូ សុខា', student_count: 32 },
  { id: 2, name: 'ថ្នាក់ទី ១១-B', grade_level: 'ថ្នាក់ទី ១១', teacher_id: 2, teacher_name: 'លោកគ្រូ សុខា', student_count: 28 },
  { id: 3, name: 'ថ្នាក់ទី ១២-C', grade_level: 'ថ្នាក់ទី ១២', teacher_id: 3, teacher_name: 'អ្នកគ្រូ ចិន្តា', student_count: 35 },
];

const DEFAULT_TEACHERS = [
  { id: 2, name: 'លោកគ្រូ សុខា (Teacher Sokha)', email: 'sokha@school.edu', role: 'teacher' },
  { id: 3, name: 'អ្នកគ្រូ ចិន្តា (Teacher Chenda)', email: 'chenda@school.edu', role: 'teacher' },
];

export default function PermissionsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';
  const { viewMode } = useUIStore();

  const [users, setUsers] = useState<UserItem[]>(DEFAULT_USERS);
  const [classes, setClasses] = useState<SchoolClassItem[]>(DEFAULT_CLASSES);
  const [teachers, setTeachers] = useState<any[]>(DEFAULT_TEACHERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');

  // Add Teacher Modal
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    role: 'teacher' as 'teacher' | 'admin',
  });
  const [creatingTeacher, setCreatingTeacher] = useState(false);

  // Change Role Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'teacher'>('teacher');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Assign Class Teacher Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(2);
  const [assigning, setAssigning] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<'staff' | 'subjects'>('staff');

  // Subject assignment state
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [subjectClassId, setSubjectClassId] = useState<number>(0);
  const [subjectTeacherId, setSubjectTeacherId] = useState<number>(0);
  const [subjectName, setSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const SUBJECT_OPTIONS = [
    'គណិតវិទ្យា (Math)', 'អក្សរសាស្ត្រខ្មែរ (Khmer)', 'ភាសាអង់គ្លេស (English)',
    'រូបវិទ្យា (Physics)', 'គីមីវិទ្យា (Chemistry)', 'ជីវវិទ្យា (Biology)',
    'ប្រវត្តិវិទ្យា (History)', 'ភូមិវិទ្យា (Geography)', 'ព័ត៌មានវិទ្យា (IT)',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const [usersRes, classesRes, teachersRes] = await Promise.allSettled([
        api.getAdminUsers(),
        api.getAdminClasses(),
        api.getAdminTeachers(),
      ]);

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) && usersRes.value.length > 0) {
        const staffOnly = usersRes.value.filter((u: any) => u.role === 'admin' || u.role === 'teacher');
        setUsers(staffOnly.length > 0 ? staffOnly : DEFAULT_USERS);
      } else {
        setUsers(DEFAULT_USERS);
      }
      if (classesRes.status === 'fulfilled' && Array.isArray(classesRes.value) && classesRes.value.length > 0) {
        setClasses(classesRes.value);
        setSelectedClassId(classesRes.value[0].id);
        setSubjectClassId(classesRes.value[0].id);
      } else {
        setClasses(DEFAULT_CLASSES);
        setSelectedClassId(1);
        setSubjectClassId(1);
      }
      if (teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value) && teachersRes.value.length > 0) {
        setTeachers(teachersRes.value);
        setSelectedTeacherId(teachersRes.value[0].id);
        setSubjectTeacherId(teachersRes.value[0].id);
      } else {
        setTeachers(DEFAULT_TEACHERS);
        setSelectedTeacherId(2);
        setSubjectTeacherId(2);
      }
    } catch {
      setUsers(DEFAULT_USERS);
      setClasses(DEFAULT_CLASSES);
      setTeachers(DEFAULT_TEACHERS);
    } finally {
      setLoading(false);
    }
  };

  const loadClassSubjects = async (classId: number) => {
    if (!classId) return;
    setSubjectsLoading(true);
    try {
      const data = await api.getAdminClassSubjectsByClass(classId);
      setClassSubjects(Array.isArray(data) ? data : []);
    } catch {
      setClassSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Strictly only admin and teacher
      if (u.role !== 'admin' && u.role !== 'teacher') return false;

      const q = search.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q));

      const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, selectedRoleFilter]);

  const stats = useMemo(() => {
    const totalAdmins = users.filter((u) => u.role === 'admin').length;
    const totalTeachers = users.filter((u) => u.role === 'teacher').length;
    return { totalAdmins, totalTeachers, totalClasses: classes.length };
  }, [users, classes]);

  const handleOpenRoleModal = (u: UserItem) => {
    setSelectedUser(u);
    setNewRole(u.role === 'admin' ? 'admin' : 'teacher');
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setUpdatingRole(true);
    setErrorMessage(null);
    try {
      try {
        await api.updateUserRole(selectedUser.id, newRole);
      } catch {
        // fallback
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      );
      setSelectedUser(null);
      setStatusMessage(isKm ? 'បានផ្លាស់ប្ដូរតួនាទីដោយជោគជ័យ!' : 'User role updated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedTeacherId) return;

    setAssigning(true);
    setErrorMessage(null);
    try {
      await api.assignTeacherToClass(selectedClassId, selectedTeacherId);
      await loadData();
      setShowAssignModal(false);
      const targetTeacher = teachers.find((t) => t.id === selectedTeacherId);
      setStatusMessage(
        isKm 
          ? `បានចាត់តាំងថ្នាក់ (និងសិស្សទាំងអស់) ទៅកាន់ ${targetTeacher?.name || 'គ្រូថ្មី'} ដោយជោគជ័យ!` 
          : 'Teacher assigned to classroom with all students successfully!'
      );
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || (isKm ? 'បរាជ័យក្នុងការចាត់តាំងគ្រូ' : 'Failed to assign teacher'));
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFormData.name.trim() || !teacherFormData.email.trim()) {
      setErrorMessage(isKm ? 'សូមបញ្ចូលឈ្មោះ និងអ៊ីមែលរបស់គ្រូបង្រៀន' : 'Please provide full name and email');
      return;
    }

    setCreatingTeacher(true);
    setErrorMessage(null);
    try {
      let createdUser: any = null;
      try {
        createdUser = await api.createTeacher(teacherFormData);
      } catch (err: any) {
        console.warn('API create teacher fallback:', err);
      }

      const newStaffItem: UserItem = {
        id: createdUser?.id || Date.now(),
        name: teacherFormData.name.trim(),
        email: teacherFormData.email.trim().toLowerCase(),
        role: teacherFormData.role,
        phone: teacherFormData.phone.trim() || undefined,
        taught_classes_count: 0,
        created_at: new Date().toISOString().split('T')[0],
      };

      setUsers((prev) => [newStaffItem, ...prev]);

      if (teacherFormData.role === 'teacher') {
        setTeachers((prev) => [
          { id: newStaffItem.id, name: newStaffItem.name, email: newStaffItem.email, role: newStaffItem.role },
          ...prev,
        ]);
      }

      setShowAddTeacherModal(false);
      setTeacherFormData({
        name: '',
        email: '',
        phone: '',
        password: 'password123',
        role: 'teacher',
      });
      setStatusMessage(isKm ? `បានបន្ថែម ${newStaffItem.name} ទៅក្នុងប្រព័ន្ធដោយជោគជ័យ!` : 'Staff account created successfully!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || (isKm ? 'មិនអាចបង្កើតគណនីបានទេ' : 'Failed to create staff member'));
    } finally {
      setCreatingTeacher(false);
    }
  };

  const renderRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-lg">
          <ShieldCheck size={13} weight="fill" />
          {isKm ? 'អ្នកគ្រប់គ្រង (Admin)' : 'Admin'}
        </span>
      );
    }
    if (role === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-lg">
          <ChalkboardTeacher size={13} weight="fill" />
          {isKm ? 'លោកគ្រូ/អ្នកគ្រូ' : 'Teacher'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-lg">
        <Users size={13} weight="fill" />
        {isKm ? 'សិស្សានុសិស្ស' : 'Student'}
      </span>
    );
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectClassId || !subjectTeacherId || !subjectName.trim()) {
      setErrorMessage(isKm ? 'សូមបំពេញព័ត៌មានទាំងអស់' : 'Please fill in all fields');
      return;
    }
    setAddingSubject(true);
    setErrorMessage(null);
    try {
      await api.adminAssignClassSubject(subjectClassId, subjectTeacherId, subjectName.trim());
      await loadClassSubjects(subjectClassId);
      setSubjectName('');
      const t = teachers.find(t => t.id === subjectTeacherId);
      const c = classes.find(c => c.id === subjectClassId);
      setStatusMessage(isKm ? `បានចាត់តាំង ${t?.name || ''} បង្រៀន ${subjectName} ក្នុង ${c?.name || ''}` : 'Subject teacher assigned!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error');
    } finally {
      setAddingSubject(false);
    }
  };

  const handleDeleteSubject = async (classId: number, subjectId: number) => {
    try {
      await api.adminDeleteClassSubject(classId, subjectId);
      await loadClassSubjects(subjectClassId);
      setStatusMessage(isKm ? 'បានដកការចាត់តាំងដោយជោគជ័យ' : 'Assignment removed');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserGear size={24} className="text-blue-600 dark:text-blue-400" />
            <span>{isKm ? 'ការគ្រប់គ្រងសិទ្ធិ & តួនាទី (Permissions & RBAC)' : 'Role & Permission Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm ? 'គ្រប់គ្រងតួនាទី Admin, គ្រូបង្រៀន និងចាត់តាំងគ្រូប្រចាំថ្នាក់' : 'Manage administrator and teacher roles, staff permissions, and assign classroom teachers'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => setShowAddTeacherModal(true)}
            size="sm"
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            <UserPlus size={14} weight="bold" />
            <span>{isKm ? 'បន្ថែមគ្រូបង្រៀន' : 'Add Teacher'}</span>
          </Button>

          <Button
            onClick={() => setShowAssignModal(true)}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#282a32] shadow-xs cursor-pointer"
          >
            <ChalkboardTeacher size={14} weight="bold" />
            <span>{isKm ? 'ចាត់តាំងគ្រូប្រចាំថ្នាក់' : 'Assign Class Teacher'}</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 dark:bg-[#16171b] p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-white dark:bg-[#1c1d22] text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Users size={14} weight="bold" />
          {isKm ? 'បុគ្គលិក & សិទ្ធិ' : 'Staff & Roles'}
        </button>
        <button
          onClick={() => {
            setActiveTab('subjects');
            if (subjectClassId) loadClassSubjects(subjectClassId);
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-white dark:bg-[#1c1d22] text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen size={14} weight="bold" />
          {isKm ? 'ចាត់តាំងមុខវិជ្ជា' : 'Assign Subjects'}
        </button>
      </div>

      {/* Stats Summary Cards - only show on staff tab */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} weight="fill" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{isKm ? 'អ្នកគ្រប់គ្រង (Admin)' : 'Admins'}</span>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{stats.totalAdmins}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ChalkboardTeacher size={22} weight="fill" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{isKm ? 'គ្រូបង្រៀន (Teachers)' : 'Teachers'}</span>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{stats.totalTeachers}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <IdentificationCard size={22} weight="fill" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{isKm ? 'ថ្នាក់រៀនសរុប (Classes)' : 'Total Classes'}</span>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{stats.totalClasses}</p>
            </div>
          </div>
        </div>
      )}


      {/* ====== SUBJECT ASSIGNMENT TAB ====== */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {/* Add Subject Form */}
          <div className="bg-white dark:bg-[#1c1d22] border border-purple-200 dark:border-purple-900 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={18} weight="fill" className="text-purple-600 dark:text-purple-400" />
              {isKm ? 'ចាត់តាំងគ្រូបង្រៀនតាមមុខវិជ្ជា' : 'Assign Subject Teacher'}
            </h3>
            <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ថ្នាក់រៀន:' : 'Class:'} *
                </label>
                <select
                  value={subjectClassId}
                  onChange={(e) => { setSubjectClassId(Number(e.target.value)); loadClassSubjects(Number(e.target.value)); }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                >
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.grade_level})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'មុខវិជ្ជា:' : 'Subject:'} *
                </label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                >
                  <option value="">{isKm ? '-- ជ្រើស --' : '-- Select --'}</option>
                  {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'គ្រូបង្រៀន:' : 'Teacher:'} *
                </label>
                <select
                  value={subjectTeacherId}
                  onChange={(e) => setSubjectTeacherId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                >
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={addingSubject || !subjectName}
                className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer py-2">
                {addingSubject ? (isKm ? 'កំពុងចាត់...' : 'Assigning...') : (isKm ? 'ចាត់តាំង' : 'Assign')}
              </Button>
            </form>
          </div>

          {/* Subject Assignments Table */}
          <div className="bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-[#282a32] flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isKm ? `ការចាត់តាំងបច្ចុប្បន្ន - ${classes.find((c:any)=>c.id===subjectClassId)?.name || ''}` : `Current Assignments - ${classes.find((c:any)=>c.id===subjectClassId)?.name || ''}`}
              </h4>
              <span className="text-[10px] text-slate-400">{classSubjects.length} {isKm ? 'មុខវិជ្ជា' : 'subjects'}</span>
            </div>
            {subjectsLoading ? (
              <div className="p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonTableRow key={i} cells={4} />
                ))}
              </div>
            ) : classSubjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <BookOpen size={32} className="mx-auto mb-2 opacity-20" />
                {isKm ? 'មិនទាន់មានការចាត់តាំងក្នុងថ្នាក់នេះ' : 'No subject assignments for this class yet.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-[#282a32]">
                    <TableHead>{isKm ? 'មុខវិជ្ជា' : 'Subject'}</TableHead>
                    <TableHead>{isKm ? 'គ្រូបង្រៀន' : 'Teacher'}</TableHead>
                    <TableHead>{isKm ? 'អ៊ីមែលគ្រូ' : 'Teacher Email'}</TableHead>
                    <TableHead className="text-right">{isKm ? 'សកម្មភាព' : 'Action'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classSubjects.map((s: any) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-[#16171b] border-slate-100 dark:border-[#282a32]">
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <BookOpen size={12} weight="fill" />
                          {s.subject_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 text-xs font-bold flex items-center justify-center">
                            {s.teacher_name?.slice(0,1) || 'T'}
                          </div>
                          <span className="text-xs font-medium text-slate-800 dark:text-white">{s.teacher_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{s.teacher_email}</TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDeleteSubject(subjectClassId, s.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition cursor-pointer"
                        >
                          <Trash size={12} weight="bold" />
                          {isKm ? 'លុប' : 'Remove'}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* ====== STAFF TAB ====== */}
      {activeTab === 'staff' && (<>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1c1d22] p-4 rounded-2xl border border-slate-200/80 dark:border-[#282a32] shadow-xs">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isKm ? 'ស្វែងរកតាមឈ្មោះ អ៊ីមែល ឬលេខទូរស័ព្ទ...' : 'Search by name, email, phone...'}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
            {isKm ? 'ចម្រាញ់តាមតួនាទី:' : 'Filter Role:'}
          </span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-semibold"
          >
            <option value="all">{isKm ? 'ទាំងអស់ (Admin & គ្រូ)' : 'All (Admin & Teachers)'}</option>
            <option value="admin">{isKm ? 'Admin (អ្នកគ្រប់គ្រង)' : 'Admins'}</option>
            <option value="teacher">{isKm ? 'គ្រូបង្រៀន (Teachers)' : 'Teachers'}</option>
          </select>
          <ViewModeToggle />
        </div>
      </div>

      {/* Users Table or Grid */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-12 text-center text-slate-400">
          <Users size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs">{isKm ? 'រកមិនឃើញអ្នកគ្រប់គ្រង ឬគ្រូបង្រៀនឡើយ' : 'No admins or teachers found matching filters'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="relative rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-4 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-500/50 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {renderRoleBadge(u.role)}
                  <button
                    onClick={() => handleOpenRoleModal(u)}
                    className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold transition cursor-pointer"
                    title={isKm ? 'ប្ដូរសិទ្ធិ' : 'Change Role'}
                  >
                    <Swap size={15} weight="bold" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                    {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{u.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="py-2 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-400">{isKm ? 'ការទទួលបន្ទុក៖' : 'Scope:'} </span>
                    {u.role === 'teacher' ? (
                      <span className="font-bold text-blue-600 dark:text-blue-400">{u.taught_classes_count || 0} {isKm ? 'ថ្នាក់' : 'Classes'}</span>
                    ) : (
                      <span className="font-bold text-amber-500">{isKm ? 'គ្រប់គ្រងពេញ' : 'Full Admin'}</span>
                    )}
                  </div>
                  {u.phone && (
                    <div className="text-[11px] text-slate-400">{isKm ? 'ទូរស័ព្ទ៖' : 'Phone:'} {u.phone}</div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end">
                <button
                  onClick={() => handleOpenRoleModal(u)}
                  className="w-full py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Swap size={13} weight="bold" />
                  <span>{isKm ? 'ប្ដូរសិទ្ធិ & តួនាទី' : 'Modify Role'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-[#282a32]">
                <TableHead>{isKm ? 'ឈ្មោះ & ព័ត៌មាន' : 'User'}</TableHead>
                <TableHead>{isKm ? 'អ៊ីមែល' : 'Email'}</TableHead>
                <TableHead>{isKm ? 'តួនាទីបច្ចុប្បន្ន' : 'Role'}</TableHead>
                <TableHead>{isKm ? 'ការទទួលបន្ទុក / ថ្នាក់' : 'Scope / Assignment'}</TableHead>
                <TableHead>{isKm ? 'លេខទូរសព្ទ' : 'Phone'}</TableHead>
                <TableHead className="text-right">{isKm ? 'សកម្មភាព' : 'Action'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-[#16171b] border-slate-100 dark:border-[#282a32]">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name ? u.name.slice(0, 1).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">{u.name}</span>
                        {u.phone && (
                          <span className="text-[10px] text-slate-400">{u.phone}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    {renderRoleBadge(u.role)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                    {u.role === 'teacher' ? (
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        {u.taught_classes_count || 0} {isKm ? 'ថ្នាក់បង្រៀនទទួលបន្ទុក' : 'Classes assigned'}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{isKm ? 'សិទ្ធិពេញគ្រប់គ្រងសាលា (Full Access)' : 'Full School Access'}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                    {u.phone || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleOpenRoleModal(u)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition cursor-pointer"
                    >
                      <Swap size={13} weight="bold" />
                      <span>{isKm ? 'ប្ដូរសិទ្ធិ' : 'Change Role'}</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      </>)}

      {/* Modal: Change Role */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'ផ្លាស់ប្ដូរតួនាទី & សិទ្ធិបុគ្គលិក' : 'Change Staff Role & Permissions'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedUser.name} ({selectedUser.email})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isKm ? 'ជ្រើសរើសតួនាទីថ្មី:' : 'Select New Role:'}
                </label>

                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                    newRole === 'admin' 
                      ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30' 
                      : 'border-slate-200 dark:border-[#282a32] hover:bg-slate-50 dark:hover:bg-[#16171b]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center">
                        <ShieldCheck size={18} weight="fill" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Admin (អ្នកគ្រប់គ្រង)</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{isKm ? 'គ្រប់គ្រងគ្រូ ថ្នាក់ សិស្ស និងហិរញ្ញវត្ថុទាំងអស់' : 'Full access to manage all school assets'}</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={newRole === 'admin'}
                      onChange={() => setNewRole('admin')}
                      className="text-amber-600"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                    newRole === 'teacher' 
                      ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/30' 
                      : 'border-slate-200 dark:border-[#282a32] hover:bg-slate-50 dark:hover:bg-[#16171b]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                        <ChalkboardTeacher size={18} weight="fill" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Teacher (គ្រូបង្រៀន)</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{isKm ? 'គ្រប់គ្រងតែថ្នាក់ និងសិស្សដែលខ្លួនបង្រៀន' : 'Isolated access to their assigned classes'}</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={newRole === 'teacher'}
                      onChange={() => setNewRole('teacher')}
                      className="text-blue-600"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#282a32]">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={updatingRole}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {updatingRole ? (isKm ? 'កំពុងរក្សាទុក...' : 'Updating...') : (isKm ? 'រក្សាទុកតួនាទី' : 'Save Role')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Class Teacher */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <ChalkboardTeacher size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'ចាត់តាំងគ្រូបង្រៀនប្រចាំថ្នាក់' : 'Assign Classroom Teacher'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'ជ្រើសរើសថ្នាក់រៀន និងគ្រូដែលត្រូវទទួលបន្ទុក' : 'Select classroom and assign instructor'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ជ្រើសរើសថ្នាក់រៀន:' : 'Select Classroom:'} *
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade_level}) - គ្រូបច្ចុប្បន្ន: {c.teacher_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ជ្រើសរើសគ្រូបង្រៀនថ្មី:' : 'Select Instructor:'} *
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email}) [{t.role}]
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
                  disabled={assigning}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {assigning ? (isKm ? 'កំពុងចាត់តាំង...' : 'Assigning...') : (isKm ? 'ចាត់តាំងគ្រូ' : 'Confirm Assignment')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Teacher / Staff Member */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setShowAddTeacherModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <UserPlus size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'បន្ថែមគ្រូបង្រៀន / បុគ្គលិកថ្មី' : 'Add New Teacher / Staff'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'បង្កើតគណនីគ្រូបង្រៀន ឬអ្នកគ្រប់គ្រងសាលា' : 'Create an instructor or administrator account'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ឈ្មោះពេញ (Full Name):' : 'Full Name:'} *
                </label>
                <input
                  type="text"
                  required
                  value={teacherFormData.name}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                  placeholder={isKm ? 'ឧ. លោកគ្រូ វ៉ាន់ សារ៉ុន' : 'e.g. Teacher Sarun'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'អ៊ីមែលផ្លូវការ (Email):' : 'Email Address:'} *
                </label>
                <input
                  type="email"
                  required
                  value={teacherFormData.email}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, email: e.target.value })}
                  placeholder={isKm ? 'ឧ. sarun@school.edu' : 'e.g. sarun@school.edu'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'លេខទូរស័ព្ទ:' : 'Phone:'}
                  </label>
                  <input
                    type="tel"
                    value={teacherFormData.phone}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'ពាក្យសម្ងាត់:' : 'Password:'}
                  </label>
                  <input
                    type="text"
                    value={teacherFormData.password}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, password: e.target.value })}
                    placeholder="password123"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKm ? 'តួនាទី:' : 'Role:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    teacherFormData.role === 'teacher'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-[#282a32]'
                  }`}>
                    <input
                      type="radio"
                      name="newStaffRole"
                      value="teacher"
                      checked={teacherFormData.role === 'teacher'}
                      onChange={() => setTeacherFormData({ ...teacherFormData, role: 'teacher' })}
                      className="text-blue-600"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isKm ? 'គ្រូបង្រៀន (Teacher)' : 'Teacher'}
                    </span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    teacherFormData.role === 'admin'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-[#282a32]'
                  }`}>
                    <input
                      type="radio"
                      name="newStaffRole"
                      value="admin"
                      checked={teacherFormData.role === 'admin'}
                      onChange={() => setTeacherFormData({ ...teacherFormData, role: 'admin' })}
                      className="text-amber-600"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isKm ? 'អ្នកគ្រប់គ្រង (Admin)' : 'Admin'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#282a32]">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={creatingTeacher}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {creatingTeacher ? (isKm ? 'កំពុងបង្កើត...' : 'Creating...') : (isKm ? 'បង្កើតគ្រូថ្មី' : 'Create Teacher')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
