import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  School as SchoolIcon, 
  ShieldCheck, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Zap,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';

export const QuickDemoBar: React.FC = () => {
  const { user, role, loginAsDemoUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleSwitchToSchool = async () => {
    loginAsDemoUser('school', 'Dr. Farhan Shaikh (School Head)', 'principal@interedu-demo.org');
    navigate('/register');
  };

  const handleSwitchToAdmin = () => {
    loginAsDemoUser('admin', 'Vikram Malhotra (Registrar)', 'admin.registrar@educationchampionship.org');
    navigate('/admin');
  };

  const handleResetData = () => {
    if (window.confirm('Reset local demo data to initial state? This restores the 36 school roster across Kolhapur, Sangli, and Satara.')) {
      api.resetDemoData();
      setResetMessage('Demo data reset! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  };

  return (
    <aside 
      aria-label="Quick Demo Controls"
      className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-3 sm:px-6 relative z-50 transition-all shadow-md"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Interactive Testing Mode:</span>
          </span>
          <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">
            {role ? (role === 'admin' || role === 'superadmin' ? '🛡️ Admin' : '🏫 School Representative') : '👤 Guest / Visitor'}
          </span>
        </div>

        {/* Middle / Actions */}
        {!isMinimized && (
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSwitchToSchool}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                role === 'school' 
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Test registration & school portal"
            >
              <SchoolIcon className="w-3.5 h-3.5 text-blue-300" />
              <span>School Mode</span>
            </button>

            <button
              type="button"
              onClick={handleSwitchToAdmin}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                role === 'admin' || role === 'superadmin' 
                  ? 'bg-purple-600 text-white shadow-2xs font-semibold' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Open Admin review panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Admin Console</span>
            </button>

            {location.pathname !== '/register' && (
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    loginAsDemoUser('school');
                  }
                  navigate('/register');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-xs transition-all"
                title="Go straight to Registration Wizard"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Open Registration Form</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/80 hover:bg-rose-900/50 hover:text-rose-200 text-slate-400 text-xs transition-all"
              title="Reset sample school registrations back to original state"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        )}

        {/* Right: Hide/Show */}
        <div className="flex items-center gap-2">
          {resetMessage && (
            <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {resetMessage}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title={isMinimized ? 'Expand quick controls' : 'Collapse controls'}
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
