'use client';

import React, { useRef } from 'react';
import { 
  IdentificationCard, QrCode, GraduationCap, DownloadSimple, 
  Printer, CheckCircle, ShieldCheck, Sparkle 
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface StudentIdCardProps {
  student: {
    id: number;
    name: string;
    email: string;
    student_code?: string;
    phone?: string;
    avatar_url?: string | null;
  };
  classInfo?: {
    name?: string;
    grade_level?: string;
    academic_year?: string;
    teacher_name?: string;
    roll_no?: number;
  } | null;
  locale?: string;
}

export function StudentIdCard({ student, classInfo, locale = 'km' }: StudentIdCardProps) {
  const isKm = locale === 'km';
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Visual ID Card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden w-full max-w-sm mx-auto rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 text-white p-6 shadow-2xl border border-indigo-500/30"
      >
        {/* Hologram aesthetic ambient overlay */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-violet-300 border border-white/15 font-bold">
              <GraduationCap size={20} weight="fill" />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wider uppercase">Smart School</h4>
              <p className="text-[9px] text-violet-300/80 font-medium">
                {isKm ? 'ប័ណ្ណសម្គាល់សិស្សឌីជីថល' : 'Digital Student ID'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-violet-200">
            {classInfo?.academic_year || '2026-2027'}
          </span>
        </div>

        {/* Card Body */}
        <div className="relative z-10 py-5 flex gap-4 items-center">
          {/* Avatar / Photo */}
          <div className="relative w-20 h-24 rounded-2xl bg-white/10 border-2 border-indigo-400/40 overflow-hidden flex flex-col items-center justify-center shrink-0 shadow-inner">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-indigo-500/30 flex items-center justify-center text-white font-black text-sm mb-1">
                  {student.name ? student.name.slice(0, 1).toUpperCase() : 'S'}
                </div>
                <span className="text-[8px] text-indigo-200 font-mono">PHOTO</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-indigo-300/80 block font-bold">
                {isKm ? 'ឈ្មោះសិស្ស' : 'Student Name'}
              </span>
              <h3 className="text-sm font-black text-white truncate leading-tight">{student.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-[8px] text-indigo-300/70 block uppercase font-medium">
                  {isKm ? 'អត្តលេខ' : 'Code'}
                </span>
                <span className="font-mono font-bold text-amber-300">{student.student_code || `STU-${student.id}`}</span>
              </div>
              <div>
                <span className="text-[8px] text-indigo-300/70 block uppercase font-medium">
                  {isKm ? 'ថ្នាក់រៀន' : 'Class'}
                </span>
                <span className="font-bold text-indigo-100">{classInfo?.name || 'N/A'}</span>
              </div>
            </div>

            {student.phone && (
              <div className="text-[10px]">
                <span className="text-[8px] text-indigo-300/70 block uppercase font-medium">
                  {isKm ? 'ទូរសព្ទ' : 'Phone'}
                </span>
                <span className="font-mono text-slate-300">{student.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer with Simulated QR & Barcode */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] text-emerald-300 font-semibold">
            <ShieldCheck size={14} weight="fill" />
            <span>{isKm ? 'បានផ្ទៀងផ្ទាត់ផ្លូវការ' : 'Officially Verified'}</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg">
            <QrCode size={22} className="text-slate-900" weight="bold" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={handlePrint}
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs rounded-xl cursor-pointer"
        >
          <Printer size={14} weight="bold" />
          <span>{isKm ? 'បោះពុម្ពប័ណ្ណ (Print Card)' : 'Print ID Card'}</span>
        </Button>
      </div>
    </div>
  );
}

export default StudentIdCard;
