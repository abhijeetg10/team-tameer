import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText,
  LogOut,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { api } from '../lib/api';
import { District, ParticipatingSchool, Student } from '../types';

export const SimpleRegistrationPage: React.FC = () => {
  const { user, logout, authError, clearAuthError, loginWithEmail } = useAuth();
  const [directEmailInput, setDirectEmailInput] = useState('');
  const [showDirectInput, setShowDirectInput] = useState(false);

  const [district, setDistrict] = useState<District | ''>('');
  const [schoolsList, setSchoolsList] = useState<ParticipatingSchool[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  
  // School Info
  const [schoolName, setSchoolName] = useState('');

  // Mentor Info
  const [mentorName, setMentorName] = useState('');
  const [mentorDesignation, setMentorDesignation] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPhoto, setMentorPhoto] = useState<string>('');
  const [mentorIdDoc, setMentorIdDoc] = useState<string>('');

  // 4 Students Info
  const [students, setStudents] = useState<Array<{
    name: string;
    className: string;
    photo: string;
    idDoc: string;
  }>>([
    { name: '', className: '', photo: '', idDoc: '' },
    { name: '', className: '', photo: '', idDoc: '' },
    { name: '', className: '', photo: '', idDoc: '' },
    { name: '', className: '', photo: '', idDoc: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRegId, setSubmittedRegId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update schools dropdown when district changes
  useEffect(() => {
    if (district) {
      api.getParticipatingSchools(district).then((list) => {
        setSchoolsList(list);
      });
    } else {
      setSchoolsList([]);
    }
  }, [district]);

  // When a school is picked from the dropdown
  const handleSchoolSelect = (psId: string) => {
    setSelectedSchoolId(psId);
    const found = schoolsList.find(s => s.id === psId);
    if (found) {
      setSchoolName(found.school_name);
    }
  };

  // Convert uploaded file to base64 data URL
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB. Please select a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateStudent = (index: number, field: 'name' | 'className' | 'photo' | 'idDoc', val: string) => {
    const copy = [...students];
    copy[index] = { ...copy[index], [field]: val };
    setStudents(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation - only District, School Name, Mentor, and 4 Students required
    if (!district) {
      setErrorMessage('Please select your district (Kolhapur, Sangli, or Satara).');
      return;
    }
    if (!selectedSchoolId || !schoolName.trim()) {
      setErrorMessage('Please select your participating school from the dropdown.');
      return;
    }
    if (!mentorName.trim() || !mentorPhone.trim()) {
      setErrorMessage('Please enter Faculty Mentor name and contact phone number.');
      return;
    }

    // Check all 4 students have at least names and classes
    const missingStudents = students.filter(s => !s.name.trim() || !s.className.trim());
    if (missingStudents.length > 0) {
      setErrorMessage('Please provide full name and class for all 4 student delegates.');
      return;
    }

    try {
      setIsSubmitting(true);
      const regId = `TT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const schoolData = {
        participating_school_id: selectedSchoolId,
        school_name: schoolName,
        district: district as District,
        school_code: '',
        address: '',
        city: `${district} District`,
        principal_name: '',
        school_email: mentorEmail || user?.google_email || '',
        contact_number: mentorPhone || '',
        status: 'submitted' as const,
        registration_id: regId,
        submitted_at: new Date().toISOString(),
      };

      const mentorData = {
        full_name: mentorName,
        phone: mentorPhone,
        email: mentorEmail,
        designation: mentorDesignation,
        photo_path: mentorPhoto,
        id_document_path: mentorIdDoc,
      };

      const studentsData: Partial<Student>[] = students.map((s, idx) => ({
        student_number: idx + 1,
        full_name: s.name,
        class_name: s.className,
        photo_path: s.photo,
        school_id_document_path: s.idDoc,
        identity_document_type: 'school_id',
      }));

      // Save draft and submit
      const saved = await api.saveSchoolDraft(user?.id || `user-${Date.now()}`, schoolData, mentorData, studentsData);
      await api.submitRegistration(saved.school.id, mentorEmail || user?.google_email || 'school@teamtameer.org');

      setSubmittedRegId(regId);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setDistrict('');
    setSelectedSchoolId('');
    setSchoolName('');
    setMentorName('');
    setMentorDesignation('');
    setMentorPhone('');
    setMentorEmail('');
    setMentorPhoto('');
    setMentorIdDoc('');
    setStudents([
      { name: '', className: '', photo: '', idDoc: '' },
      { name: '', className: '', photo: '', idDoc: '' },
      { name: '', className: '', photo: '', idDoc: '' },
      { name: '', className: '', photo: '', idDoc: '' },
    ]);
    setIsSubmitted(false);
    setSubmittedRegId('');
    setErrorMessage(null);
  };

  // 1. IF NOT LOGGED IN: SHOW GOOGLE SIGN-IN GATE
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-2xl p-8 sm:p-14 text-center space-y-6">
          {/* Large Both Logos */}
          <div className="flex items-center justify-center gap-5 sm:gap-7">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
              <img src="/logo.png" alt="Team Tameer Logo" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
            </div>
            <div className="h-14 w-px bg-slate-200"></div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
              <img src="/logo2.jpeg" alt="Event Partner Logo" className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-xl" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Authentication Required</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Sign In to Access Form
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
              School representatives and faculty mentors must sign in to fill out and submit the official Team Tameer registration form.
            </p>
          </div>

          {/* Diagnostic error banner if Google OAuth exchange failed */}
          {authError && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-left space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm sm:text-base text-amber-900">Google OAuth Setup Issue Detected</h4>
                  <p className="text-xs sm:text-sm text-amber-800 break-words font-mono bg-amber-100/70 p-2 rounded-lg">
                    {authError}
                  </p>
                </div>
              </div>
              
              <div className="bg-white/90 p-3 sm:p-4 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-amber-950">How to fix this in your Supabase Dashboard:</p>
                <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                  <li>
                    Go to <strong>Google Cloud Console &gt; Credentials &gt; OAuth 2.0 Client IDs</strong>
                  </li>
                  <li>
                    Check <strong>Authorized redirect URIs</strong> is set to: <br/>
                    <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono select-all">https://dfmsrevoyldpwkhsypud.supabase.co/auth/v1/callback</code>
                  </li>
                  <li>
                    Copy your <strong>Client Secret</strong> (ensure there are no leading or trailing spaces).
                  </li>
                  <li>
                    Go to <strong>Supabase Dashboard &gt; Authentication &gt; Providers &gt; Google</strong>, re-paste the <strong>Client Secret</strong>, and click <strong>Save</strong>.
                  </li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="text-xs font-bold text-amber-900 hover:underline"
                >
                  Dismiss Notice
                </button>
                <span className="text-xs text-amber-700 font-semibold">
                  You can also sign in directly below
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col items-center justify-center gap-4">
            <GoogleSignInButton 
              size="xl" 
              buttonText="Sign in with Google to Continue" 
              redirectTo="/register" 
              className="w-full sm:w-auto"
            />

            {/* Direct Email Sign-In Option so users/testers are never locked out */}
            <div className="w-full max-w-md pt-2 border-t border-slate-200">
              {!showDirectInput ? (
                <button
                  type="button"
                  onClick={() => setShowDirectInput(true)}
                  className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <span>Or enter email directly to sign in</span>
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!directEmailInput.trim()) return;
                    const clean = directEmailInput.trim().toLowerCase();
                    loginWithEmail(clean, clean === 'argaikwad24@gmail.com' ? 'admin' : 'school');
                  }}
                  className="space-y-3 pt-2 text-left"
                >
                  <label className="block text-xs font-bold text-slate-700">
                    Direct Email Sign-In (Official / School Email)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="e.g. argaikwad24@gmail.com or school@edu.in"
                      value={directEmailInput}
                      onChange={(e) => setDirectEmailInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-all"
                    >
                      Sign In
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Use <strong>argaikwad24@gmail.com</strong> for Super Admin or your school's official email for registration.
                  </p>
                </form>
              )}
            </div>

            <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1.5 mt-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home Overview</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. SUCCESS CARD
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-14 text-center space-y-6">
          <div className="flex items-center justify-center gap-5 sm:gap-7">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img src="/logo.png" alt="Team Tameer Logo" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img src="/logo2.jpeg" alt="Event Partner Logo" className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-xl" />
            </div>
          </div>

          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner border border-emerald-200">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Registration Confirmed
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
              Registration Successfully Submitted!
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-lg mx-auto">
              Your official delegation has been recorded. Thank you for registering <strong>{schoolName}</strong> for Team Tameer 2026.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-200 rounded-2xl inline-block shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-blue-900 uppercase tracking-wider">Official Registration Number</p>
            <p className="text-3xl sm:text-4xl font-mono font-black text-blue-700 mt-1">{submittedRegId}</p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Submit Another Response
            </button>
            <Link
              to="/admin"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-extrabold transition-all text-center"
            >
              View in Admin Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN FORM FOR SIGNED-IN USER
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      {/* USER STATUS TOP BAR */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 animate-pulse"></div>
          <span className="text-base font-semibold text-slate-600">
            Authenticated Representative: <strong className="text-slate-900 font-bold">{user.full_name || user.google_email}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="text-sm font-bold text-slate-500 hover:text-rose-600 inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account / Sign Out</span>
        </button>
      </div>

      {/* WEBSITE HERO BANNER (With Large Prominent Logos) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border-2 border-blue-900/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            {/* Large Logos side by side */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-xl shrink-0">
              <img 
                src="/logo.png" 
                alt="Team Tameer Logo" 
                className="h-24 w-24 sm:h-28 sm:w-28 object-contain rounded-2xl bg-white p-1.5" 
              />
              <img 
                src="/logo2.jpeg" 
                alt="Event Logo" 
                className="h-24 w-24 sm:h-28 sm:w-28 object-contain rounded-2xl bg-white p-1.5" 
              />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Official Interschool Championship 2026</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Team Tameer Registration
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Official delegation portal for Kolhapur, Sangli, and Satara districts. Register your institution's <strong>1 Faculty Mentor</strong> and <strong>4 Student Delegates</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Website Feature Badges */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/15 text-sm sm:text-base text-slate-200 font-semibold">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span>36 Official Participating Schools</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            <span>1 Faculty Mentor + 4 Student Delegates</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-purple-400"></span>
            <span>Direct Admin Panel Document Access</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl text-base font-bold text-rose-700 flex items-center gap-3.5 shadow-md">
          <AlertCircle className="w-6 h-6 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* FORM START */}
      <form onSubmit={handleSubmit} className="space-y-10">

        {/* SECTION 1: SCHOOL SELECTION */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-100 font-black text-xl shadow-2xs">
                01
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  School Selection
                </h2>
                <p className="text-sm sm:text-base text-slate-500 mt-0.5">
                  Select your district and accredited school from the official roster
                </p>
              </div>
            </div>
            <Building2 className="w-8 h-8 text-blue-600/70" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* District Selector */}
            <div>
              <label className="block text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                Select District <span className="text-rose-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value as District | '');
                  setSelectedSchoolId('');
                  setSchoolName('');
                }}
                required
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 text-base sm:text-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 shadow-sm transition-all"
              >
                <option value="">-- Choose District --</option>
                <option value="Kolhapur">Kolhapur District (16 Participating Schools)</option>
                <option value="Sangli">Sangli District (12 Participating Schools)</option>
                <option value="Satara">Satara District (8 Participating Schools)</option>
              </select>
            </div>

            {/* School Dropdown */}
            <div>
              <label className="block text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                Select School Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSchoolId}
                disabled={!district}
                onChange={(e) => handleSchoolSelect(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 text-base sm:text-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 shadow-sm transition-all"
              >
                <option value="">
                  {district ? `-- Choose School in ${district} --` : '-- Select District First --'}
                </option>
                {schoolsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.school_name}
                  </option>
                ))}
              </select>
              {district === 'Satara' && (
                <p className="text-sm text-purple-800 font-bold mt-2.5 flex items-center gap-1.5">
                  <span>✓</span>
                  <span>Includes Tanzeem e Waliden Urdu High School Wai satara & ANJUMAN KHAIRUL ISLAM URDU HIGH SCHOOL MAHABALESHWAR</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: FACULTY MENTOR */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-100 font-black text-xl shadow-2xs">
                02
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Faculty Mentor In-Charge
                </h2>
                <p className="text-sm sm:text-base text-slate-500 mt-0.5">
                  Primary teacher or faculty member responsible for the student delegation
                </p>
              </div>
            </div>
            <UserCheck className="w-8 h-8 text-emerald-600/70" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div>
              <label className="block text-base font-bold text-slate-800 mb-2">
                Mentor Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                required
                placeholder="Prof. / Mr. / Mrs. Full Name"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-base font-semibold focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-800 mb-2">
                Designation / Role
              </label>
              <input
                type="text"
                value={mentorDesignation}
                onChange={(e) => setMentorDesignation(e.target.value)}
                placeholder="Senior Science Teacher / Activity Head"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-base font-semibold focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-800 mb-2">
                Contact Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={mentorPhone}
                onChange={(e) => setMentorPhone(e.target.value)}
                required
                placeholder="+91 98220 12345"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-base font-semibold focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-800 mb-2">
                Official Email Address
              </label>
              <input
                type="email"
                value={mentorEmail}
                onChange={(e) => setMentorEmail(e.target.value)}
                placeholder="mentor@school.edu.in"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-base font-semibold focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 bg-white transition-all"
              />
            </div>
          </div>

          {/* Mentor Photo & Document Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
              <span className="block text-base font-bold text-slate-800">Mentor Passport Photo</span>
              {mentorPhoto ? (
                <div className="flex items-center gap-4 p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <img src={mentorPhoto} alt="Mentor" className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-2xs" />
                  <span className="text-sm text-emerald-600 font-extrabold">✓ Photo Attached</span>
                  <button type="button" onClick={() => setMentorPhoto('')} className="text-sm text-rose-500 hover:underline ml-auto font-bold cursor-pointer">Remove</button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setMentorPhoto)}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-extrabold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                />
              )}
            </div>

            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
              <span className="block text-base font-bold text-slate-800">Mentor ID Proof / Authority Letter</span>
              {mentorIdDoc ? (
                <div className="flex items-center gap-4 p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <FileText className="w-10 h-10 text-blue-600" />
                  <span className="text-sm text-emerald-600 font-extrabold">✓ Document Attached</span>
                  <button type="button" onClick={() => setMentorIdDoc('')} className="text-sm text-rose-500 hover:underline ml-auto font-bold cursor-pointer">Remove</button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, setMentorIdDoc)}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-extrabold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: 4 STUDENT DELEGATES (Spacious Large Cards Grid) */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100 font-black text-xl shadow-2xs">
                03
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Student Delegates (Exactly 4 Students)
                </h2>
                <p className="text-sm sm:text-base text-slate-500 mt-0.5">
                  Enter student names, classes, and ID proof documents for each student delegate
                </p>
              </div>
            </div>
            <Users className="w-8 h-8 text-purple-600/70" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {students.map((student, idx) => (
              <div 
                key={idx}
                className="p-7 sm:p-9 rounded-3xl border-2 border-slate-200/90 bg-white space-y-6 hover:border-purple-300 hover:shadow-lg transition-all shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-black shadow-sm">
                      #{idx + 1}
                    </span>
                    <span>Student Delegate #{idx + 1}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold px-3 py-1 rounded-lg bg-purple-100 text-purple-800">
                    Student
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-bold text-slate-800 mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => updateStudent(idx, 'name', e.target.value)}
                      required
                      placeholder={`Full Name of Student ${idx + 1}`}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-base font-semibold focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-slate-800 mb-2">
                      Class / Grade <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={student.className}
                      onChange={(e) => updateStudent(idx, 'className', e.target.value)}
                      required
                      placeholder="e.g. Class 9th or Class 10th"
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-base font-semibold focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Student Photo & ID Card file upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t-2 border-slate-100">
                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-sm font-bold text-slate-800">
                      Student Photo
                    </label>
                    {student.photo ? (
                      <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <img src={student.photo} alt={student.name} className="w-11 h-11 rounded-lg object-cover border" />
                        <span className="text-xs font-extrabold text-emerald-600">✓ Attached</span>
                        <button type="button" onClick={() => updateStudent(idx, 'photo', '')} className="text-xs text-rose-500 hover:underline ml-auto font-bold cursor-pointer">Clear</button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (url) => updateStudent(idx, 'photo', url))}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
                      />
                    )}
                  </div>

                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-sm font-bold text-slate-800">
                      School ID / Proof
                    </label>
                    {student.idDoc ? (
                      <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <span className="text-xs font-extrabold text-emerald-600">✓ Attached</span>
                        <button type="button" onClick={() => updateStudent(idx, 'idDoc', '')} className="text-xs text-rose-500 hover:underline ml-auto font-bold cursor-pointer">Clear</button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, (url) => updateStudent(idx, 'idDoc', url))}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMISSION ACTION CARD */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              Delegation Certification
            </p>
            <p className="text-base text-slate-500 max-w-xl leading-relaxed">
              By submitting, you certify that the above 1 mentor and 4 student delegates are officially authorized by the school administration.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full lg:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-lg font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Submitting Registration...</span>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>Submit School Registration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
