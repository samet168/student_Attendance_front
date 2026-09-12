'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DashboardRootPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'km';

  useEffect(() => {
    router.replace(`/${locale}/dashboard`);
  }, [router, locale]);

  return null;
}
