import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const waitForAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Legacy cookie-based functions for backward compatibility
export const setAuthCookie = (isAuthenticated: boolean) => {
  const value = isAuthenticated ? 'true' : 'false';
  document.cookie = `auth-token=${value}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
};

export const getAuthCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      return value;
    }
  }
  return null;
};

export const removeAuthCookie = () => {
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};
