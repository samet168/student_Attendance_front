'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Receipt, CheckCircle, Clock, Warning,
  ArrowClockwise, QrCode, X, DownloadSimple, Printer
} from '@phosphor-icons/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SkeletonList } from '@/components/ui/skeleton';

export default function StudentBillingPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [invoices, setInvoices] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [invData, dashData] = await Promise.allSettled([
        api.getInvoices(),
        api.getStudentDashboard(),
      ]);
      if (invData.status === 'fulfilled') setInvoices(Array.isArray(invData.value) ? invData.value : []);
      if (dashData.status === 'fulfilled') setDashboard(dashData.value);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const studentInfo = dashboard?.student || {};
  const paid = invoices.filter((i) => i.status === 'paid').length;
  const unpaid = invoices.filter((i) => i.status !== 'paid').length;
  const totalAmount = invoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
  const paidAmount = invoices.reduce((acc, i) => acc + (Number(i.paid_amount) || 0), 0);
  const paidPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  const handleDownloadInvoicePDF = (inv: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART SCHOOL TUITION INVOICE', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Official Payment Receipt & Billing Statement`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Invoice No: INV-${String(inv.id).padStart(5, '0')}`, pageWidth / 2, 35, { align: 'center' });

    // Invoice Meta
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const startY = 52;
    doc.text(`Billed To:`, 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${studentInfo.full_name || studentInfo.name || 'Student'}`, 14, startY + 6);
    doc.text(`Student ID: ${studentInfo.student_code || studentInfo.student_id || '-'}`, 14, startY + 12);
    doc.text(`Class: ${studentInfo.class_name || studentInfo.enrolled_class || '-'}`, 14, startY + 18);

    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice Details:`, pageWidth - 14, startY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${inv.status.toUpperCase()}`, pageWidth - 14, startY + 6, { align: 'right' });
    doc.text(`Due Date: ${inv.due_date || 'On Receipt'}`, pageWidth - 14, startY + 12, { align: 'right' });
    doc.text(`Issued Date: ${new Date(inv.created_at || Date.now()).toLocaleDateString()}`, pageWidth - 14, startY + 18, { align: 'right' });

    // Table
    autoTable(doc, {
      startY: startY + 28,
      head: [['Description', 'Amount', 'Paid', 'Balance Due']],
      body: [
        [
          inv.title,
          `${inv.currency || 'USD'} ${Number(inv.total_amount).toFixed(2)}`,
          `${inv.currency || 'USD'} ${Number(inv.paid_amount || 0).toFixed(2)}`,
          `${inv.currency || 'USD'} ${(Number(inv.total_amount) - Number(inv.paid_amount || 0)).toFixed(2)}`
        ]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 6,
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Thank you for your continuous cooperation with Smart School.', 14, finalY);

    // Save
    doc.save(`Invoice_${inv.id}_${studentInfo.student_code || 'Student'}.pdf`);
  };

  const statusBadge = (status: string) => {
    if (status === 'paid') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20">
        <CheckCircle size={10} weight="fill" /> {isKm ? 'បានបង់' : 'Paid'}
      </span>
    );
    if (status === 'pending') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20">
        <Clock size={10} weight="fill" /> {isKm ? 'កំពុងរង់ចាំ' : 'Pending'}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20">
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 text-neutral-500 hover:text-purple-600 transition cursor-pointer dark:border-white/5 dark:text-slate-500 dark:hover:text-purple-400 dark:bg-white/[0.03]"
        >
          <ArrowClockwise size={13} /> {isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
        </button>
      </div>

      {/* Invoice List */}
      {loading ? (
        <SkeletonList count={4} withAvatar={false} />
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500 dark:text-slate-500">
          <Receipt size={36} className="mb-2 opacity-20" />
          <p className="text-xs">{isKm ? 'មិនទាន់មានវិក្កយបត្រ' : 'No invoices found'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl p-4 border transition hover:border-purple-500/20 bg-white border-neutral-200 dark:bg-white/[0.02] dark:border-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}
                  >
                    {inv.status === 'paid' ? <CheckCircle size={18} weight="fill" /> : <Receipt size={18} weight="bold" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">{inv.title}</h3>
                    {inv.due_date && (
                      <p className="text-[10px] text-neutral-500 dark:text-slate-500 mt-0.5">
                        {isKm ? 'ថ្ងៃកំណត់: ' : 'Due: '}{inv.due_date}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    {inv.currency || 'USD'} {Number(inv.total_amount).toFixed(2)}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 justify-end">
                    {statusBadge(inv.status)}
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition cursor-pointer dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 dark:border-purple-500/20"
                    >
                      {isKm ? 'លម្អិត & QR' : 'Details & QR'}
                    </button>
                  </div>
                </div>
              </div>
              {inv.paid_at && (
                <p className="mt-2.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  ✓ {isKm ? 'បានបង់ Cambodia: ' : 'Paid on: '}{new Date(inv.paid_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Invoice Details & QR Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="relative rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-neutral-200 bg-white text-center dark:border-white/10 dark:bg-[#12141f]"
          >
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 transition cursor-pointer dark:text-slate-500 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto mb-3 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400">
              <QrCode size={24} weight="bold" />
            </div>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-0.5">{selectedInvoice.title}</h3>
            <p className="text-[11px] text-neutral-500 dark:text-slate-400 mb-4">Invoice #{String(selectedInvoice.id).padStart(5, '0')}</p>

            {/* Simulated KHQR Code Box */}
            <div className="p-4 rounded-2xl bg-white text-slate-950 inline-block shadow-lg mb-4">
              <div className="w-40 h-40 bg-slate-100 rounded-xl border border-slate-300 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[8px] font-black text-red-600 tracking-wider">KHQR</div>
                <QrCode size={110} className="text-slate-900" weight="fill" />
                <div className="text-[9px] font-extrabold text-slate-800 mt-1">Smart School Bakong</div>
              </div>
              <p className="text-[10px] font-black text-slate-700 mt-2">
                {selectedInvoice.currency || 'USD'} {Number(selectedInvoice.total_amount).toFixed(2)}
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-neutral-600 dark:text-slate-400 mb-4">
              <p>{isKm ? 'ស្កេនតាមរយៈកម្មវិធីធនាគារ (Bakong, ABA, Wing)' : 'Scan via Bakong or any Mobile Banking App'}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadInvoicePDF(selectedInvoice)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <DownloadSimple size={14} weight="bold" />
                <span>{isKm ? 'ទាញយក PDF' : 'Download PDF'}</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition cursor-pointer dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
              >
                {isKm ? 'បិទ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Notice */}
      <p className="text-[11px] text-slate-600 text-center">
        {isKm ? 'ប្រសិនបើអ្នកមានចម្ងល់ពីវិក្កយបត្រ សូមទំនាក់ទំនងលោកគ្រូ/អ្នកគ្រូ។' : 'For billing questions, please contact your teacher.'}
      </p>
    </div>
  );
}
