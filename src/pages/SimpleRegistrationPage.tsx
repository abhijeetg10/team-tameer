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
  Lock,
  Phone,
  Mail,
  Download,
  Printer,
  ImageIcon,
  CreditCard,
  Check,
  Copy,
  UploadCloud,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { api } from '../lib/api';
import { District, ParticipatingSchool, Student, FullSchoolRegistration } from '../types';
import { generateAcknowledgementPDF } from '../lib/pdfGenerator';
import { isAuthorizedAdmin, isSuperAdmin } from '../lib/adminAuth';

export const SimpleRegistrationPage: React.FC = () => {
  const { user, logout, authError, clearAuthError, loginWithEmail } = useAuth();
  const [directEmailInput, setDirectEmailInput] = useState('');
  const [showDirectInput, setShowDirectInput] = useState(false);

  const [district, setDistrict] = useState<District | ''>('');
  const [schoolsList, setSchoolsList] = useState<ParticipatingSchool[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  // School Info
  const [schoolName, setSchoolName] = useState('');
  const [schoolUdise, setSchoolUdise] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [principalPhone, setPrincipalPhone] = useState('');

  // Mentor Info
  const [mentorName, setMentorName] = useState('');
  const [mentorDesignation, setMentorDesignation] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPhoto, setMentorPhoto] = useState<string>('');
  const [mentorIdDoc, setMentorIdDoc] = useState<string>('');

  // 3 Students Info
  const [students, setStudents] = useState<Array<{
    name: string;
    className: string;
    studentRegistrationNumber: string;
    photo: string;
    idDoc: string;
  }>>([
    { name: '', className: '', studentRegistrationNumber: '', photo: '', idDoc: '' },
    { name: '', className: '', studentRegistrationNumber: '', photo: '', idDoc: '' },
    { name: '', className: '', studentRegistrationNumber: '', photo: '', idDoc: '' },
  ]);

  // Payment Details (Registration Fee: Rs. 1000 via GPay / PhonePe to 8793224533 - Amin Karmalkar)
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [isUploadingPaymentScreenshot, setIsUploadingPaymentScreenshot] = useState(false);
  const [paymentCopied, setPaymentCopied] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRegId, setSubmittedRegId] = useState<string>('');
  const [submittedRegistration, setSubmittedRegistration] = useState<FullSchoolRegistration | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Existing registered schools detector
  const [allRegisteredSchools, setAllRegisteredSchools] = useState<FullSchoolRegistration[]>([]);
  const [alreadyRegisteredSchool, setAlreadyRegisteredSchool] = useState<FullSchoolRegistration | null>(null);

  // Refresh registrations helper
  const refreshRegisteredSchools = () => {
    api.getAllSchools().then((regs) => {
      setAllRegisteredSchools(regs);
    });
  };

  // Load existing registrations and listen for deletion / updates across tabs
  useEffect(() => {
    refreshRegisteredSchools();

    const handleStorageChange = (e?: StorageEvent | Event) => {
      refreshRegisteredSchools();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update schools dropdown when district changes
  useEffect(() => {
    if (district) {
      api.getParticipatingSchools(district).then((list) => {
        setSchoolsList(list);
      });
      refreshRegisteredSchools();
    } else {
      setSchoolsList([]);
      setAlreadyRegisteredSchool(null);
    }
  }, [district]);

  // Keep alreadyRegisteredSchool in sync with selectedSchoolId and allRegisteredSchools
  useEffect(() => {
    if (!selectedSchoolId) {
      setAlreadyRegisteredSchool(null);
      return;
    }
    const found = schoolsList.find(s => s.id === selectedSchoolId);
    const sName = found?.school_name?.trim().toLowerCase() || schoolName.trim().toLowerCase();
    const match = allRegisteredSchools.find(r => 
      r.school.participating_school_id === selectedSchoolId ||
      r.school.id === selectedSchoolId ||
      (sName && r.school.school_name && r.school.school_name.trim().toLowerCase() === sName)
    );
    setAlreadyRegisteredSchool(match || null);
  }, [selectedSchoolId, allRegisteredSchools, schoolsList, schoolName]);

  // When a school is picked from the dropdown
  const handleSchoolSelect = (psId: string) => {
    setSelectedSchoolId(psId);
    const found = schoolsList.find(s => s.id === psId);
    if (found) {
      setSchoolName(found.school_name);
    }
    const sName = found?.school_name?.trim().toLowerCase() || '';
    const match = allRegisteredSchools.find(r => 
      r.school.participating_school_id === psId ||
      r.school.id === psId ||
      (sName && r.school.school_name && r.school.school_name.trim().toLowerCase() === sName)
    );
    setAlreadyRegisteredSchool(match || null);
  };

  // Upload file directly to Supabase Storage (with fallback to local data URL if offline)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void,
    preferredFolder?: 'photos' | 'documents'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB. Please select a smaller file.');
      return;
    }

    const folder: 'photos' | 'documents' = preferredFolder || (file.name.toLowerCase().endsWith('.pdf') ? 'documents' : 'photos');

    try {
      const res = await api.uploadFile(file, folder);
      callback(res.path);
    } catch (err: any) {
      console.warn('Storage upload error, using local fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateStudent = (
    index: number,
    field: 'name' | 'className' | 'studentRegistrationNumber' | 'photo' | 'idDoc',
    val: string
  ) => {
    const copy = [...students];
    copy[index] = { ...copy[index], [field]: val };
    setStudents(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation - District, School Name, School UDISE Number, Mentor, and 3 Mandatory Students
    if (!district) {
      setErrorMessage('Please select your district (Kolhapur, Sangli, or Satara).');
      return;
    }
    if (!selectedSchoolId || !schoolName.trim()) {
      setErrorMessage('Please select your participating school from the dropdown.');
      return;
    }
    if (alreadyRegisteredSchool) {
      setErrorMessage(
        `This school (${schoolName}) is already registered! If you have any queries or need assistance, please contact Dr. Rais Khan (+91 99234 79476), Sameer Aagha (+91 96736 92003), or Akhlaque Patel (+91 99751 03553).`
      );
      return;
    }
    if (!schoolUdise.trim()) {
      setErrorMessage('Please enter your School UDISE Number.');
      return;
    }
    if (!principalName.trim() || !principalPhone.trim()) {
      setErrorMessage('Please enter Principal Full Name and Principal Mobile Number.');
      return;
    }
    if (!mentorName.trim() || !mentorDesignation.trim() || !mentorPhone.trim() || !mentorEmail.trim()) {
      setErrorMessage('Please enter all Faculty Mentor details (Full Name, Designation, Phone Number, and Official Email Address).');
      return;
    }

    // Check all 3 mandatory students have full name, class, and roll / registration number
    const missingStudentFields = students.some(
      s => !s.name.trim() || !s.className.trim() || !s.studentRegistrationNumber.trim()
    );
    if (missingStudentFields) {
      setErrorMessage('Please provide Full Name, Class (8th or 9th), and Reg / Roll Number for all 3 student delegates.');
      return;
    }

    // Payment Verification: Screenshot or Transaction ID validation
    if (!paymentScreenshot.trim() && !transactionId.trim()) {
      setErrorMessage('Please upload the Payment Screenshot or enter the UPI Transaction ID / UTR Number for the Registration Fee of Rs. 1000 (paid to 8793224533 - Amin Karmalkar).');
      return;
    }

    try {
      setIsSubmitting(true);
      const regId = `GKQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const schoolData = {
        participating_school_id: selectedSchoolId,
        school_name: schoolName,
        district: district as District,
        school_code: schoolUdise.trim(),
        address: '',
        city: (district as District) || '',
        principal_name: principalName.trim(),
        principal_phone: principalPhone.trim(),
        school_email: mentorEmail || user?.google_email || '',
        contact_number: principalPhone.trim() || mentorPhone || '',
        status: 'submitted' as const,
        registration_id: regId,
        submitted_at: new Date().toISOString(),
        payment_amount: 1000,
        payment_transaction_id: transactionId.trim() || 'RECEIPT_UPLOADED',
        payment_screenshot_path: paymentScreenshot.trim(),
        payment_status: 'paid' as const,
        payment_method: 'GPay / PhonePe (8793224533 - Amin Karmalkar)',
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
        full_name: s.name.trim(),
        class_name: s.className.trim(),
        student_registration_number: s.studentRegistrationNumber.trim(),
        photo_path: s.photo,
        school_id_document_path: s.idDoc,
        identity_document_type: 'school_id',
      }));

      // Save draft and submit
      const saved = await api.saveSchoolDraft(user?.id || `user-${Date.now()}`, schoolData, mentorData, studentsData);
      const submitted = await api.submitRegistration(saved.school.id, mentorEmail || user?.google_email || 'school@gkquiz2026.org');

      setSubmittedRegId(regId);
      setSubmittedRegistration(submitted);
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
    setSchoolUdise('');
    setPrincipalName('');
    setPrincipalPhone('');
    setMentorName('');
    setMentorDesignation('');
    setMentorPhone('');
    setMentorEmail('');
    setMentorPhoto('');
    setMentorIdDoc('');
    setTransactionId('');
    setPaymentScreenshot('');
    setStudents([
      { name: '', className: '', studentRegistrationNumber: '', photo: '', idDoc: '' },
      { name: '', className: '', studentRegistrationNumber: '', photo: '', idDoc: '' },
      { name: '', className: '', studentRegistrationNumber: '', photo: '', idDoc: '' },
    ]);
    setIsSubmitted(false);
    setSubmittedRegId('');
    setSubmittedRegistration(null);
    setErrorMessage(null);
    setAlreadyRegisteredSchool(null);
  };

  const handleDownloadPDF = () => {
    if (submittedRegistration) {
      generateAcknowledgementPDF(submittedRegistration);
      return;
    }
    const found = allRegisteredSchools.find(r => r.school.registration_id === submittedRegId);
    if (found) {
      generateAcknowledgementPDF(found);
      return;
    }
    // Fallback constructed from current form data
    const fallbackReg: FullSchoolRegistration = {
      school: {
        id: `school-${Date.now()}`,
        registration_id: submittedRegId || 'EVT-2026-REG',
        participating_school_id: selectedSchoolId,
        school_name: schoolName,
        district: (district as District) || 'Kolhapur',
        school_code: schoolUdise,
        address: '',
        city: (district as District) || 'Kolhapur',
        principal_name: principalName || 'Principal',
        school_email: mentorEmail || 'school@gkquiz2026.org',
        contact_number: principalPhone || mentorPhone || '9923479476',
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      mentor: {
        id: `mentor-${Date.now()}`,
        school_id: `school-${Date.now()}`,
        full_name: mentorName,
        designation: mentorDesignation,
        phone: mentorPhone,
        email: mentorEmail,
        photo_path: mentorPhoto,
        id_document_path: mentorIdDoc,
        created_at: new Date().toISOString(),
      },
      students: students.map((s, idx) => ({
        id: `std-${idx + 1}`,
        school_id: `school-${Date.now()}`,
        student_number: idx + 1,
        full_name: s.name,
        class_name: s.className,
        student_registration_number: s.studentRegistrationNumber,
        photo_path: s.photo,
        school_id_document_path: s.idDoc,
        identity_document_type: 'school_id',
        created_at: new Date().toISOString(),
      })) as Student[],
      reviews: []
    };
    generateAcknowledgementPDF(fallbackReg);
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
              School representatives and faculty mentors must sign in to fill out and submit the official State-Level GK Quiz Contest 2026 registration form.
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
                    Check <strong>Authorized redirect URIs</strong> is set to: <br />
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
                    loginWithEmail(
                      clean,
                      isSuperAdmin(clean) ? 'superadmin' : isAuthorizedAdmin(clean) ? 'admin' : 'school'
                    );
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
                      placeholder="e.g. argaikwad24@gmail.com, rehanchougle2000@gmail.com, or school@edu.in"
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
                    Designated Super Admins: <strong>argaikwad24@gmail.com</strong>, <strong>rehanchougle2000@gmail.com</strong>
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
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-12 text-center space-y-8">
          {/* Header Logos */}
          <div className="flex items-center justify-center gap-5 sm:gap-7">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img src="/logo.png" alt="Team Tameer Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img src="/logo2.jpeg" alt="Event Partner Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-xl" />
            </div>
          </div>

          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner border border-emerald-200">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Registration Confirmed</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 tracking-tight">
              Registration Successfully Submitted!
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-xl mx-auto">
              Your official delegation has been registered for <strong>{schoolName}</strong> for the State-Level GK Quiz Contest 2026.
            </p>
          </div>

          {/* Registration Number Badge */}
          <div className="p-6 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border-2 border-blue-200 rounded-3xl inline-block shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-blue-900 uppercase tracking-wider">Official Registration Number</p>
            <p className="text-3xl sm:text-5xl font-mono font-black text-blue-700 mt-1.5 tracking-tight">{submittedRegId}</p>
          </div>

          {/* PROMINENT DOWNLOAD REGISTRATION FORM (PDF) CARD */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-md space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-xs font-black uppercase tracking-wider">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Official Delegate Pass & Form</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Download Registration Form (PDF)
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed">
              Click below to download the official stamped registration acknowledgement and delegate pass. Contains full school details, mentor credentials, and 4 student delegates with registration numbers.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl transition-all cursor-pointer ring-4 ring-emerald-300/40"
              >
                <Download className="w-6 h-6 animate-pulse" />
                <span>Download Registration Form (PDF)</span>
              </button>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium">
              A4 Print Ready • Includes Authorized Signatures & QR/Ref ID
            </p>
          </div>

          {/* SUMMARY OF REGISTERED DELEGATION */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-3xl p-6 sm:p-7 text-left space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Registered Delegation Summary</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">3 Students + 1 Mentor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-xs text-slate-400 font-bold uppercase">School & District</p>
                <p className="font-bold text-slate-800">{schoolName}</p>
                <p className="text-xs text-slate-500">{district} District {schoolUdise ? `• UDISE: ${schoolUdise}` : ''}</p>
                {principalPhone && (
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Principal Contact: <strong className="text-slate-800">{principalPhone}</strong> {principalName ? `(${principalName})` : ''}
                  </p>
                )}
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-xs text-slate-400 font-bold uppercase">Faculty Mentor</p>
                <p className="font-bold text-slate-800">{mentorName || 'Faculty In-Charge'}</p>
                <p className="text-xs text-slate-500">{mentorDesignation} • {mentorPhone}</p>
              </div>
            </div>

            {/* Payment Details in Summary */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Registration Fee: ₹1,000 Paid (GPay / PhonePe)</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Beneficiary: <strong>Amin Karmalkar</strong> (8793224533)
                </p>
                {submittedRegistration?.school.payment_transaction_id && submittedRegistration.school.payment_transaction_id !== 'RECEIPT_UPLOADED' && (
                  <p className="text-xs font-mono text-emerald-950 font-bold mt-1">
                    Transaction ID / UTR: <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">{submittedRegistration.school.payment_transaction_id}</span>
                  </p>
                )}
              </div>
              {(submittedRegistration?.school.payment_screenshot_path || paymentScreenshot) && (
                <div className="flex items-center gap-2">
                  <a
                    href={submittedRegistration?.school.payment_screenshot_path || paymentScreenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Payment Screenshot</span>
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Delegates:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {students.map((st, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{i + 1}. {st.name || `Student ${i + 1}`}</span>
                      <span className="text-slate-500 ml-1.5 font-medium">({st.className || 'Class'})</span>
                    </div>
                    {st.studentRegistrationNumber && (
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {st.studentRegistrationNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CONTACT & QUERIES NOTICE */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 max-w-2xl mx-auto text-left text-xs sm:text-sm text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Questions or Corrections to Your Registration?</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              If you need to update any student or mentor details, contact the organizing team or technical support:
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold pt-1">
              <a href="tel:+919923479476" className="text-blue-700 hover:underline">
                📞 Dr. Rais Khan: +91 99234 79476
              </a>
              <a href="tel:+919673692003" className="text-blue-700 hover:underline">
                📞 Sameer Aagha: +91 96736 92003
              </a>
              <a href="tel:+919975103553" className="text-blue-700 hover:underline">
                📞 Akhlaque Patel: +91 99751 03553
              </a>
              <a href="tel:7588171372" className="text-purple-700 hover:underline">
                💻 Rehan Chougale: 7588171372 (Software Support)
              </a>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Submit Another Response
            </button>
            {user && (user.role === 'admin' || user.role === 'superadmin' || isAuthorizedAdmin(user.google_email)) && (
              <Link
                to="/admin"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-extrabold transition-all text-center"
              >
                View in Admin Panel
              </Link>
            )}
            <Link
              to="/"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-extrabold transition-all text-center"
            >
              Back to Home
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
                <span>State-Level Inter-School Championship 2026</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                State-Level GK Quiz Contest 2026
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Official delegation portal for Kolhapur, Sangli, and Satara districts. Register your institution's <strong>School UDISE Number</strong>, <strong>1 Faculty Mentor</strong>, and <strong>Student Delegates (3 Mandatory, 4th Optional)</strong>.
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
            <span>1 Faculty Mentor + 3 Student Delegates</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-purple-400"></span>
            <span>Official UDISE Verification & PDF Admit Pass</span>
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
                <option value="Kolhapur">Kolhapur District</option>
                <option value="Sangli">Sangli District</option>
                <option value="Satara">Satara District</option>
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
                {schoolsList.map((s) => {
                  const isReg = allRegisteredSchools.some(r => r.school.participating_school_id === s.id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.school_name} {isReg ? ' — (Already Registered)' : ''}
                    </option>
                  );
                })}
              </select>
              {district === 'Satara' && (
                <p className="text-sm text-purple-800 font-bold mt-2.5 flex items-center gap-1.5">
                  <span>✓</span>
                  <span>Includes Tanzeem e Waliden Urdu High School Wai satara & ANJUMAN KHAIRUL ISLAM URDU HIGH SCHOOL MAHABALESHWAR</span>
                </p>
              )}
            </div>

            {/* ALREADY REGISTERED NOTICE & CONTACT ADMIN BANNER */}
            {alreadyRegisteredSchool && (
              <div className="md:col-span-2 p-6 sm:p-7 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-4 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-start gap-3.5">
                  <AlertCircle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg sm:text-xl font-black text-amber-900">
                        Notice: This School is Already Registered!
                      </h4>
                      {alreadyRegisteredSchool.school.registration_id && (
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-lg border border-amber-300">
                          ID: {alreadyRegisteredSchool.school.registration_id}
                        </span>
                      )}
                      <span className="text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        Status: {alreadyRegisteredSchool.school.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-amber-900 leading-relaxed">
                      <strong>{schoolName}</strong> has already been registered on this platform.
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                      If you represent this institution and have any queries, need corrections, or faced difficulties, please contact our event administration or software development team below:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-amber-200">
                  <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Event Coordinator
                    </p>
                    <p className="font-black text-slate-900 text-base">Dr. Rais Khan</p>
                    <a
                      href="tel:+919923479476"
                      className="inline-flex items-center gap-2 text-blue-700 font-extrabold text-sm hover:underline pt-0.5"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>+91 99234 79476</span>
                    </a>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Event Coordinator
                    </p>
                    <p className="font-black text-slate-900 text-base">Sameer Aagha</p>
                    <a
                      href="tel:+919673692003"
                      className="inline-flex items-center gap-2 text-blue-700 font-extrabold text-sm hover:underline pt-0.5"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>+91 96736 92003</span>
                    </a>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Event Coordinator
                    </p>
                    <p className="font-black text-slate-900 text-base">Akhlaque Patel</p>
                    <a
                      href="tel:+919975103553"
                      className="inline-flex items-center gap-2 text-blue-700 font-extrabold text-sm hover:underline pt-0.5"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>+91 99751 03553</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* School Udise Number Field */}
            <div className="md:col-span-2">
              <label className="block text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>
                  School Udise Number <span className="text-rose-500">*</span>
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 normal-case">
                  Government School Code
                </span>
              </label>
              <input
                type="text"
                value={schoolUdise}
                onChange={(e) => setSchoolUdise(e.target.value)}
                required
                placeholder="e.g. 27340800301 (Official 11-digit UDISE Number)"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 text-base sm:text-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400"
              />
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
                Enter your school's 11-digit Unified District Information System for Education (UDISE) number as per government records.
              </p>
            </div>

            {/* Principal Full Name & Principal Mobile Number */}
            <div>
              <label className="block text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                Principal Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                required
                placeholder="Dr. / Mr. / Mrs. Principal Name"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 text-base sm:text-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>
                  Principal Mobile Number <span className="text-rose-500">*</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 normal-case">
                  Official Contact
                </span>
              </label>
              <input
                type="tel"
                value={principalPhone}
                onChange={(e) => setPrincipalPhone(e.target.value)}
                required
                placeholder="e.g. +91 98220 12345 (10-digit Mobile)"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 text-base sm:text-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400"
              />
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
                Designation / Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={mentorDesignation}
                onChange={(e) => setMentorDesignation(e.target.value)}
                required
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
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={mentorEmail}
                onChange={(e) => setMentorEmail(e.target.value)}
                required
                placeholder="mentor@school.edu.in"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-base font-semibold focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 bg-white transition-all"
              />
            </div>
          </div>

          {/* Mentor Photo & Document Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
              <span className="block text-base font-bold text-slate-800">Mentor Photo</span>
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
                  onChange={(e) => handleFileUpload(e, setMentorPhoto, 'photos')}
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
                  onChange={(e) => handleFileUpload(e, setMentorIdDoc, 'documents')}
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
                  Student Delegates (3 Mandatory Delegates)
                </h2>
                <p className="text-sm sm:text-base text-slate-500 mt-0.5">
                  All 3 student delegates are mandatory representatives for the school.
                </p>
              </div>
            </div>
            <Users className="w-8 h-8 text-purple-600/70" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
            {students.map((student, idx) => {
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border-2 border-slate-200/90 hover:border-purple-300 p-6 sm:p-7 space-y-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                          Student #{idx + 1}
                        </h4>
                        <p className="text-[11px] font-bold text-purple-700 mt-0.5">
                          Mandatory Delegate
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Required
                    </span>
                  </div>

                  {/* Form Inputs Container */}
                  <div className="space-y-4">
                    {/* 1. Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => updateStudent(idx, 'name', e.target.value)}
                        required
                        placeholder={`Full Name of Student ${idx + 1}`}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 bg-white transition-all placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>

                    {/* 2. Class Selection: Segmented 2-Button Toggle */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>
                          Class / Standard <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          8th or 9th Only
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateStudent(idx, 'className', '8th')}
                          className={`py-3 px-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            student.className === '8th'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200'
                              : 'bg-slate-50 hover:bg-purple-50/60 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>8th Standard</span>
                          {student.className === '8th' && <span className="text-xs">✓</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStudent(idx, 'className', '9th')}
                          className={`py-3 px-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            student.className === '9th'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200'
                              : 'bg-slate-50 hover:bg-purple-50/60 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>9th Standard</span>
                          {student.className === '9th' && <span className="text-xs">✓</span>}
                        </button>
                      </div>
                    </div>

                    {/* 3. Student Registration / Roll Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>
                          Student Reg / Roll No <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wide bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Required
                        </span>
                      </label>
                      <input
                        type="text"
                        value={student.studentRegistrationNumber}
                        onChange={(e) => updateStudent(idx, 'studentRegistrationNumber', e.target.value)}
                        required
                        placeholder={`e.g. REG-0${idx + 1} or Roll No`}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 bg-white transition-all placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* 4. Student Photo & ID Proof Upload Tiles (Clean Stacked Layout) */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    {/* Student Photo */}
                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                          <span>Student Photo</span>
                        </span>
                        {student.photo ? (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            ✓ Attached
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">JPG / PNG</span>
                        )}
                      </div>

                      {student.photo ? (
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <img src={student.photo} alt={student.name || 'Student'} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                          <span className="text-xs font-bold text-slate-800 truncate">Photo attached</span>
                          <button
                            type="button"
                            onClick={() => updateStudent(idx, 'photo', '')}
                            className="text-xs text-rose-500 hover:text-rose-700 ml-auto font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, (url) => updateStudent(idx, 'photo', url), 'photos')}
                          className="block w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
                        />
                      )}
                    </div>

                    {/* School ID / Bona Fide Proof */}
                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-600" />
                          <span>School ID / Proof</span>
                        </span>
                        {student.idDoc ? (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            ✓ Attached
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">ID / PDF / Proof</span>
                        )}
                      </div>

                      {student.idDoc ? (
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <FileText className="w-7 h-7 text-purple-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">ID document attached</span>
                          <button
                            type="button"
                            onClick={() => updateStudent(idx, 'idDoc', '')}
                            className="text-xs text-rose-500 hover:text-rose-700 ml-auto font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, (url) => updateStudent(idx, 'idDoc', url), 'documents')}
                          className="block w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: REGISTRATION FEES & PAYMENT DETAILS */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-100 font-black text-xl shadow-2xs">
                04
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Registration Fees & Payment
                  </h2>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full text-xs font-black uppercase tracking-wider">
                    ₹1,000 / Delegation
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-500 mt-0.5">
                  Complete the ₹1,000 registration fee payment via GPay or PhonePe and enter the transaction ID
                </p>
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-emerald-600/70" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Payment Info & UPI Details Card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-blue-50/40 border-2 border-emerald-200 p-6 sm:p-8 space-y-5 flex flex-col justify-between shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    Official Payment Gateway
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-800">₹1,000</span>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pay via GPay / PhonePe</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">Amin Karmalkar</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-emerald-300 shadow-sm flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">GPay / PhonePe Number</span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-emerald-700 tracking-wider">8793224533</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('8793224533');
                      setPaymentCopied(true);
                      setTimeout(() => setPaymentCopied(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
                  >
                    {paymentCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>How to pay:</span>
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-600 font-medium">
                    <li>Open <strong>Google Pay (GPay)</strong> or <strong>PhonePe</strong> on your smartphone.</li>
                    <li>Pay <strong className="text-slate-900 font-black">₹1,000</strong> to mobile number <strong className="text-slate-900 font-black font-mono">8793224533</strong> (Amin Karmalkar).</li>
                    <li>Copy or note down the <strong>UPI Transaction ID / UTR Number</strong> from the payment receipt.</li>
                    <li>Enter the Transaction ID in the box on the right before submitting the form.</li>
                  </ol>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Includes participation pass for 3 student delegates + 1 faculty mentor</span>
              </div>
            </div>

            {/* Payment Verification Card: Screenshot Upload & Transaction ID */}
            <div className="rounded-3xl border-2 border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-50/40">
              <div className="space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Upload Payment Screenshot</h3>
                    <p className="text-xs text-slate-500 font-medium">Upload GPay / PhonePe receipt screenshot for instant verification</p>
                  </div>
                </div>

                {/* Screenshot Upload Dropzone / Button */}
                <div className="space-y-2">
                  <label className="block text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Payment Screenshot <span className="text-rose-500">*</span>
                  </label>

                  {paymentScreenshot ? (
                    <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {paymentScreenshot.startsWith('data:image') || paymentScreenshot.match(/\.(jpg|jpeg|png|webp)/i) ? (
                          <img
                            src={paymentScreenshot}
                            alt="Payment Receipt"
                            className="w-14 h-14 object-cover rounded-xl border border-emerald-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <FileText className="w-7 h-7" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-black text-emerald-950 flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Payment Screenshot Attached</span>
                          </p>
                          <a
                            href={paymentScreenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>Preview Screenshot</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentScreenshot('')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        Remove / Replace
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={isUploadingPaymentScreenshot}
                        onChange={async (e) => {
                          setIsUploadingPaymentScreenshot(true);
                          await handleFileUpload(e, (url) => {
                            setPaymentScreenshot(url);
                          }, 'documents');
                          setIsUploadingPaymentScreenshot(false);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-all">
                          <UploadCloud className={`w-6 h-6 ${isUploadingPaymentScreenshot ? 'animate-bounce' : ''}`} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            {isUploadingPaymentScreenshot ? 'Uploading Screenshot...' : 'Click or Drag to Upload Payment Screenshot'}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Supports PNG, JPG, JPEG or PDF (Max 8MB)
                          </p>
                        </div>
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-extrabold uppercase tracking-wide">
                          Upload GPay / PhonePe Receipt
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional UPI Transaction ID / UTR Number */}
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="transactionIdInput" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    UPI Transaction ID / UTR Number <span className="text-slate-400 font-semibold normal-case">(Optional if screenshot attached)</span>
                  </label>
                  <input
                    id="transactionIdInput"
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 4289XXXXXXXX or UPI Ref No."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 font-mono text-sm sm:text-base font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 shadow-sm transition-all placeholder:font-sans placeholder:text-slate-400 placeholder:text-xs"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    You can either upload the payment screenshot above or provide the Transaction ID.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                <span className="font-bold text-amber-950">Payment Verification Support:</span> If your payment is deducted but you face any issues uploading screenshot, contact Amin Karmalkar at <strong>8793224533</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* HELPDESK & SUPPORT CONTACTS BAR */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="font-black text-slate-900 text-base sm:text-lg">
              Facing Difficulties or Have Queries?
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              For event coordination or software development issues, feel free to contact us directly:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+919923479476"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200 text-xs sm:text-sm font-extrabold transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Dr. Rais Khan: +91 99234 79476</span>
            </a>
            <a
              href="tel:+919673692003"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl border border-blue-200 text-xs sm:text-sm font-extrabold transition-all"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Sameer Aagha: +91 96736 92003</span>
            </a>
            <a
              href="tel:+919975103553"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200 text-xs sm:text-sm font-extrabold transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Akhlaque Patel: +91 99751 03553</span>
            </a>
            <a
              href="tel:7588171372"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl border border-purple-200 text-xs sm:text-sm font-extrabold transition-all"
            >
              <Phone className="w-4 h-4 text-purple-600" />
              <span>Rehan Chougale: 7588171372</span>
            </a>
          </div>
        </div>

        {/* SUBMISSION ACTION CARD */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              Delegation Certification
            </p>
            <p className="text-base text-slate-500 max-w-xl leading-relaxed">
              By submitting, you certify that the School UDISE Number, designated faculty mentor, and student delegates are officially authorized by the school administration.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Boolean(alreadyRegisteredSchool)}
            className={`w-full lg:w-auto px-10 py-5 text-lg font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 shrink-0 ${alreadyRegisteredSchool
                ? 'bg-amber-500 text-white cursor-not-allowed opacity-90'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white hover:shadow-2xl cursor-pointer disabled:opacity-50'
              }`}
          >
            {isSubmitting ? (
              <span>Submitting Registration...</span>
            ) : alreadyRegisteredSchool ? (
              <>
                <AlertCircle className="w-6 h-6" />
                <span>School Already Registered</span>
              </>
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
