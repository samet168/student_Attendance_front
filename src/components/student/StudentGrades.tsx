'use client';

import React, { useState, useEffect } from 'react';
import { Award, BookOpen, TrendingUp, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export const StudentGrades: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentGrades();
      setGrades(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalScores = grades.reduce((acc, g) => acc + g.score, 0);
  const avg = grades.length > 0 ? (totalScores / grades.length).toFixed(1) : '0';
  const letter =
    Number(avg) >= 90 ? 'A' : Number(avg) >= 80 ? 'B' : Number(avg) >= 70 ? 'C' : Number(avg) >= 60 ? 'D' : Number(avg) >= 50 ? 'E' : 'F';

  return (
    <div className="space-y-4 pb-24">
      {/* Transcript Header Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-600/15">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-white/20 rounded-full inline-block mb-1">
              ព្រឹត្តិបត្រពិន្ទុផ្ទាល់ខ្លួន
            </span>
            <h2 className="text-lg font-bold">លទ្ធផលសិក្សា និងពិន្ទុតេស្ត</h2>
            <p className="text-xs text-blue-100">ទិន្នន័យត្រូវបានការពារឯកជនភាព</p>
          </div>

          <div className="text-right">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-amber-300">{avg}</span>
              <span className="text-xs text-blue-200">/ 100</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold inline-block mt-0.5">
              និទ្ទេស: {letter}
            </span>
          </div>
        </div>
      </div>

      {/* Grades List by Subject */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">កំពុងផ្ទុកពិន្ទុ...</p>
        </div>
      ) : grades.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
          <p className="text-xs">មិនទាន់មានពិន្ទុដែលបានបញ្ចូលនៅឡើយទេ</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {grades.map((item) => {
            const pct = Math.min(100, Math.max(0, (item.score / item.max_score) * 100));
            const gradeLetter =
              item.score >= 90 ? 'A' : item.score >= 80 ? 'B' : item.score >= 70 ? 'C' : item.score >= 60 ? 'D' : item.score >= 50 ? 'E' : 'F';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.subject}</h4>
                      <p className="text-[10px] text-slate-400">
                        កាលបរិច្ឆេទ: {item.date} • ប្រឡង: {item.exam_type}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline justify-end space-x-1">
                      <span className="text-sm font-extrabold text-blue-600">{item.score}</span>
                      <span className="text-[10px] text-slate-400">/ {item.max_score}</span>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        gradeLetter === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : gradeLetter === 'B'
                          ? 'bg-blue-100 text-blue-800'
                          : gradeLetter === 'C'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      និទ្ទេស {gradeLetter}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
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
};
