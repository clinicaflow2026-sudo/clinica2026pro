import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Tenant, UserProfile } from '../types';
import {
  getSession,
  onAuthStateChange,
  signIn as authSignIn,
  signOut as authSignOut,
  signUpAndCreateTenant,
  fetchAuthProfile,
  resetPassword,
} from '../lib/authService';

interface AuthContextType {
  session: Session | null;
  authProfile: UserProfile | null;
  authTenant: Tenant | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signUp: (params: {
    tenantName: string;
    slug: string;
    adminName: string;
    email: string;
    password: string;
  }) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  requestPasswordReset: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authProfile, setAuthProfile] = useState<UserProfile | null>(null);
  const [authTenant, setAuthTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const result = await fetchAuthProfile();
    if (result) {
      setAuthProfile(result.profile);
      setAuthTenant(result.tenant);
    } else {
      setAuthProfile(null);
      setAuthTenant(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      const initialSession = await getSession();
      if (!active) return;
      setSession(initialSession);
      if (initialSession) await loadProfile();
      setLoading(false);
    })();

    const subscription = onAuthStateChange(async (nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        await loadProfile();
      } else {
        setAuthProfile(null);
        setAuthTenant(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setSession(null);
    setAuthProfile(null);
    setAuthTenant(null);
  }, []);

  const signUp = useCallback(
    async (params: { tenantName: string; slug: string; adminName: string; email: string; password: string }) => {
      const result = await signUpAndCreateTenant(params);
      if (!result.error && !result.needsEmailConfirmation) {
        await loadProfile();
      }
      return result;
    },
    [loadProfile]
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    return resetPassword(email);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        authProfile,
        authTenant,
        loading,
        signIn,
        signOut,
        signUp,
        requestPasswordReset,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}
