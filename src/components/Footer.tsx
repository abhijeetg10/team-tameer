import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand & Logos */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Team Tameer Logo" 
                className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 border border-slate-700"
              />
              <img 
                src="/logo2.jpeg" 
                alt="Event Logo" 
                className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 border border-slate-700"
              />
            </div>
            <div>
              <span className="text-white font-bold text-sm block leading-tight">Team Tameer Registration</span>
              <span className="text-[11px] text-slate-500">Kolhapur • Sangli • Satara Schools</span>
            </div>
          </div>

          {/* Developer Credit */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>Developed by</span>
            <span className="font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 shadow-2xs text-xs tracking-wide">
              RECPRO Rehan Chougule
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center sm:text-left text-[11px] text-slate-600">
          <p>© 2026 Team Tameer Registration. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
