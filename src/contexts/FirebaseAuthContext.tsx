'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setAuthCookie, clearAuthCookie } from '@/utils/auth';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinedAt?: string;
  bio?: string;
  university?: string;
  major?: string;
  year?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  // Alias for backward compatibility
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Load extended profile data from localStorage
        const savedProfile = localStorage.getItem(`firebase_user_profile_${firebaseUser.uid}`);
        const profileData = savedProfile ? JSON.parse(savedProfile) : {};
        
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatar: firebaseUser.photoURL || undefined,
          joinedAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
          bio: profileData.bio || '',
          university: profileData.university || '',
          major: profileData.major || '',
          year: profileData.year || ''
        });
        
        // Set auth cookie for middleware
        setAuthCookie(true);
      } else {
        setUser(null);
        // Clear auth cookie when logged out
        clearAuthCookie();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      }
      throw new Error(error.message || 'Registration failed');
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed');
      }
      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Another sign-in popup is already open');
      }
      throw new Error(error.message || 'Google sign-in failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Update Firebase profile (only supports displayName and photoURL)
      await updateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: data.avatar
      });

      // Store extended profile data in localStorage
      const currentUser = user;
      if (currentUser) {
        const updatedUser = { ...currentUser, ...data };
        setUser(updatedUser);
        
        // Store extended profile in localStorage for persistence
        localStorage.setItem(`firebase_user_profile_${auth.currentUser.uid}`, JSON.stringify({
          bio: data.bio || currentUser.bio || '',
          university: data.university || currentUser.university || '',
          major: data.major || currentUser.major || '',
          year: data.year || currentUser.year || ''
        }));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    // Alias for backward compatibility
    updateProfile: updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
