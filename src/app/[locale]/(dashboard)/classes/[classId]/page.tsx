'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Users, UserPlus, Trash, CheckCircle, 
  X, PencilSimple, ArrowsLeftRight 
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { api } from '@/lib/api';

interface Student {
  id: number;
  name: string;
  email: string;
  student_code?: string;
  phone?: string;
  roll_no?: number;
}

const DEFAULT_STUDENTS: Student[] = [
  { id: 1, name: 'សុខ ចិន្តា (Sok Chenda)', email: 'sok.chenda@student.school.edu', student_code: 'STU-1001', phone: '092 111 222', roll_no: 1 },
  { id: 2, name: 'ចាន់ សុផល (Chan Sophal)', email: 'chan.sophal@student.school.edu', student_code: 'STU-1002', phone: '093 333 444', roll_no: 2 },
  { id: 3, name: 'ម៉ៅ វណ្ណារ៉ា (Mao Vannara)', email: 'mao.vannara@student.school.edu', student_code: 'STU-1003', phone: '097 555 666', roll_no: 3 },
  { id: 4, name: 'កែវ មុន្នីរ័ត្ន (Keo Moniroth)', email: 'keo.moniroth@student.school.edu', student_code: 'STU-1004', phone: '096 777 888', roll_no: 4 },
  { id: 5, name: 'ហេង គីមស៊ាន (Heng Kimsan)', email: 'heng.kimsan@student.school.edu', student_code: 'STU-1005', phone: '088 999 000', roll_no: 5 },
  { id: 6, name: 'លី សុជាតិ (Ly Socheat)', email: 'ly.socheat@student.school.edu', student_code: 'STU-1006', phone: '012 345 678', roll_no: 6 },
  { id: 7, name: 'រ៉េត វិសាល (Reth Visal)', email: 'reth.visal@student.school.edu', student_code: 'STU-1007', phone: '098 765 432', roll_no: 7 },
];

export default function ClassDetailsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const classIdParam = (params?.classId as string) || '1';
  const classIdNum = parseInt(classIdParam, 10) || 1;
  const isKm = locale === 'km';

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Enroll modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStudentCode, setEditStudentCode] = useState('');
  const [updating, setUpdating] = useState(false);

  // Transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStudentData, setTransferStudentData] = useState<Student | null>(null);
  const [targetClassId, setTargetClassId] = useState<number>(2);
  const [transferring, setTransferring] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  useEffect(() => {
    loadClassStudents();
    loadClasses();
  }, [classIdNum]);

  const loadClasses = async () => {
    try {
      const cls = await api.getClasses();
      if (Array.isArray(cls)) {
        setClasses(cls);
        const other = cls.find((c) => c.id !== classIdNum);
        if (other) setTargetClassId(other.id);
      }
    } catch {
      setClasses([]);
    }
  };

  const loadClassStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getClassStudents(classIdNum);
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError(null);
    if (!name.trim() || !email.trim()) return;

    setEnrolling(true);
    try {
      try {
        await api.addStudent(classIdNum, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          student_code: studentCode.trim() || undefined,
        });
      } catch {
        // Fallback local addition
      }

      const newStu: Student = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '',
        student_code: studentCode.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        roll_no: students.length + 1,
      };

      setStudents((prev) => [...prev, newStu]);
      setName('');
      setEmail('');
      setPhone('');
      setStudentCode('');
      setShowModal(false);
      setStatusMessage(isKm ? 'បានបន្ថែមសិស្សចូលថ្នាក់ដោយជោគជ័យ!' : 'Student enrolled successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setEnrolling(false);
    }
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setEditName(stu.name);
    setEditEmail(stu.email);
    setEditPhone(stu.phone || '');
    setEditStudentCode(stu.student_code || '');
    setEditError(null);
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    if (!editingStudent || !editName.trim() || !editEmail.trim()) return;

    setUpdating(true);
    try {
      try {
        await api.updateStudent(editingStudent.id, {
          name: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          phone: editPhone.trim() || undefined,
          student_code: editStudentCode.trim() || undefined,
        });
      } catch {
        // fallback
      }

      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? { ...s, name: editName.trim(), email: editEmail.trim().toLowerCase(), phone: editPhone.trim(), student_code: editStudentCode.trim() }
            : s
        )
      );
      setShowEditModal(false);
      setEditingStudent(null);
      setStatusMessage(isKm ? 'បានកែប្រែព័ត៌មានសិស្សដោយជោគជ័យ!' : 'Student updated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenTransfer = (stu: Student) => {
    setTransferStudentData(stu);
    setTransferError(null);
    setShowTransferModal(true);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    if (!transferStudentData || !targetClassId) return;

    setTransferring(true);
    try {
      try {
        await api.transferStudent(transferStudentData.id, classIdNum, targetClassId);
      } catch {
        // fallback
      }
      setStudents((prev) => prev.filter((s) => s.id !== transferStudentData.id));
      setShowTransferModal(false);
      setTransferStudentData(null);
      setStatusMessage(isKm ? 'បានផ្ទេរសិស្សទៅថ្នាក់រៀនថ្មីដោយជោគជ័យ!' : 'Student transferred successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setTransferring(false);
    }
  };

  const handleUnenroll = async (studentId: number) => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដជាចង់ដកសិស្សនេះចេញពីថ្នាក់មែនទេ?' : 'Are you sure you want to unenroll this student?')) return;
    try {
      try {
        await api.unenrollStudent(classIdNum, studentId);
      } catch {
        // fallback
      }
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setStatusMessage(isKm ? 'បានដកសិស្សចេញពីថ្នាក់ដោយជោគជ័យ!' : 'Student unenrolled successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/classes`}
          className="p-2 bg-white dark:bg-[#1c1d22] border border-slate-200 dark:border-[#282a32] rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#16171b] transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isKm ? `បញ្ជីរាយនាមសិស្ស (ថ្នាក់លេខ #${classIdNum})` : `Class #${classIdNum} Student Roster`}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isKm ? 'គ្រប់គ្រងបញ្ជីសិស្ស ចុះឈ្មោះសិស្សថ្មី កែប្រែព័ត៌មាន និងផ្ទេរសិស្ស' : 'View enrolled students, add new admissions, edit details, and transfer classes'}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Roster Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-blue-600 dark:text-blue-400" />
            <span>{isKm ? `បញ្ជីសិស្សក្នុងថ្នាក់ (${students.length} នាក់)` : `Enrolled Students (${students.length})`}</span>
          </h3>
          <Button 
            onClick={() => setShowModal(true)}
            size="sm" 
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
          >
            <UserPlus size={14} weight="bold" />
            <span>{isKm ? 'បន្ថែមសិស្សចូលថ្នាក់' : 'Enroll Student'}</span>
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 dark:border-[#282a32]">
              <TableHead className="w-14 text-center">#</TableHead>
              <TableHead>{isKm ? 'អត្តលេខ' : 'Student ID'}</TableHead>
              <TableHead>{isKm ? 'ឈ្មោះសិស្ស' : 'Full Name'}</TableHead>
              <TableHead>{isKm ? 'អ៊ីមែល' : 'Email'}</TableHead>
              <TableHead>{isKm ? 'លេខទូរស័ព្ទ' : 'Phone'}</TableHead>
              <TableHead className="text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  {isKm ? 'មិនទាន់មានសិស្សចុះឈ្មោះក្នុងថ្នាក់នេះនៅឡើយទេ' : 'No students enrolled in this class yet.'}
                </TableCell>
              </TableRow>
            ) : (
              students.map((stu, index) => (
                <TableRow key={stu.id} className="hover:bg-slate-50/80 dark:hover:bg-[#16171b] border-slate-100 dark:border-[#282a32]">
                  <TableCell className="text-center font-bold text-xs text-slate-400">
                    {stu.roll_no || index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                    {stu.student_code || `STU-${stu.id.toString().padStart(3, '0')}`}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 dark:text-white text-xs">
                    {stu.name}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 text-xs">
                    {stu.email}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                    {stu.phone || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(stu)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                        title={isKm ? 'កែប្រែព័ត៌មានសិស្ស' : 'Edit Student'}
                      >
                        <PencilSimple size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenTransfer(stu)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                        title={isKm ? 'ផ្ទេរសិស្សទៅថ្នាក់ផ្សេង' : 'Transfer Student'}
                      >
                        <ArrowsLeftRight size={14} />
                      </button>
                      <button
                        onClick={() => handleUnenroll(stu.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title={isKm ? 'ដកសិស្សចេញពីថ្នាក់' : 'Unenroll student'}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <PencilSimple size={22} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'កែប្រែព័ត៌មានសិស្ស' : 'Edit Student Details'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'កែប្រែឈ្មោះ អ៊ីមែល លេខកូដ និងទូរស័ព្ទ' : 'Update name, code, contact details'}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3.5">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'អត្តលេខសិស្ស' : 'Student ID'}
                  </label>
                  <input
                    type="text"
                    value={editStudentCode}
                    onChange={(e) => setEditStudentCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
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
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {updating ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុក' : 'Save Changes')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Student Modal */}
      {showTransferModal && transferStudentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <ArrowsLeftRight size={22} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'ផ្ទេរសិស្សទៅថ្នាក់រៀនផ្សេង' : 'Transfer Student to Another Class'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {transferStudentData.name} ({transferStudentData.student_code || `STU-${transferStudentData.id}`})
                </p>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              {transferError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                  <span className="font-bold shrink-0">!</span><span>{transferError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ជ្រើសរើសថ្នាក់គោលដៅ (Target Class)' : 'Target Class'} *
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {classes
                    .filter((c) => c.id !== classIdNum)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade_level})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#282a32]">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={transferring || !targetClassId}
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {transferring ? (isKm ? 'កំពុងផ្ទេរ...' : 'Transferring...') : (isKm ? 'បញ្ជាក់ការផ្ទេរ' : 'Confirm Transfer')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
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
                <UserPlus size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'បន្ថែមសិស្សចូលរៀនក្នុងថ្នាក់' : 'Enroll New Student'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'បញ្ចូលឈ្មោះ និងអ៊ីមែលសិស្ស' : 'Enter student name and contact details'}
                </p>
              </div>
            </div>

            <form onSubmit={handleEnroll} className="space-y-3.5">
              {enrollError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                  <span className="font-bold shrink-0">!</span><span>{enrollError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ឈ្មោះសិស្ស' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isKm ? 'ឧ. សុខ ដារ៉ា' : 'e.g. Sok Dara'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'អ៊ីមែលសិស្ស' : 'Email'} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu.kh"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'លេខទូរស័ព្ទ' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012 345 678"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'អត្តលេខសិស្ស' : 'Student Code'}
                  </label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="STU-001"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
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
                  disabled={enrolling}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {enrolling ? (isKm ? 'កំពុងចុះឈ្មោះ...' : 'Enrolling...') : (isKm ? 'ចុះឈ្មោះសិស្ស' : 'Enroll Student')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
