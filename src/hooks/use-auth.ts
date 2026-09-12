import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth-store';
import { useEffect } from 'react';

export function useAuth(requireAuth: boolean = true, allowedRoles?: ('teacher' | 'student' | 'admin')[]) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !token) {
      // Extract current locale from pathname if present
      const segments = pathname.split('/').filter(Boolean);
      const currentLocale = segments[0] === 'km' || segments[0] === 'en' ? segments[0] : 'km';
      router.push(`/${currentLocale}/login`);
    } else if (requireAuth && allowedRoles && user && !allowedRoles.includes(user.role)) {
      const segments = pathname.split('/').filter(Boolean);
      const currentLocale = segments[0] === 'km' || segments[0] === 'en' ? segments[0] : 'km';
      router.push(`/${currentLocale}/dashboard`);
    }
  }, [requireAuth, token, user, allowedRoles, router, pathname]);

  return { user, token, isAuthenticated, logout };
}
