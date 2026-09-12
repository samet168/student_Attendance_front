'use client';

import React, { useState } from 'react';
import { Users, BookOpen, CalendarCheck, Award, PlusCircle, CheckCircle2 } from 'lucide-react';
import { ClassItem } from '@/types';
import { api } from '@/lib/api';
import { StudentsDashboardView } from '@/components/dashboard/students-dashboard-view';

interface TeacherOverviewProps {
  classes: ClassItem[];
  selectedClass: ClassItem | null;
  onSelectClass: (c: ClassItem) => void;
  onNavigateTab: (tab: any) => void;
  onRefreshData: () => void;
  stats: any;
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({
  classes,
  selectedClass,
  onSelectClass,
  onNavigateTab,
  onRefreshData,
  stats,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('ថ្នាក់ទី ៧');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;
    setLoading(true);
    try {
      await api.createClass(newClassName, newGradeLevel);
      setNewClassName('');
      setShowCreateClassModal(false);
      setMsg('បានបង្កើតថ្នាក់រៀនដោយជោគជ័យ!');
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !newStudentName || !newStudentEmail) return;
    setLoading(true);
    try {
      await api.addStudent(selectedClass.id, {
        name: newStudentName,
        email: newStudentEmail,
        phone: newStudentPhone,
      });
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentPhone('');
      setShowAddModal(false);
      setMsg('បានចុះឈ្មោះសិស្សថ្មីរួចរាល់!');
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Banner / Current Class Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-600/15">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-white/20 rounded-full inline-block mb-2">
              ផ្ទាំងគ្រប់គ្រងគ្រូបង្រៀន
            </span>
            <h2 className="text-xl font-bold">ថ្នាក់បច្ចុប្បន្ន: {selectedClass?.name || 'មិនទាន់ជ្រើសរើស'}</h2>
            <p className="text-xs text-blue-100 mt-1">
              កម្រិត: {selectedClass?.grade_level || '-'} • ឆ្នាំសិក្សា {selectedClass?.academic_year || '2025-2026'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateClassModal(true)}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition flex items-center space-x-1 text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">បង្កើតថ្នាក់</span>
          </button>
        </div>

        {/* Class Selector Badges */}
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectClass(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedClass?.id === c.id
                  ? 'bg-white text-blue-800 shadow-md font-bold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {c.name} ({c.student_count || 0} នាក់)
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">សិស្សសរុប</p>
          <h4 className="text-xl font-bold text-slate-800">{stats?.total_students || 0} នាក់</h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">ថ្នាក់បង្រៀន</p>
          <h4 className="text-xl font-bold text-slate-800">{stats?.total_classes || 0} ថ្នាក់</h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <Award className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">កិច្ចការដាក់ឱ្យ</p>
          <h4 className="text-xl font-bold text-slate-800">{stats?.total_homeworks || 0} មេរៀន</h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">កិច្ចការត្រូវកែ</p>
          <h4 className="text-xl font-bold text-slate-800">{stats?.pending_reviews || 0} ក្បាល</h4>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3.5">មុខងារគ្រប់គ្រងសំខាន់ៗ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-200 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">ស្រង់វត្តមាន</p>
            <p className="text-[10px] text-slate-500">កត់ត្រាវត្តមានប្រចាំថ្ងៃ</p>
          </button>

          <button
            onClick={() => onNavigateTab('grades')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">បញ្ចូលពិន្ទុ</p>
            <p className="text-[10px] text-slate-500">គណនាមធ្យមភាគ & ចំណាត់ថ្នាក់</p>
          </button>

          <button
            onClick={() => onNavigateTab('homework')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">ដាក់កិច្ចការ</p>
            <p className="text-[10px] text-slate-500">Upload មេរៀន Cloudinary</p>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-slate-200/70 hover:border-violet-200 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-violet-700">បន្ថែមសិស្ស</p>
            <p className="text-[10px] text-slate-500">ចុះឈ្មោះសិស្សថ្មីក្នុងថ្នាក់</p>
          </button>
        </div>
      </div>

      {/* Students & Classes Enterprise Dashboard with Drag & Drop and Multi-format Export */}
      <div className="pt-2">
        <StudentsDashboardView
          selectedClass={selectedClass}
          classes={classes}
          onSelectClass={onSelectClass}
        />
      </div>
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">បង្កើតថ្នាក់រៀនថ្មី</h3>
            <form onSubmit={handleCreateClass} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ឈ្មោះថ្នាក់</label>
                <input
                  type="text"
                  placeholder="ឧ. ថ្នាក់ទី ៧A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">កម្រិតថ្នាក់</label>
                <select
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="ថ្នាក់ទី ៧">ថ្នាក់ទី ៧</option>
                  <option value="ថ្នាក់ទី ៨">ថ្នាក់ទី ៨</option>
                  <option value="ថ្នាក់ទី ៩">ថ្នាក់ទី ៩</option>
                  <option value="ថ្នាក់ទី ១០">ថ្នាក់ទី ១០</option>
                  <option value="ថ្នាក់ទី ១១">ថ្នាក់ទី ១១</option>
                  <option value="ថ្នាក់ទី ១២">ថ្នាក់ទី ១២</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow"
                >
                  {loading ? 'កំពុងបង្កើត...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">ចុះឈ្មោះសិស្សថ្មី</h3>
            <p className="text-xs text-slate-500 mb-4">ថ្នាក់: {selectedClass?.name}</p>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ឈ្មោះសិស្ស</label>
                <input
                  type="text"
                  placeholder="ឧ. សេង វិបុល"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email សម្រាប់ Login OTP</label>
                <input
                  type="email"
                  placeholder="student@school.edu.kh"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">លេខទូរស័ព្ទ (ជម្រើស)</label>
                <input
                  type="text"
                  placeholder="012 345 678"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow"
                >
                  {loading ? 'កំពុងបញ្ចូល...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
