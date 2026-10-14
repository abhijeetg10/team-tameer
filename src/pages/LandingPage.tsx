import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Lock, 
  Award,
  ChevronDown,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { EventSettings } from '../types';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { user, role } = useAuth();
  const [settings, setSettings] = useState<EventSettings | null>(null);

  useEffect(() => {
    api.getEventSettings().then(setSettings);
  }, []);

  const deadlineFormatted = settings?.registration_deadline
    ? new Date(settings.registration_deadline).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'November 10, 2026';

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC] border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>National Interschool Educational Excellence Conclave 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              School Event Registration Portal
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Register your school team for the upcoming event. One school, four students and one mentor. Complete official registration and document verification in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              {user ? (
                role === 'admin' || role === 'superadmin' ? (
                  <Link to="/admin">
                    <Button size="lg" variant="navy" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Open Admin Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Continue School Registration
                    </Button>
                  </Link>
                )
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Register Your School
                    </Button>
                  </Link>
                  <a href="#guidelines">
                    <Button size="lg" variant="secondary">
                      View Guidelines
                    </Button>
                  </a>
                </>
              )}
            </div>

            {/* Live Registration Deadline Banner */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Registration Deadline: <strong className="text-slate-800">{deadlineFormatted}</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">Official Roster: 34 Schools (Kolhapur, Sangli & Satara)</span>
            </div>
          </div>

          {/* 3 Prominent Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                4 Students Per School
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Each school sends a team of exactly 4 student delegates from Classes 9 to 12. Photographs and valid student credentials required.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                1 Mentor Per School
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Exactly one designated teacher or faculty member accompanies the student delegation as official mentor and primary contact.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Secure Online Registration
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Authorized registration with Google OAuth, auto-saved draft forms, private encrypted document storage, and UIDAI Aadhaar masking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guidelines & Eligibility Section */}
      <section id="guidelines" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Eligibility & Participation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Event Registration Guidelines
          </h2>
          <p className="text-xs text-slate-500">
            Please review the team constitution criteria before commencing the registration wizard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Institutional Eligibility Criteria
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Recognized senior secondary schools (CBSE, ICSE, State Boards, IB, or Cambridge affiliated).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Registration must be completed or endorsed by the School Principal or designated Head of Institution.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Participating students must be currently enrolled in Classes 9, 10, 11, or 12.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Team size is strictly capped at exactly 4 students and 1 mentor. No additional observers allowed inside testing zones.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Registration & Security Workflow
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span><strong>Single Registration ID:</strong> Each school receives an immutable reference ID (e.g. EVT-2026-001).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span><strong>Draft Autosave:</strong> Incomplete details are autosaved locally and can be resumed at any time.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span><strong>Administrative Verification:</strong> Submitted dossiers are inspected by the secretariat; schools are notified in case corrections are required.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span><strong>Instant Pass Download:</strong> Upon submission, download the official digital Registration Acknowledgement PDF pass.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Documents Required & Privacy Policy Section */}
      <section id="schedule" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Checklist & Document Policy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Required Documents & Privacy Rules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Item 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              01
            </span>
            <h4 className="text-sm font-bold text-slate-900">School Credentials</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              School Name, UDISE ID, Address, Official Email, Principal's Name and Phone Number, and Optional School Crest/Logo.
            </p>
          </div>

          {/* Item 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              02
            </span>
            <h4 className="text-sm font-bold text-slate-900">Mentor Credentials</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Faculty Passport Photograph, Mobile Number, and School Faculty Identity Card or Authorization Letter on letterhead.
            </p>
          </div>

          {/* Item 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              03
            </span>
            <h4 className="text-sm font-bold text-slate-900">4 Student Delegate Profiles</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Passport Photo, Class / Section, School Identity Card, and Secondary ID (Masked Aadhaar with only last 4 digits visible).
            </p>
          </div>
        </div>

        {/* UIDAI Privacy Safeguard Highlight Box */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold">Child Privacy & Document Redaction Standard</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Because students are minors, we do not collect full 12-digit Aadhaar numbers, biometric data, or unmasked proofs. Please use School ID cards or properly masked copies.
              </p>
            </div>
          </div>
          <Link to="/register" className="shrink-0">
            <Button variant="primary" size="md">
              Start School Registration
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Secretariat Helpdesk & Enquiries</h3>
            <p className="text-xs text-slate-500 mt-1">
              Have questions regarding registration, eligibility, or mentor substitutions?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Mail className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Email Desk</p>
              <p className="text-slate-500 mt-0.5">{settings?.support_email || 'events@interschoolchampionship2026.org'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Phone className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Helpline Phone</p>
              <p className="text-slate-500 mt-0.5">{settings?.contact_phone || '+91 98112-44550'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Official Venue</p>
              <p className="text-slate-500 mt-0.5">National Education Complex, New Delhi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
