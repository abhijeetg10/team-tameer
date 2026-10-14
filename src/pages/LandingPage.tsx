import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  School as SchoolIcon,
  MapPin,
  LogIn,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { isAuthorizedAdmin } from '../lib/adminAuth';

export const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Once signed in, immediately move forward to the appropriate page!
  useEffect(() => {
    if (user) {
      if (isAuthorizedAdmin(user.google_email)) {
        navigate('/admin');
      } else {
        navigate('/register');
      }
    }
  }, [user, navigate]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 bg-gradient-to-b from-blue-50/70 via-slate-50 to-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Large Both Logos Container */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="inline-flex items-center justify-center gap-5 sm:gap-8 p-4 bg-white/95 rounded-3xl border border-slate-200 shadow-xl backdrop-blur-md">
              <img 
                src="/logo.png" 
                alt="Team Tameer Logo" 
                className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain"
              />
              <div className="h-16 sm:h-20 w-px bg-slate-200"></div>
              <img 
                src="/logo2.jpeg" 
                alt="Event Partner Logo" 
                className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain rounded-2xl"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs sm:text-sm font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Official Interschool Championship 2026</span>
            </div>
          </div>

          {/* Main Headline - Large Website Typography */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Team Tameer Registration
          </h1>

          {/* Subheading - High Legibility */}
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Official school delegation portal for accredited secondary schools across <strong className="text-slate-900">Kolhapur</strong>, <strong className="text-slate-900">Sangli</strong>, and <strong className="text-slate-900">Satara</strong> districts.
          </p>

          {/* GOOGLE SIGN IN OR DIRECT REGISTRATION CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            {user ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg max-w-xl w-full text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-bold text-slate-600">
                    Signed in as <strong className="text-slate-900">{user.full_name || user.google_email}</strong>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-extrabold shadow-md hover:shadow-xl transition-all active:scale-95"
                  >
                    <span>Proceed to Registration Form</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 sm:p-10 shadow-xl max-w-lg w-full text-center space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Representative Sign-In Required
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    Sign in to Register Your School
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Please sign in with Google to fill out and submit your school's team registration.
                  </p>
                </div>

                {/* Prominent Google Sign-In Button */}
                <div className="pt-2 flex justify-center">
                  <GoogleSignInButton 
                    size="xl" 
                    buttonText="Sign in with Google to Register"
                    className="w-full justify-center"
                  />
                </div>

                <p className="text-xs text-slate-400">
                  Instant secure sign-in • Official accreditation for Kolhapur, Sangli & Satara
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 mt-2">
              <Link to="/admin" className="hover:text-purple-700 hover:underline flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Secretariat Admin Access</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW THE REGISTRATION WORKS (4 STEPS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Streamlined Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Registration Works
          </h2>
          <p className="text-base text-slate-600">
            A simple 4-step registration process designed specifically for school administrators and mentors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Sign In with Google
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Use your Google account for quick, one-click authentication as a school representative.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Select School
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Choose your district and select your institution from the official 36 participating schools roster.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Mentor & 4 Students
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Provide details for 1 Faculty Mentor and 4 Student Delegates with photos and ID documents.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Instant Confirmation
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Receive an official registration ID immediately. All documents are stored securely for the admin team.
            </p>
          </div>
        </div>
      </section>

      {/* 3 DISTRICTS ROSTER SUMMARY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Participating Districts
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            36 Accredited Institutions
          </h2>
          <p className="text-base text-slate-600">
            Participation is officially organized across South Maharashtra education zones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kolhapur */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg">
                District 01
              </span>
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Kolhapur</h3>
            <p className="text-3xl font-extrabold text-blue-600">16 Schools</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Leading accredited schools and junior colleges across Kolhapur city and district.
            </p>
          </div>

          {/* Sangli */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg">
                District 02
              </span>
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Sangli</h3>
            <p className="text-3xl font-extrabold text-emerald-600">12 Schools</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Prominent participating institutions and high schools from Sangli and Miraj region.
            </p>
          </div>

          {/* Satara */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-lg">
                District 03
              </span>
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Satara</h3>
            <p className="text-3xl font-extrabold text-purple-600">8 Schools</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Including <strong className="text-slate-800">Tanzeem e Waliden Urdu High School Wai</strong> and <strong className="text-slate-800">ANJUMAN KHAIRUL ISLAM URDU HIGH SCHOOL MAHABALESHWAR</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM REQUIREMENTS HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              Delegation Composition
            </span>
            <h3 className="text-2xl sm:text-4xl font-black leading-tight">
              Ready to Register Your School's Team?
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              Each institution must register exactly <strong>1 Faculty Mentor</strong> and <strong>4 Student Delegates</strong>. No extraneous principal details or postal paperwork required.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-3 w-full md:w-auto">
            {user ? (
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-base font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 text-center"
              >
                Open Registration Form
              </Link>
            ) : (
              <GoogleSignInButton 
                size="lg" 
                buttonText="Sign in with Google" 
                className="w-full sm:w-auto"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
