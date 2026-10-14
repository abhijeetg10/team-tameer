import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Award, ShieldCheck, LogOut, User, LayoutDashboard, FileText, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
  const { user, role, logout, isSupabaseLive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:bg-blue-600 transition-colors">
            <Award className="w-6 h-6 text-amber-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 tracking-tight leading-tight">
                Interschool Championship
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              School Event Registration & Administration
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link 
            to="/" 
            className={`hover:text-blue-600 transition-colors ${location.pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}
          >
            Home
          </Link>
          <a 
            href="/#guidelines" 
            className="hover:text-blue-600 transition-colors"
          >
            Registration Guidelines
          </a>
          <a 
            href="/#schedule" 
            className="hover:text-blue-600 transition-colors"
          >
            Documents Required
          </a>
          <a 
            href="/#contact" 
            className="hover:text-blue-600 transition-colors"
          >
            Contact & Support
          </a>
        </nav>

        {/* Auth / Action Menu */}
        <div className="flex items-center gap-3">
          {/* Cloud / Local Storage Indicator */}
          <div 
            title={isSupabaseLive ? 'Connected to live Supabase cloud database' : 'Running in Local Offline/Mock Persistent Mode (Ready for Supabase .env keys)'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span>{isSupabaseLive ? 'Supabase Cloud' : 'Local Store'}</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {role === 'admin' || role === 'superadmin' ? (
                <Link to="/admin">
                  <Button size="sm" variant="navy" leftIcon={<LayoutDashboard className="w-4 h-4 text-blue-400" />}>
                    Admin Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button size="sm" variant="primary" leftIcon={<FileText className="w-4 h-4" />}>
                    School Portal
                  </Button>
                </Link>
              )}

              {/* User Dropdown / Profile pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="secondary">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary">
                  Register School
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
