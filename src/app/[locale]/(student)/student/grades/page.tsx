'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Exam, BookOpen, SpinnerGap, ArrowClockwise } from '@phosphor-icons/react';

export default function StudentGradesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentGrades();
      setGrades(data);
    } catch {
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalScore = grades.reduce((acc, g) => acc + g.score, 0);
  const avg = grades.length > 0 ? (totalScore / grades.length).toFixed(1) : '0.0';
  const letter =
    Number(avg) >= 90 ? 'A' : Number(avg) >= 80 ? 'B' : Number(avg) >= 70 ? 'C' : Number(avg) >= 60 ? 'D' : Number(avg) >= 50 ? 'E' : 'F';

  const letterColor = {
    A: 'text-emerald-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-orange-400', E: 'text-red-400', F: 'text-red-500'
  }[letter] || 'text-slate-300';

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-5 text-white shadow-xl shadow-blue-900/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-200 mb-0.5">
              {isKm ? 'ព្រឹត្តិបត្រពិន្ទុផ្ទាល់ខ្លួន' : 'Personal Academic Record'}
            </p>
            <h1 className="text-lg font-extrabold">{isKm ? 'ពិន្ទុ & លទ្ធផលសិក្សា' : 'Grades & Academic Results'}</h1>
            <p className="text-[11px] text-blue-300 mt-1">
              {isKm ? 'ទិន្នន័យត្រូវបានការពារឯកជនភាព' : 'Data is strictly private to you only'}
            </p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-4xl font-black text-white">{avg}</p>
            <p className={`text-xl font-black ${letterColor}`}>{isKm ? `និទ្ទេស ${letter}` : `Grade ${letter}`}</p>
            <p className="text-[11px] text-blue-300 mt-0.5">{isKm ? 'មធ្យមភាគ' : 'Average'}</p>
          </div>
        </div>
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition cursor-pointer"
        >
          <ArrowClockwise size={13} /> {isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
        </button>
      </div>

      {/* Grades List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <SpinnerGap size={28} className="animate-spin text-blue-500 mb-2" />
          <p className="text-xs">{isKm ? 'កំពុងផ្ទុកពិន្ទុ...' : 'Loading grades...'}</p>
        </div>
      ) : grades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Exam size={36} className="mb-2 opacity-30" />
          <p className="text-xs">{isKm ? 'មិនទាន់មានពិន្ទុដែលបានបញ្ចូលទេ' : 'No grades recorded yet'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {grades.map((item) => {
            const pct = Math.min(100, Math.max(0, (item.score / (item.max_score || 100)) * 100));
            const gl = item.score >= 90 ? 'A' : item.score >= 80 ? 'B' : item.score >= 70 ? 'C' : item.score >= 60 ? 'D' : item.score >= 50 ? 'E' : 'F';
            const badgeClass = gl === 'A' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
              : gl === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
              : gl === 'C' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            const barClass = item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-blue-500' : 'bg-amber-500';

            return (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <BookOpen size={16} weight="bold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.subject}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.date} • {item.exam_type || (isKm ? 'តេស្ត' : 'Test')}
                        {item.class_name ? ` • ${item.class_name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{item.score}</span>
                      <span className="text-[10px] text-slate-400">/ {item.max_score || 100}</span>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${badgeClass}`}>
                      {isKm ? 'និទ្ទេស ' : ''}{gl}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
