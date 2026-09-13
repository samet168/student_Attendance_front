'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { AIStudyAssistant } from '@/components/common/ai-study-assistant';
import { hydrateAuthStore } from '@/stores/use-auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Hydrate store from localStorage (client-only)
    hydrateAuthStore();

    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setAuthenticated(false);
      router.replace(`/${locale}/login`);
      return;
    }

    try {
      const raw = localStorage.getItem('user');
      if (raw && raw !== 'undefined' && raw !== 'null') {
        const u = JSON.parse(raw);
        if (u?.role === 'student') {
          router.replace(`/${locale}/student/dashboard`);
          return;
        }
      }
    } catch {
      // corrupted — clear and re-login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.replace(`/${locale}/login`);
      return;
    }

    setAuthenticated(true);
  }, [router, locale]);

  if (authenticated !== true) {
    return (
      <div suppressHydrationWarning className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div suppressHydrationWarning className="flex flex-col items-center gap-4">
          <div
            suppressHydrationWarning
            className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-pulse"
          >
            <div suppressHydrationWarning className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            {locale === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Verifying session...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0d0e13] text-slate-900 dark:text-zinc-100 transition-colors">
      <Sidebar />
      <div suppressHydrationWarning className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50/60 dark:bg-[#0d0e13]">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
        <MobileBottomNav role="teacher" />
        <AIStudyAssistant role="teacher" locale={locale} />
      </div>
    </div>
  );
}
