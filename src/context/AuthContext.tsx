import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'husband' | 'wife' | null;
  familyId: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, role: 'husband' | 'wife', familyId?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  generateInviteLink: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'husband' | 'wife' | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
      } else {
        setUserRole(null);
        setFamilyId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('role, family_id')
        .eq('auth_user_id', userId)
        .single();

      if (error || !data) {
        setUserRole(null);
        setFamilyId(null);
      } else {
        setUserRole(data.role as 'husband' | 'wife');
        setFamilyId(data.family_id);
      }
    } catch {
      setUserRole(null);
      setFamilyId(null);
    }
    setLoading(false);
  };

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'husband' | 'wife',
    inviteFamilyId?: string
  ): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (!data.user) return 'Failed to create account';

    const fid = inviteFamilyId || crypto.randomUUID();

    // Create family_members entry
    const { error: memberError } = await supabase.from('family_members').insert({
      auth_user_id: data.user.id,
      role,
      family_id: fid,
      email,
    });

    if (memberError) return memberError.message;

    // Also update the profile to link to the family
    await supabase.from('profiles').upsert({
      id: role,
      name: role === 'husband' ? 'Husband' : 'Wife',
      avatar: role === 'husband' ? '👨' : '👩',
    });

    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const generateInviteLink = (): string => {
    if (!familyId) return '';
    const base = window.location.origin;
    return `${base}?invite=${familyId}`;
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, userRole, familyId, signIn, signUp, signOut, generateInviteLink }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
