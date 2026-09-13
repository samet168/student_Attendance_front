'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StudentSidebar } from '@/components/layout/student-sidebar';
import { Header } from '@/components/layout/header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { AIStudyAssistant } from '@/components/common/ai-study-assistant';
import { hydrateAuthStore } from '@/stores/use-auth-store';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'km';
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Hydrate Zustand store from localStorage (client-only, avoids SSR mismatch)
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
        if (u?.role === 'teacher' || u?.role === 'admin') {
          router.replace(`/${locale}/dashboard`);
          return;
        }
      }
    } catch {
      // corrupted user data — clear and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.replace(`/${locale}/login`);
      return;
    }

    setAuthenticated(true);
  }, [router, locale]);

  // Loading / unauthenticated state
  if (authenticated !== true) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-neutral-50 dark:bg-[#080a10] flex items-center justify-center"
      >
        <div suppressHydrationWarning className="flex flex-col items-center gap-4">
          <div
            suppressHydrationWarning
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-900/50 animate-pulse"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
                stroke="white"
                strokeWidth="1.5"
                fill="rgba(255,255,255,0.15)"
              />
            </svg>
          </div>
          <div
            suppressHydrationWarning
            className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="flex h-screen overflow-hidden text-neutral-900 dark:text-slate-100 transition-colors bg-neutral-50 dark:bg-[#080a10]"
    >
      <StudentSidebar />
      <div
        suppressHydrationWarning
        className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white dark:bg-[#0b0d14]"
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
        <MobileBottomNav role="student" />
        <AIStudyAssistant role="student" locale={locale} />
      </div>
    </div>
  );
}
