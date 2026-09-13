import { create } from 'zustand';
import { UserProfile } from '@/types/api';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

/** Safe localStorage read — never throws, returns null on any error */
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe JSON parse — never throws, returns null on any error */
function safeParse<T>(value: string | null): T | null {
  if (!value || value === 'undefined' || value === 'null' || value.trim() === '') {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  // Always start as null/false on server — client hydrates after mount
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

/**
 * Call this once inside a useEffect (client-only) to hydrate the store
 * from localStorage after the component mounts.
 * Usage: useEffect(() => { hydrateAuthStore(); }, []);
 */
export function hydrateAuthStore() {
  if (typeof window === 'undefined') return;
  const token = safeGetItem('token');
  const user  = safeParse<UserProfile>(safeGetItem('user'));
  useAuthStore.setState({
    token,
    user,
    isAuthenticated: !!token,
  });
}
