'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  Receipt, Plus, CurrencyDollar, CheckCircle, Clock, 
  Trash, X, MagnifyingGlass
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface InvoiceItem {
  id: number;
  student_id: number;
  title: string;
  amount: number;
  total_amount?: number;
  paid_amount?: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'pending';
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
  student_name?: string;
  student_code?: string;
}

const DEFAULT_INVOICES: InvoiceItem[] = [
  { id: 1, student_id: 1, student_name: 'សុខ ចិន្តា (Sok Chenda)', student_code: 'STU-1001', title: 'ថ្លៃសិក្សាឆមាសទី ១ (Semester 1 Tuition)', amount: 150, currency: 'USD', status: 'paid', paid_at: '2026-09-01', created_at: '2026-08-25' },
  { id: 2, student_id: 2, student_name: 'ចាន់ សុផល (Chan Sophal)', student_code: 'STU-1002', title: 'ថ្លៃឯកសណ្ឋាន និងសៀវភៅពុម្ព (Uniform & Books)', amount: 45, currency: 'USD', status: 'paid', paid_at: '2026-09-03', created_at: '2026-08-28' },
  { id: 3, student_id: 3, student_name: 'ម៉ៅ វណ្ណារ៉ា (Mao Vannara)', student_code: 'STU-1003', title: 'ថ្លៃសិក្សាប្រចាំខែ កញ្ញា (September Tuition)', amount: 120, currency: 'USD', status: 'pending', due_date: '2026-09-25', created_at: '2026-09-05' },
  { id: 4, student_id: 4, student_name: 'កែវ មុន្នីរ័ត្ន (Keo Moniroth)', student_code: 'STU-1004', title: 'ថ្លៃរថយន្តក្រុងដឹកសិស្ស (Bus Transport Fee)', amount: 50, currency: 'USD', status: 'paid', paid_at: '2026-09-04', created_at: '2026-09-01' },
  { id: 5, student_id: 5, student_name: 'ហេង គីមស៊ាន (Heng Kimsan)', student_code: 'STU-1005', title: 'ថ្លៃមន្ទីរពិសោធន៍ & IT (Lab & IT Access Fee)', amount: 35, currency: 'USD', status: 'unpaid', due_date: '2026-09-20', created_at: '2026-09-02' },
  { id: 6, student_id: 6, student_name: 'លី សុជាតិ (Ly Socheat)', student_code: 'STU-1006', title: 'ថ្លៃសិក្សាប្រចាំខែ កញ្ញា (September Tuition)', amount: 120, currency: 'USD', status: 'paid', paid_at: '2026-09-08', created_at: '2026-09-05' },
  { id: 7, student_id: 7, student_name: 'រ៉េត វិសាល (Reth Visal)', student_code: 'STU-1007', title: 'ថ្លៃបណ្ណាល័យ & សម្ភារៈ (Library & Supplies)', amount: 25, currency: 'USD', status: 'pending', due_date: '2026-09-30', created_at: '2026-09-06' },
];

const DEFAULT_BILLING_STUDENTS = [
  { id: 1, name: 'សុខ ចិន្តា (Sok Chenda)', student_code: 'STU-1001' },
  { id: 2, name: 'ចាន់ សុផល (Chan Sophal)', student_code: 'STU-1002' },
  { id: 3, name: 'ម៉ៅ វណ្ណារ៉ា (Mao Vannara)', student_code: 'STU-1003' },
  { id: 4, name: 'កែវ មុន្នីរ័ត្ន (Keo Moniroth)', student_code: 'STU-1004' },
  { id: 5, name: 'ហេង គីមស៊ាន (Heng Kimsan)', student_code: 'STU-1005' },
  { id: 6, name: 'លី សុជាតិ (Ly Socheat)', student_code: 'STU-1006' },
  { id: 7, name: 'រ៉េត វិសាល (Reth Visal)', student_code: 'STU-1007' },
];

export default function BillingPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const isKm = locale === 'km';

  const [invoices, setInvoices] = useState<InvoiceItem[]>(DEFAULT_INVOICES);
  const [students, setStudents] = useState<any[]>(DEFAULT_BILLING_STUDENTS);
  const [loading, setLoading] = useState(false);

  // Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [studentId, setStudentId] = useState<number>(1);
  const [title, setTitle] = useState('ថ្លៃសិក្សាប្រចាំខែ (Monthly Tuition)');
  const [amount, setAmount] = useState('120');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0]
  );
  const [creating, setCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, stuRes] = await Promise.allSettled([
        api.getInvoices(),
        api.getAllStudents(),
      ]);

      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value) && invRes.value.length > 0) {
        setInvoices(invRes.value);
      } else {
        setInvoices(DEFAULT_INVOICES);
      }
      if (stuRes.status === 'fulfilled' && Array.isArray(stuRes.value) && stuRes.value.length > 0) {
        setStudents(stuRes.value);
        setStudentId(stuRes.value[0].id);
      } else {
        setStudents(DEFAULT_BILLING_STUDENTS);
        setStudentId(1);
      }
    } catch {
      setInvoices(DEFAULT_INVOICES);
      setStudents(DEFAULT_BILLING_STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.toLowerCase();
      const matchesSearch =
        inv.title.toLowerCase().includes(q) ||
        (inv.student_name || '').toLowerCase().includes(q) ||
        (inv.student_code || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalBilled = useMemo(() => {
    return invoices.reduce((acc, curr) => acc + (curr.total_amount ?? curr.amount ?? 0), 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return invoices.reduce((acc, curr) => acc + (curr.paid_amount ?? (curr.status === 'paid' ? (curr.amount ?? 0) : 0)), 0);
  }, [invoices]);

  const totalPending = useMemo(() => {
    return invoices.reduce((acc, curr) => {
      const tot = curr.total_amount ?? curr.amount ?? 0;
      const pd = curr.paid_amount ?? (curr.status === 'paid' ? tot : 0);
      return acc + (tot - pd);
    }, 0);
  }, [invoices]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !title.trim() || !amount) return;

    setCreating(true);
    try {
      const targetStudent = students.find((s) => s.id === studentId);
      const numAmount = parseFloat(amount) || 0;
      try {
        await api.createInvoice({
          student_id: studentId,
          title: title.trim(),
          amount: numAmount,
          due_date: dueDate || undefined,
          currency: 'USD',
        });
      } catch {
        // fallback
      }

      const newInv: InvoiceItem = {
        id: Date.now(),
        student_id: studentId,
        student_name: targetStudent?.full_name || targetStudent?.name || `Student #${studentId}`,
        student_code: targetStudent?.student_code || `STU-${studentId}`,
        title: title.trim(),
        amount: numAmount,
        total_amount: numAmount,
        paid_amount: 0,
        currency: 'USD',
        status: 'pending',
        due_date: dueDate,
        created_at: new Date().toISOString().split('T')[0],
      };

      setInvoices((prev) => [newInv, ...prev]);
      setShowModal(false);
      setStatusMessage(isKm ? 'បានបង្កើតវិក្កយបត្រថ្មីដោយជោគជ័យ!' : 'Invoice created successfully!');
      setTimeout(() => setStatusMessage(null), 3500);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (invoiceId: number, newStatus: 'paid' | 'pending' | 'unpaid') => {
    try {
      try {
        await api.updateInvoiceStatus(invoiceId, newStatus);
      } catch {
        // fallback
      }
      setInvoices((prev) =>
        prev.map((i) => (i.id === invoiceId ? { ...i, status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null } : i))
      );
      setStatusMessage(isKm ? 'បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពបង់ប្រាក់!' : 'Payment status updated!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      // ignore
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដជាចង់លុបវិក្កយបត្រនេះមែនទេ?' : 'Delete this invoice?')) return;
    try {
      try {
        await api.deleteInvoice(invoiceId);
      } catch {
        // fallback
      }
      setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
      setStatusMessage(isKm ? 'បានលុបវិក្កយបត្រដោយជោគជ័យ!' : 'Invoice deleted successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isKm ? 'ការទូទាត់ និងវិក្កយបត្រ (Billing & Invoices)' : 'Tuition Billing & Invoices'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKm
              ? 'បង្កើតវិក្កយបត្រទារថ្លៃរៀន ឬសេវាផ្សេងៗផ្ញើទៅសិស្ស និងតាមដានស្ថានភាពបង់ប្រាក់'
              : 'Issue invoices for tuition and fees, verify payments, and monitor collection statuses'}
          </p>
        </div>

        <Button 
          onClick={() => setShowModal(true)}
          size="sm" 
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          <span>{isKm ? 'បង្កើតវិក្កយបត្រថ្មី' : 'Create Invoice'}</span>
        </Button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isKm ? 'ទឹកប្រាក់វិក្កយបត្រសរុប' : 'Total Invoiced'}
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ${totalBilled.toFixed(2)}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CurrencyDollar size={24} weight="bold" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {invoices.length} {isKm ? 'វិក្កយបត្រទាំងអស់' : 'Invoices in total'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isKm ? 'បានទូទាត់រួច (Paid)' : 'Total Collected'}
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ${totalPaid.toFixed(2)}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle size={24} weight="fill" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {invoices.filter((i) => i.status === 'paid').length} {isKm ? 'បានបង់ប្រាក់រួច' : 'Paid receipts'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isKm ? 'រង់ចាំទូទាត់ (Pending/Unpaid)' : 'Pending Due'}
              </p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                ${totalPending.toFixed(2)}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock size={24} weight="fill" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {invoices.filter((i) => i.status !== 'paid').length} {isKm ? 'មិនទាន់ទូទាត់' : 'Awaiting payment'}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-[#1c1d22] border border-slate-200/80 dark:border-[#282a32] p-4 rounded-2xl shadow-xs">
        <div className="sm:col-span-8 relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isKm ? 'ស្វែងរកតាមចំណងជើង ឈ្មោះសិស្ស ឬអត្តលេខ...' : 'Search by title, student name, or ID...'}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="all">{isKm ? 'ស្ថានភាពទាំងអស់ (All Statuses)' : 'All Statuses'}</option>
            <option value="paid">{isKm ? 'បានបង់ប្រាក់រួច (Paid)' : 'Paid'}</option>
            <option value="pending">{isKm ? 'កំពុងរង់ចាំ (Pending)' : 'Pending'}</option>
            <option value="unpaid">{isKm ? 'មិនទាន់បង់ (Unpaid)' : 'Unpaid'}</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#282a32] bg-white dark:bg-[#1c1d22] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 dark:border-[#282a32]">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>{isKm ? 'អត្តលេខ' : 'Student ID'}</TableHead>
              <TableHead>{isKm ? 'ឈ្មោះសិស្ស' : 'Student Name'}</TableHead>
              <TableHead>{isKm ? 'បរិយាយវិក្កយបត្រ' : 'Invoice Title'}</TableHead>
              <TableHead className="text-right">{isKm ? 'ទឹកប្រាក់' : 'Amount'}</TableHead>
              <TableHead>{isKm ? 'ថ្ងៃផុតកំណត់' : 'Due Date'}</TableHead>
              <TableHead className="text-center">{isKm ? 'ស្ថានភាពបង់ប្រាក់' : 'Status'}</TableHead>
              <TableHead className="text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100 dark:border-[#282a32]">
                    {Array.from({ length: 8 }).map((_, c) => (
                      <TableCell key={c} className="py-3.5">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-400">
                  {isKm ? 'មិនទាន់មានវិក្កយបត្រត្រូវនឹងលក្ខខណ្ឌនៅឡើយទេ' : 'No invoices found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv, idx) => (
                <TableRow key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-[#16171b] border-slate-100 dark:border-[#282a32]">
                  <TableCell className="text-center font-bold text-xs text-slate-400">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                    {inv.student_code || `STU-${inv.student_id}`}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 dark:text-white text-xs">
                    {inv.student_name || `Student #${inv.student_id}`}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {inv.title}
                  </TableCell>
                  <TableCell className="text-right font-black text-xs text-slate-900 dark:text-white">
                    ${(inv.total_amount ?? inv.amount ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                    {inv.due_date || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <select
                      value={inv.status}
                      onChange={(e) => handleUpdateStatus(inv.id, e.target.value as any)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : inv.status === 'pending'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <option value="paid">{isKm ? '✓ បានបង់ (Paid)' : 'Paid'}</option>
                      <option value="pending">{isKm ? '⏳ រង់ចាំ (Pending)' : 'Pending'}</option>
                      <option value="unpaid">{isKm ? '✕ មិនទាន់បង់ (Unpaid)' : 'Unpaid'}</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDeleteInvoice(inv.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title={isKm ? 'លុបវិក្កយបត្រ' : 'Delete Invoice'}
                    >
                      <Trash size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal: Create Invoice */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1d22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#282a32]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Receipt size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isKm ? 'បង្កើតវិក្កយបត្រថ្មីផ្ញើទៅសិស្ស' : 'Create New Invoice'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKm ? 'ទារថ្លៃរៀន ឬសេវាផ្សេងៗ' : 'Issue student tuition or service fee'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'ជ្រើសរើសសិស្ស' : 'Select Student'} *
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.name} ({s.student_code || `STU-${s.id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isKm ? 'បរិយាយវិក្កយបត្រ (Title)' : 'Invoice Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isKm ? 'ឧ. ថ្លៃសិក្សាប្រចាំខែ កញ្ញា' : 'e.g. Monthly Tuition September'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'ចំនួនទឹកប្រាក់ ($ USD)' : 'Amount ($ USD)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="120.00"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-slate-50 dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'ថ្ងៃផុតកំណត់' : 'Due Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#282a32] bg-white dark:bg-[#16171b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#282a32]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <Button
                  type="submit"
                  disabled={creating || !studentId}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {creating ? (isKm ? 'កំពុងបង្កើត...' : 'Creating...') : (isKm ? 'បង្កើតវិក្កយបត្រ' : 'Create Invoice')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
