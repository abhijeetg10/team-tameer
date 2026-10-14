import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Building2, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Database,
  CheckCircle2,
  School as SchoolIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { user, loginWithGoogle, loginAsDemoUser, isSupabaseLive, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If already authenticated, redirect based on role and registration status
  React.useEffect(() => {
    const handleRedirect = async () => {
      if (user) {
        if (user.role === 'admin' || user.role === 'superadmin') {
          navigate('/admin');
        } else {
          // Check if returning user already has a school registration
          const existing = await api.getSchoolForUser(user.id);
          if (existing) {
            navigate('/dashboard');
          } else {
            navigate('/register');
          }
        }
      }
    };
    handleRedirect();
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await loginWithGoogle();
      // Redirect handled by useEffect
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDemoSignIn = async (role: UserRole) => {
    loginAsDemoUser(role);
    if (role === 'admin' || role === 'superadmin') {
      navigate('/admin');
    } else {
      const existing = await api.getSchoolForUser('usr-school-representative-001');
      if (existing) {
        navigate('/dashboard');
      } else {
        navigate('/register');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white mx-auto flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Sign In
          </h2>
          <p className="text-xs text-slate-500">
            Secure Authentication for School Principals, Mentors, and Event Administrators
          </p>
        </div>

        {/* Database Status Alert */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className={`w-4 h-4 ${isSupabaseLive ? 'text-emerald-500' : 'text-blue-500'}`} />
            <span className="font-semibold text-slate-700">
              {isSupabaseLive ? 'Supabase OAuth Live' : 'Interactive Sandbox Mode'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            34 Predefined Schools
          </span>
        </div>

        {/* Primary Google Auth Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] transition-all shadow-2xs disabled:opacity-50"
          >
            {/* Google G SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>

        {authError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Instant Verification Demo Role Switcher */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Immediate Role Verification (1-Click)
            </p>
            <span className="text-[10px] text-blue-600 font-medium">Quick Test</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleDemoSignIn('school')}
              className="w-full text-left p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <SchoolIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    School Principal / Mentor
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Selects from 34 Schools, 1 Mentor & 4 Students
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => handleDemoSignIn('admin')}
              className="w-full text-left p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-900/5 hover:border-slate-400 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Event Administrator / Registrar
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Views all 34 schools, district stats & verifies claims
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Security Disclaimers */}
        <p className="text-[11px] text-slate-400 text-center leading-normal">
          By signing in, you confirm institutional authorization and compliance with the event's encrypted child data protection policy.
        </p>
      </div>
    </div>
  );
};
