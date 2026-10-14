import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoUser: (role: UserRole, customName?: string, customEmail?: string) => void;
  logout: () => Promise<void>;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'school_event_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth state & listen to live OAuth state changes
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const handleSessionUser = async (sessionUser: any) => {
      if (!sessionUser) return;
      const metadata = sessionUser.user_metadata || {};
      const fallbackProfile: UserProfile = {
        id: sessionUser.id,
        google_email: sessionUser.email || '',
        full_name: metadata.full_name || metadata.name || sessionUser.email?.split('@')[0] || 'School Representative',
        avatar_url: metadata.avatar_url || metadata.picture || '',
        role: 'school',
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

      // Restore cached user from storage
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        setIsLoading(false);
        throw error;
      }
    } else {
      // Offline/Local Demo Google sign in simulation
      const demoSchoolUser: UserProfile = {
        id: 'usr-school-demo',
        google_email: 'principal.stmarys@gmail.com',
        full_name: 'Dr. Jennifer D’Souza (Principal)',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        role: 'school',
        created_at: new Date().toISOString()
      };
      setUser(demoSchoolUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoSchoolUser));
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = (role: UserRole, customName?: string, customEmail?: string) => {
    let mockUser: UserProfile;

    if (role === 'admin') {
      mockUser = {
        id: 'usr-admin-001',
        google_email: customEmail || 'admin.registrar@educationchampionship.org',
        full_name: customName || 'Vikram Malhotra (Event Registrar)',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        role: 'admin',
        created_at: new Date().toISOString()
      };
    } else if (role === 'superadmin') {
      mockUser = {
        id: 'usr-superadmin-001',
        google_email: customEmail || 'director@interschoolchampionship2026.org',
        full_name: customName || 'Prof. S. R. Krishnan (Steering Committee Director)',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        role: 'superadmin',
        created_at: new Date().toISOString()
      };
    } else {
      mockUser = {
        id: 'usr-school-representative-001',
        google_email: customEmail || 'principal@stmarysdelhi.edu.in',
        full_name: customName || 'Sister Mary Lawrence (Authorized Representative)',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        role: 'school',
        created_at: new Date().toISOString()
      };
    }

    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        loginWithGoogle,
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
