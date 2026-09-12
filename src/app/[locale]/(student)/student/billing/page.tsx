'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Receipt, CheckCircle, Clock, Warning, SpinnerGap, ArrowClockwise } from '@phosphor-icons/react';

export default function StudentBillingPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const paid = invoices.filter((i) => i.status === 'paid').length;
  const unpaid = invoices.filter((i) => i.status !== 'paid').length;
  const totalAmount = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const paidAmount = invoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + (i.amount || 0), 0);

  const statusBadge = (status: string) => {
    if (status === 'paid') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg">
        <CheckCircle size={10} weight="fill" /> {isKm ? 'បានបង់' : 'Paid'}
      </span>
    );
    if (status === 'pending') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg">
        <Clock size={10} weight="fill" /> {isKm ? 'កំពុងរង់ចាំ' : 'Pending'}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-lg">
        <Warning size={10} weight="fill" /> {isKm ? 'មិនទាន់បង់' : 'Unpaid'}
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-violet-700 to-purple-700 p-5 text-white shadow-xl shadow-violet-900/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-violet-200 mb-0.5">{isKm ? 'វិក្កយបត្ររបស់ខ្ញុំ' : 'My Invoices'}</p>
            <h1 className="text-lg font-extrabold">{isKm ? 'តារាងសំណងសិក្សា' : 'Fee & Billing Summary'}</h1>
          </div>
          <Receipt size={36} weight="thin" className="text-white/40" />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/15">
          {[
            { label: isKm ? 'សរុបវិក្កយបត្រ' : 'Total Bills', value: invoices.length, color: 'text-white' },
            { label: isKm ? 'បានបង់ប្រាក់' : 'Paid', value: paid, color: 'text-emerald-300' },
            { label: isKm ? 'មិនទាន់បង់' : 'Unpaid', value: unpaid, color: 'text-red-300' },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white/10 rounded-2xl py-2.5">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-violet-200 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
        {totalAmount > 0 && (
          <div className="mt-3 pt-3 border-t border-white/15 flex justify-between text-xs">
            <span className="text-violet-200">{isKm ? 'ចំនួនបានបង់' : 'Amount Paid'}</span>
            <span className="font-black text-emerald-300">${paidAmount.toFixed(2)} / ${totalAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-violet-600 transition cursor-pointer">
          <ArrowClockwise size={13} /> {isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
        </button>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <SpinnerGap size={28} className="animate-spin text-violet-500 mb-2" />
          <p className="text-xs">{isKm ? 'កំពុងទាញវិក្កយបត្រ...' : 'Loading invoices...'}</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Receipt size={36} className="mb-2 opacity-30" />
          <p className="text-xs">{isKm ? 'មិនទាន់មានវិក្កយបត្រ' : 'No invoices found'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    inv.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400'
                  }`}>
                    {inv.status === 'paid' ? <CheckCircle size={18} weight="fill" /> : <Receipt size={18} weight="bold" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{inv.title}</h3>
                    {inv.due_date && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {isKm ? 'ថ្ងៃកំណត់: ' : 'Due: '}{inv.due_date}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {inv.currency || 'USD'} {Number(inv.amount).toFixed(2)}
                  </p>
                  <div className="mt-1">{statusBadge(inv.status)}</div>
                </div>
              </div>
              {inv.paid_at && (
                <p className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg inline-block">
                  {isKm ? 'បានបង់ Cambodia: ' : 'Paid on: '}{new Date(inv.paid_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Notice */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
        {isKm ? 'ប្រសិនបើអ្នកមានចម្ងល់ពីវិក្កយបត្រ សូមទំនាក់ទំនងលោកគ្រូ/អ្នកគ្រូ។' : 'For billing questions, please contact your teacher.'}
      </p>
    </div>
  );
}
