import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileEdit, Home, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 min-h-[5.5rem] flex items-center justify-between gap-4">
        {/* Brand / Both Logos */}
        <Link to="/" className="flex items-center gap-3 sm:gap-4 group shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo.png" 
              alt="Team Tameer Logo" 
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-2xl bg-white p-1 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
            />
            <img 
              src="/logo2.jpeg" 
              alt="Event Partner Logo" 
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-2xl bg-white p-1 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-xl text-slate-900 tracking-tight leading-tight">
                Team Tameer Registration
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                2026
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Kolhapur • Sangli • Satara Schools
            </p>
          </div>
        </Link>

        {/* Action Links & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            to="/" 
            className={`hidden md:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              location.pathname === '/'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link 
            to="/register" 
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              location.pathname === '/register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>Registration Form</span>
          </Link>

          <Link 
            to="/admin" 
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              location.pathname.startsWith('/admin')
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </Link>

          {/* User Status / Google Sign In */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <span className="hidden lg:inline text-xs font-bold text-slate-700 max-w-[120px] truncate">
                {user.full_name || user.google_email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                title="Sign Out"
                className="inline-flex items-center gap-1 p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pl-1 border-l border-slate-200">
              <GoogleSignInButton size="md" buttonText="Sign In" className="hidden sm:inline-flex" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
