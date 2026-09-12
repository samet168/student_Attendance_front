'use client';

import React from 'react';
import { CalendarCheck, Award, BookOpen, User, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { User as UserType } from '@/types';

interface StudentOverviewProps {
  user: UserType;
  dashboardData: any;
  onNavigateTab: (tab: any) => void;
}

export const StudentOverview: React.FC<StudentOverviewProps> = ({
  user,
  dashboardData,
  onNavigateTab,
}) => {
  const classInfo = dashboardData?.class_info;
  const att = dashboardData?.attendance_summary;
  const grades = dashboardData?.grades_summary;
  const pendingHw = dashboardData?.pending_homeworks || 0;

  return (
    <div className="space-y-4 pb-24">
      {/* Student Welcome Card */}
      <div className="bg-gradient-to-tr from-blue-700 via-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-600/15">
        <div className="flex items-center space-x-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-lg text-white border border-white/20">
            🎒
          </div>
          <div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-white/20 rounded-full inline-block mb-1">
              គណនីសិស្សានុសិស្ស
            </span>
            <h2 className="text-lg font-extrabold leading-tight">{user.name}</h2>
            <p className="text-xs text-blue-100">
              អត្តលេខ: <span className="font-semibold">{user.student_code}</span> • {classInfo?.name || 'ថ្នាក់រៀន'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/15 text-xs">
          <div>
            <span className="text-[11px] text-blue-200 block">គ្រូបន្ទុកថ្នាក់</span>
            <span className="font-bold">{classInfo?.teacher_name || 'លោកគ្រូ'}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-blue-200 block">លេខរៀងក្នុងបញ្ជី</span>
            <span className="font-bold text-amber-300">លេខ {classInfo?.roll_no || 1}</span>
          </div>
        </div>
      </div>

      {/* Attendance & Grades KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attendance Rate */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              វត្តមាន
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">អត្រាវត្តមានសរុប</p>
          <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
            {att?.rate ?? 100}%
          </h4>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center space-x-2">
            <span className="text-emerald-700 font-bold">{att?.present || 0} វត្តមាន</span>
            <span>•</span>
            <span className="text-red-600 font-bold">{att?.absent || 0} អវត្តមាន</span>
          </div>
        </div>

        {/* Academic Ranking & GPA */}
        <div
          onClick={() => onNavigateTab('grades')}
          className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-blue-300 transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              {grades?.rank !== '-' ? `លេខ ${grades?.rank}` : 'កម្រិត'} 🏆
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">មធ្យមភាគពិន្ទុ</p>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <h4 className="text-xl font-extrabold text-blue-600">{grades?.average || 0}</h4>
            <span className="text-xs font-bold text-slate-400">({grades?.letter || 'N/A'})</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            ចំណាត់ថ្នាក់: <strong className="text-blue-700">លេខ {grades?.rank}</strong> ក្នុងថ្នាក់
          </p>
        </div>
      </div>

      {/* Homework Action Card */}
      <div
        onClick={() => onNavigateTab('homework')}
        className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-3xl border border-amber-200 shadow-sm cursor-pointer hover:shadow-md transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">កិច្ចការផ្ទះដែលត្រូវធ្វើ</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {pendingHw > 0 ? (
                  <span>អ្នកមាន <strong className="underline">{pendingHw} កិច្ចការ</strong> មិនទាន់បានផ្ញើ</span>
                ) : (
                  <span>អ្នកបានផ្ញើកិច្ចការទាំងអស់រួចរាល់ហើយ! 🎉</span>
                )}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      {/* Security & Privacy Notice */}
      <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 text-slate-500 text-[11px] flex items-start space-x-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>ឯកជនភាព និងសុវត្ថិភាពទិន្នន័យ៖</strong> ប្រព័ន្ធការពារទិន្នន័យផ្ទាល់ខ្លួន ដោយអនុញ្ញាតឱ្យសិស្សមើលឃើញតែវត្តមាន និងពិន្ទុរបស់ខ្លួនឯងប៉ុណ្ណោះ។
        </p>
      </div>
    </div>
  );
};
