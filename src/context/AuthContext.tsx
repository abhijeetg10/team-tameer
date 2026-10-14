import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  loginWithGoogle: (targetRedirect?: string) => Promise<void>;
  loginWithEmail: (email: string, role?: UserRole) => void;
  loginAsDemoUser: (role: UserRole, customName?: string, customEmail?: string) => void;
  logout: () => Promise<void>;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clean key to purge any legacy mock profiles from browser storage
const AUTH_STORAGE_KEY = 'team_tameer_auth_live_v5';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth state & listen to live OAuth state changes
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    // Purge legacy test profiles from older development versions
    try {
      localStorage.removeItem('school_event_auth_user_v1');
      localStorage.removeItem('school_event_auth_user_v2');
      localStorage.removeItem('school_event_auth_user_v3');
      localStorage.removeItem('school_event_auth_user_v4');
    } catch {}

    const handleSessionUser = (sessionUser: any) => {
      if (!sessionUser) return;
      const metadata = sessionUser.user_metadata || {};
      const cleanEmail = (sessionUser.email || '').toLowerCase().trim();
      const profile: UserProfile = {
        id: sessionUser.id,
        google_email: cleanEmail,
        full_name: metadata.full_name || metadata.name || cleanEmail.split('@')[0] || 'Representative',
        avatar_url: metadata.avatar_url || metadata.picture || '',
        role: cleanEmail === 'argaikwad24@gmail.com' ? 'admin' : 'school',
        created_at: sessionUser.created_at || new Date().toISOString()
      };

      // Set user immediately so state is updated without delay
      setUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      setIsLoading(false);
    };

    if (isSupabaseConfigured && supabase) {
      // 1. Immediately attach listener for OAuth redirect (catches token/code from URL)
      const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          handleSessionUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setIsLoading(false);
        }
      });
      subscription = authSub;

      // 2. Also check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          handleSessionUser(session.user);
        } else {
          setIsLoading(false);
        }
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // 3. Restore cached user if available
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.full_name?.includes('Jennifer') || 
          parsed.full_name?.includes('D’Souza') ||
          parsed.google_email?.includes('stmarys')
        ) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (targetRedirect?: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const dest = targetRedirect || '/register';
        const callbackUrl = `${window.location.origin}${dest.startsWith('/') ? dest : '/' + dest}`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: callbackUrl,
          },
        });
        if (error) {
          setIsLoading(false);
          alert('Google Sign-In Error: ' + error.message);
          throw error;
        }
      } catch (err: any) {
        setIsLoading(false);
        throw err;
      }
    }
  };

  const loginAsDemoUser = (role: UserRole, customName?: string, customEmail?: string) => {
    const cleanEmail = customEmail?.trim().toLowerCase() || (role === 'admin' ? 'argaikwad24@gmail.com' : 'representative@school.edu.in');
    const realUser: UserProfile = {
      id: `usr-${Date.now()}`,
      google_email: cleanEmail,
      full_name: customName || (cleanEmail === 'argaikwad24@gmail.com' ? 'Super Administrator' : 'School Representative'),
      avatar_url: '',
      role: role,
      created_at: new Date().toISOString()
    };
    setUser(realUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(realUser));
  };

  const loginWithEmail = (email: string, role: UserRole = 'admin') => {
    const cleanEmail = email.trim().toLowerCase();
    const adminUser: UserProfile = {
      id: `usr-admin-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      google_email: cleanEmail,
      full_name: cleanEmail === 'argaikwad24@gmail.com' ? 'Super Administrator (argaikwad24)' : `Admin (${cleanEmail.split('@')[0]})`,
      avatar_url: '',
      role: role,
      created_at: new Date().toISOString()
    };
    setUser(adminUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    try {
      localStorage.removeItem('school_event_auth_user_v1');
      localStorage.removeItem('school_event_auth_user_v2');
      localStorage.removeItem('school_event_auth_user_v3');
      localStorage.removeItem('school_event_auth_user_v4');
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        loginAsDemoUser,
        logout,
        isSupabaseLive: isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
