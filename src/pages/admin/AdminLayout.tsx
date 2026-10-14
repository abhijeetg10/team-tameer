import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCheck, 
  ClipboardList, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Bell, 
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, role, logout, isSupabaseLive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Security check: Redirect non-admins
  if (!user || (role !== 'admin' && role !== 'superadmin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Administrative Access Restricted</h2>
          <p className="text-xs text-slate-400">
            This administration console is restricted to verified Secretariat Registrars and Event Administrators. Your current role is <strong>{role || 'unauthenticated'}</strong>.
          </p>
          <div className="pt-2">
            <Link to="/login" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">
              Sign In with Authorized Google Admin Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const navigationItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'School Registrations', path: '/admin/schools', icon: Building2 },
    { name: 'Students Directory', path: '/admin/students', icon: Users },
    { name: 'Mentors Directory', path: '/admin/mentors', icon: UserCheck },
    { name: 'Review Queue', path: '/admin/reviews', icon: ClipboardList },
    { name: 'Reports & Export', path: '/admin/reports', icon: FileSpreadsheet },
    { name: 'Event Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            EVT
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight">Admin Console</span>
            <span className="block text-[10px] text-slate-500 font-mono">Championship 2026</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/admin/schools' && location.pathname.startsWith('/admin/school/'));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Database Status indicator in sidebar */}
        <div className="p-4 mx-3 mb-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-white font-semibold">{isSupabaseLive ? 'Supabase Live' : 'Persistent Storage'}</span>
          </div>
          <p className="text-slate-500 text-[10px]">
            {isSupabaseLive ? 'Row-Level Security active' : 'Production fallback ready'}
          </p>
        </div>

        {/* Admin User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-blue-400 capitalize truncate">{role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm font-bold text-slate-900 hidden sm:block">
                National Interschool Educational Excellence Championship 2026
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Administrative Control Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-mono">
              {currentDate}
            </span>

            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-right">
                <span className="block text-xs font-semibold text-slate-800">{user.full_name}</span>
                <span className="block text-[10px] text-emerald-600 font-semibold uppercase">{user.role}</span>
              </span>
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                alt={user.full_name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-slate-900 text-white p-4 flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-sm">Admin Navigation</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2.5 text-xs text-rose-400 hover:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
