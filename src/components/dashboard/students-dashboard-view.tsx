'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlass, Plus, Funnel, ArrowClockwise, Sparkle, Users
} from '@phosphor-icons/react';
import { StudentItem, ClassItem } from '@/types';
import { api } from '@/lib/api';
import { useAppStore, translations } from '@/lib/store';
import { DraggableTable } from '@/components/dashboard/draggable-table';
import { CardGrid } from '@/components/dashboard/card-grid';
import { ExportDropdown } from '@/components/dashboard/export-dropdown';
import { ViewSwitcher } from '@/components/dashboard/view-switcher';

interface StudentsDashboardViewProps {
  selectedClass: ClassItem | null;
  classes: ClassItem[];
  onSelectClass: (c: ClassItem) => void;
  onRefreshStats?: () => void;
}

export const StudentsDashboardView: React.FC<StudentsDashboardViewProps> = ({
  selectedClass,
  classes,
  onSelectClass,
}) => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '', student_code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { viewMode, language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass.id);
    }
  }, [selectedClass]);

  const loadStudents = async (classId: number) => {
    setLoading(true);
    try {
      const data = await api.getClassStudents(classId);
      setStudents(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      await api.addStudent(selectedClass.id, newStudent);
      setIsAddModalOpen(false);
      setNewStudent({ name: '', email: '', phone: '', student_code: '' });
      loadStudents(selectedClass.id);
    } catch (err: any) {
      alert(err.message || 'Error adding student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!selectedClass || !confirm('តើអ្នកពិតជាចង់ដកសិស្សនេះចេញពីថ្នាក់មែនទេ?')) return;
    try {
      await api.unenrollStudent(selectedClass.id, studentId);
      loadStudents(selectedClass.id);
    } catch {
      alert('បរាជ័យក្នុងការដកសិស្ស');
    }
  };

  // Filter students based on search and status
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner / Breadcrumb & Class Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
            <span>{t.dashboard}</span>
            <span>&gt;</span>
            <span>{t.classes}</span>
            <span>&gt;</span>
            <span className="text-blue-600 font-semibold">{selectedClass?.name || 'All'}</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>{selectedClass ? `${selectedClass.name} (${selectedClass.grade_level})` : t.students}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {students.length} {t.students}
            </span>
          </h2>
        </div>

        {/* Class switcher tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectClass(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                selectedClass?.id === c.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action Toolbar: Search, Filter, Export, View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher (Table vs Grid) */}
          <ViewSwitcher />

          {/* Export Dropdown (Excel, PDF, Word, PPTX) */}
          <ExportDropdown
            data={filteredStudents}
            classNameTitle={selectedClass?.name || 'Class'}
          />

          {/* Add Student Primary Action */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>{t.addStudent}</span>
          </button>
        </div>
      </div>

      {/* Data Container: Switchable Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>កំពុងទាញយកទិន្នន័យ...</span>
        </div>
      ) : viewMode === 'table' ? (
        <DraggableTable
          students={filteredStudents}
          onDelete={handleDeleteStudent}
        />
      ) : (
        <CardGrid
          students={filteredStudents}
          onDelete={handleDeleteStudent}
        />
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">{t.addStudent}</h3>
            <p className="text-xs text-slate-500 mb-4">
              បញ្ចូលព័ត៌មានសិស្សដើម្បីចុះឈ្មោះក្នុងថ្នាក់ {selectedClass?.name}
            </p>

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">គោត្តនាម-នាម</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុខ ចាន់ដា"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">អ៊ីមែល (Email)</label>
                <input
                  type="email"
                  required
                  placeholder="student@school.edu.kh"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">លេខទូរស័ព្ទ (Phone)</label>
                <input
                  type="tel"
                  placeholder="012 345 678"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">អត្តលេខ (Student ID - ស្រេចចិត្ត)</label>
                <input
                  type="text"
                  placeholder="STU-001 (ស្វ័យប្រវត្តបើទុកទទេ)"
                  value={newStudent.student_code}
                  onChange={(e) => setNewStudent({ ...newStudent, student_code: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
