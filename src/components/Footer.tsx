import React from 'react';
import { Award, Shield, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Interschool Championship 2026</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Premier inter-institutional conclave uniting 30 selected higher-secondary schools for intellectual, scientific, and cultural distinction.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>UIDAI Privacy Compliant & Encrypted Portal</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Event Guidelines</h4>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/#guidelines" className="hover:text-white transition-colors">Eligibility & Team Composition (4+1)</a></li>
              <li><a href="/#schedule" className="hover:text-white transition-colors">Identity Document Redaction Guide</a></li>
              <li><a href="/#faq" className="hover:text-white transition-colors">Principal Authorization Letter Template</a></li>
              <li><a href="/#rules" className="hover:text-white transition-colors">Disqualification & Substitution Rules</a></li>
            </ul>
          </div>

          {/* Col 3: Secretariat & Contact */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Secretariat Desk</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Dr. APJ Abdul Kalam Auditorium, National Education Complex, New Delhi - 110001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>events@interschoolchampionship2026.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+91 (011) 2894-3321 / +91 98112-44550</span>
              </div>
            </div>
          </div>

          {/* Col 4: Child Privacy Notice */}
          <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <h4 className="text-white font-semibold text-xs">Child Data Protection</h4>
            <p className="text-[11px] text-slate-300 leading-normal">
              Photographs and identity proofs uploaded here are processed strictly for event participant accreditation. Documents are stored in access-controlled private storage and purged after event conclusion in compliance with statutory retention standards.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-3">
          <p>© 2026 National Interschool Educational Excellence Championship. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Official Registration Portal • Powered by React & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
};
