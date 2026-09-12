'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, AlertCircle, Save, CheckCheck, RefreshCw } from 'lucide-react';
import { ClassItem, AttendanceRecord } from '@/types';
import { api } from '@/lib/api';

interface TeacherAttendanceProps {
  selectedClass: ClassItem | null;
}

export const TeacherAttendance: React.FC<TeacherAttendanceProps> = ({ selectedClass }) => {
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      loadAttendance();
    }
  }, [selectedClass, dateStr]);

  const loadAttendance = async () => {
    if (!selectedClass) return;
    setLoading(true);
    setSaveSuccess(false);
    try {
      const data = await api.getAttendance(selectedClass.id, dateStr);
      setRecords(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: number, status: 'present' | 'absent' | 'permission') => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status } : r))
    );
  };

  const handleNoteChange = (studentId: number, notes: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, notes } : r))
    );
  };

  const markAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'present' })));
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      await api.saveAttendance(
        selectedClass.id,
        dateStr,
        records.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          notes: r.notes,
        }))
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Stats for the day
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const permissionCount = records.filter((r) => r.status === 'permission').length;

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">កត់ត្រាវត្តមានប្រចាំថ្ងៃ</h2>
            <p className="text-xs text-slate-500">
              ថ្នាក់: <span className="font-semibold text-blue-600">{selectedClass?.name}</span> ({records.length} នាក់)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:flex-none">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              onClick={markAllPresent}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>វត្តមានទាំងអស់</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-emerald-700 block">វត្តមាន</span>
            <span className="text-base font-extrabold text-emerald-800">{presentCount}</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-red-700 block">អវត្តមាន</span>
            <span className="text-base font-extrabold text-red-800">{absentCount}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-amber-700 block">ច្បាប់</span>
            <span className="text-base font-extrabold text-amber-800">{permissionCount}</span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>បានរក្សាទុកវត្តមានថ្ងៃនេះដោយជោគជ័យ!</span>
        </div>
      )}

      {/* Attendance Student List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">កំពុងទាញទិន្នន័យ...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <p className="text-xs">មិនទាន់មានសិស្សក្នុងថ្នាក់នេះនៅឡើយទេ</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map((student) => (
            <div
              key={student.student_id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {student.roll_no}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{student.name}</h4>
                  <p className="text-[10px] text-slate-400">កូដ: {student.student_code}</p>
                </div>
              </div>

              {/* Status Selector Buttons (Present, Absent, Permission) */}
              <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.student_id, 'present')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                    student.status === 'present'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>វត្តមាន</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.student_id, 'absent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                    student.status === 'absent'
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>អវត្តមាន</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.student_id, 'permission')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                    student.status === 'permission'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>ច្បាប់</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Save Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 pointer-events-none z-30">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={handleSave}
            disabled={saving || records.length === 0}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center space-x-2 text-sm disabled:opacity-50 transition"
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>រក្សាទុកវត្តមាន (Save Attendance)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
