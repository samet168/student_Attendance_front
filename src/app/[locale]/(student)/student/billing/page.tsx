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
  const totalAmount = invoices.reduce((acc, i) => acc + (i.total_amount || 0), 0);
  const paidAmount = invoices.reduce((acc, i) => acc + (i.paid_amount || 0), 0);
  const paidPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  const statusBadge = (status: string) => {
    if (status === 'paid') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
        <CheckCircle size={10} weight="fill" /> {isKm ? 'បានបង់' : 'Paid'}
      </span>
    );
    if (status === 'pending') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
        <Clock size={10} weight="fill" /> {isKm ? 'កំពុងរង់ចាំ' : 'Pending'}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg">
        <Warning size={10} weight="fill" /> {isKm ? 'មិនទាន់បង់' : 'Unpaid'}
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header Card */}
      <div
        className="rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
          boxShadow: '0 20px 40px -12px rgba(124,58,237,0.4)',
        }}
      >
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10 -translate-y-1/3 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />

        <div className="relative flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-purple-200 mb-0.5">{isKm ? 'វិក្កយបត្ររបស់ខ្ញុំ' : 'My Invoices'}</p>
            <h1 className="text-xl font-extrabold">{isKm ? 'តារាងសំណងសិក្សា' : 'Fee & Billing Summary'}</h1>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Receipt size={28} weight="thin" className="text-white/70" />
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-2 mb-4">
          {[
            { label: isKm ? 'សរុប' : 'Total', value: invoices.length, color: 'text-white' },
            { label: isKm ? 'បានបង់' : 'Paid', value: paid, color: 'text-emerald-300' },
            { label: isKm ? 'មិនទាន់' : 'Unpaid', value: unpaid, color: 'text-rose-300' },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white/10 rounded-2xl py-2.5">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-purple-200 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {totalAmount > 0 && (
          <div className="relative space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-purple-200">{isKm ? 'ចំនួនបានបង់' : 'Amount Paid'}</span>
              <span className="font-black text-emerald-300">${paidAmount.toFixed(2)} / ${totalAmount.toFixed(2)}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${paidPct}%` }}
              />
            </div>
            <p className="text-[10px] text-purple-300 text-right">{paidPct}% {isKm ? 'បានបង់' : 'paid'}</p>
          </div>
        )}
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-white/5 text-slate-500 hover:text-purple-400 transition cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <ArrowClockwise size={13} /> {isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
        </button>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <SpinnerGap size={28} className="animate-spin text-purple-500 mb-2" />
          <p className="text-xs">{isKm ? 'កំពុងទាញវិក្កយបត្រ...' : 'Loading invoices...'}</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Receipt size={36} className="mb-2 opacity-20" />
          <p className="text-xs">{isKm ? 'មិនទាន់មានវិក្កយបត្រ' : 'No invoices found'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl p-4 border transition hover:border-purple-500/20"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      inv.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {inv.status === 'paid' ? <CheckCircle size={18} weight="fill" /> : <Receipt size={18} weight="bold" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">{inv.title}</h3>
                    {inv.due_date && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isKm ? 'ថ្ងៃកំណត់: ' : 'Due: '}{inv.due_date}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-white">
                    {inv.currency || 'USD'} {Number(inv.total_amount).toFixed(2)}
                  </p>
                  <div className="mt-1">{statusBadge(inv.status)}</div>
                </div>
              </div>
              {inv.paid_at && (
                <p className="mt-2.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg inline-block">
                  ✓ {isKm ? 'បានបង់ Cambodia: ' : 'Paid on: '}{new Date(inv.paid_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Notice */}
      <p className="text-[11px] text-slate-600 text-center">
        {isKm ? 'ប្រសិនបើអ្នកមានចម្ងល់ពីវិក្កយបត្រ សូមទំនាក់ទំនងលោកគ្រូ/អ្នកគ្រូ។' : 'For billing questions, please contact your teacher.'}
      </p>
    </div>
  );
}
