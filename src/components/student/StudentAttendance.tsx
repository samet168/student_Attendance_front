'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export const StudentAttendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'permission'>('all');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentAttendance();
      setRecords(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter((r) => filter === 'all' || r.status === filter);

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const permissionCount = records.filter((r) => r.status === 'permission').length;
  const total = records.length;
  const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '100';

  return (
    <div className="space-y-4 pb-24">
      {/* Header Attendance Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">ប្រវត្តិវត្តមានផ្ទាល់ខ្លួន</h2>
            <p className="text-xs text-slate-500">កត់ត្រាប្រចាំថ្ងៃដោយគ្រូបន្ទុកថ្នាក់</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-emerald-600">{rate}%</span>
            <span className="block text-[10px] text-slate-400">អត្រាវត្តមាន</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-100">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition text-center ${
              filter === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ទាំងអស់ ({total})
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition text-center ${
              filter === 'present' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            វត្តមាន ({presentCount})
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition text-center ${
              filter === 'absent' ? 'bg-red-600 text-white font-bold' : 'bg-red-50 text-red-700'
            }`}
          >
            អវត្តមាន ({absentCount})
          </button>
          <button
            onClick={() => setFilter('permission')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition text-center ${
              filter === 'permission' ? 'bg-amber-500 text-white font-bold' : 'bg-amber-50 text-amber-700'
            }`}
          >
            ច្បាប់ ({permissionCount})
          </button>
        </div>
      </div>

      {/* Attendance History List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">កំពុងទាញទិន្នន័យ...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <p className="text-xs">មិនមានកំណត់ត្រាវត្តមានក្នុងប្រភេទនេះទេ</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  កាលបរិច្ឆេទ: {r.date}
                </span>
                {r.notes ? (
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    មូលហេតុ: "{r.notes}"
                  </p>
                ) : (
                  <span className="text-[10px] text-slate-400">ធម្មតា</span>
                )}
              </div>

              <div>
                {r.status === 'present' ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>វត្តមាន</span>
                  </span>
                ) : r.status === 'absent' ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>អវត្តមាន</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>ច្បាប់</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
