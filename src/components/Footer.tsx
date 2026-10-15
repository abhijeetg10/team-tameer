import React from 'react';
import { Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          {/* Brand & Logos */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Team Tameer Logo" 
                className="w-10 h-10 object-contain rounded-lg bg-white p-0.5 border border-slate-700"
              />
              <img 
                src="/logo2.jpeg" 
                alt="Event Logo" 
                className="w-10 h-10 object-contain rounded-lg bg-white p-0.5 border border-slate-700"
              />
            </div>
            <div>
              <span className="text-white font-bold text-base block leading-tight">State-Level GK Quiz Contest 2026</span>
              <span className="text-xs text-slate-400">Kolhapur • Sangli • Satara Schools</span>
            </div>
          </div>

          {/* Helpdesk Contacts */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/90 rounded-xl border border-slate-700">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Event Queries:</span>
              <span className="text-white font-bold">Ibrahim sir</span>
              <a href="tel:+919850461062" className="text-emerald-400 font-extrabold hover:underline">
                +91 98504 61062
              </a>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/90 rounded-xl border border-slate-700">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Software Support:</span>
              <span className="text-white font-bold">Rehan Chougale</span>
              <a href="tel:7588171372" className="text-amber-400 font-extrabold hover:underline">
                7588171372
              </a>
            </div>
          </div>

          {/* Developer Credit */}
          <div className="flex items-center gap-2 text-slate-400 text-xs shrink-0">
            <span>Developed by</span>
            <span className="font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 shadow-2xs text-xs tracking-wide">
              RECPRO Rehan Chougale
            </span>
          </div>
        </div>

        <div className="text-center sm:text-left text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 State-Level GK Quiz Contest. All rights reserved.</p>
          <p>For any registration queries or software difficulties, please contact Ibrahim sir or Rehan Chougale.</p>
        </div>
      </div>
    </footer>
  );
};
