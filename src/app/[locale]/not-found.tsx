'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { House, WarningCircle } from '@phosphor-icons/react';

export default function NotFound() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-100">
      <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 shadow-xl">
        <WarningCircle size={36} weight="fill" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-md">
        {locale === 'km'
          ? 'ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ប្តូរទីតាំង។'
          : 'The page you are looking for does not exist or has been moved.'}
      </p>
      <Link
        href={`/${locale}/dashboard`}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/25 transition"
      >
        <House size={16} />
        <span>{locale === 'km' ? 'ត្រឡប់ទៅផ្ទាំងដើម' : 'Back to Dashboard'}</span>
      </Link>
    </div>
  );
}
