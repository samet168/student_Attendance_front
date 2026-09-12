'use client';

/**
 * StudentHomework — lightweight overview widget used in dashboard/profile views.
 * Full submission logic (QCM quiz + file upload) lives at /[locale]/homework/student
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen, Clock, CheckCircle, ListChecks, ArrowRight, SpinnerGap,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';

interface StudentHomeworkProps {
  dashboardData: any;
}

export const StudentHomework: React.FC<StudentHomeworkProps> = ({ dashboardData }) => {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const classId = dashboardData?.class_info?.id ?? dashboardData?.class_id;

  useEffect(() => {
    if (!classId) { setLoading(false); return; }
    api.getHomeworks(classId)
      .then((data) => setHomeworks(Array.isArray(data) ? data : []))
      .catch(() => setHomeworks([]))
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <SpinnerGap size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
          {isKm ? 'កិច្ចការផ្ទះ' : 'Homework'}
        </h2>
        <Link
          href={`/${locale}/homework/student`}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
        >
          {isKm ? 'មើលទាំងអស់' : 'View all'}
          <ArrowRight size={13} />
        </Link>
      </div>

      {homeworks.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          {isKm ? 'មិនទាន់មានកិច្ចការ' : 'No homework yet'}
        </p>
      ) : (
        <div className="space-y-3">
          {homeworks.slice(0, 4).map((hw) => {
            const isSubmitted = !!hw.submission_id;
            const isQCM = !!hw.is_qcm;

            return (
              <Link
                key={hw.id}
                href={`/${locale}/homework/student`}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition group"
              >
                {/* Icon */}
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isQCM ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400' : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'}`}>
                  {isQCM ? <ListChecks size={18} weight="bold" /> : <BookOpen size={18} weight="bold" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {hw.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {hw.subject}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <Clock size={10} />
                      {new Date(hw.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status */}
                {isSubmitted ? (
                  <CheckCircle size={16} weight="fill" className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex-shrink-0">
                    {isKm ? 'មិនទាន់' : 'Due'}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
