import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, role?: UserRole) => void;
  loginAsDemoUser: (role: UserRole, customName?: string, customEmail?: string) => void;
  logout: () => Promise<void>;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clean key to purge any legacy mock profiles from browser storage
const AUTH_STORAGE_KEY = 'team_tameer_auth_live_v4';

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
    } catch {}

    const handleSessionUser = async (sessionUser: any) => {
      if (!sessionUser) return;
      const metadata = sessionUser.user_metadata || {};
      const fallbackProfile: UserProfile = {
        id: sessionUser.id,
        google_email: sessionUser.email || '',
        full_name: metadata.full_name || metadata.name || sessionUser.email?.split('@')[0] || 'Representative',
        avatar_url: metadata.avatar_url || metadata.picture || '',
        role: sessionUser.email?.toLowerCase() === 'argaikwad24@gmail.com' ? 'admin' : 'school',
        created_at: sessionUser.created_at || new Date().toISOString()
      };

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle();

          if (profile) {
            setUser(profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            return;
          }

          // Upsert new Google sign-in profile
          await supabase.from('profiles').upsert([fallbackProfile], { onConflict: 'id' });
        } catch (e) {
          console.warn('Profile fetch/upsert failed:', e);
        }
      }

      setUser(fallbackProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackProfile));
    };

    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await handleSessionUser(session.user);
            setIsLoading(false);
            return;
          }

          // Live Auth state change listener (catches redirect back from Google OAuth)
          const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              await handleSessionUser(session.user);
            } else if (_event === 'SIGNED_OUT') {
              setUser(null);
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          });
          subscription = listener.subscription;
        } catch (e) {
          console.warn('Supabase session restore error:', e);
        }
      }

      // Restore cached user from storage (ensuring no legacy mock name is loaded)
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
      setIsLoading(false);
    };

    initAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
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
