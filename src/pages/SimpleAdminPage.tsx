import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck, 
  Download, 
  Search, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  LogOut,
  Settings,
  ChevronDown,
  ChevronUp,
  Edit3,
  PlusCircle,
  X,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { api } from '../lib/api';
import { 
  DEFAULT_SUPER_ADMIN, 
  getAuthorizedAdmins, 
  isAuthorizedAdmin, 
  isSuperAdmin, 
  addAuthorizedAdmin, 
  removeAuthorizedAdmin 
} from '../lib/adminAuth';
import { District, MasterSchoolListItem, RegistrationStatus, FullSchoolRegistration } from '../types';
import { generateAcknowledgementPDF } from '../lib/pdfGenerator';

export const SimpleAdminPage: React.FC = () => {
  const { user, logout, loginWithEmail } = useAuth();

  const [schools, setSchools] = useState<MasterSchoolListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<'all' | District>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'pending'>('all');

  // Admin Access Control States
  const [adminList, setAdminList] = useState<string[]>(getAuthorizedAdmins());
  const [showManageAdmins, setShowManageAdmins] = useState(false);
  const [newAdminInput, setNewAdminInput] = useState('');
  const [adminFeedback, setAdminFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Manual Direct Admin verification state (fallback if Google OAuth is pending in Supabase)
  const [directEmailInput, setDirectEmailInput] = useState('');
  const [directAuthError, setDirectAuthError] = useState<string | null>(null);

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllParticipatingSchoolsWithStatus();
      setSchools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAuthorizedAdmin(user.google_email)) {
      loadSchools();
    }
  }, [user]);

  // Authorization checks
  const isAuthorized = Boolean(user && isAuthorizedAdmin(user.google_email));
  const isSuper = Boolean(user && isSuperAdmin(user.google_email));

  // Handler to add admin
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminInput.trim()) return;

    const res = addAuthorizedAdmin(newAdminInput);
    setAdminFeedback({ text: res.message, isError: !res.success });
    if (res.success) {
      setAdminList(getAuthorizedAdmins());
      setNewAdminInput('');
    }
    setTimeout(() => setAdminFeedback(null), 5000);
  };

  // Handler to remove admin
  const handleRemoveAdmin = (email: string) => {
    if (window.confirm(`Revoke admin access for ${email}?`)) {
      const res = removeAuthorizedAdmin(email);
      setAdminFeedback({ text: res.message, isError: !res.success });
      if (res.success) {
        setAdminList(getAuthorizedAdmins());
      }
      setTimeout(() => setAdminFeedback(null), 5000);
    }
  };

  // Edit & Delete Admin Controls State
  const [editingItem, setEditingItem] = useState<MasterSchoolListItem | null>(null);
  const [editUdise, setEditUdise] = useState('');
  const [editStatus, setEditStatus] = useState<RegistrationStatus>('submitted');
  const [editPrincipalName, setEditPrincipalName] = useState('');
  const [editPrincipalPhone, setEditPrincipalPhone] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMentorName, setEditMentorName] = useState('');
  const [editMentorPhone, setEditMentorPhone] = useState('');
  const [editMentorEmail, setEditMentorEmail] = useState('');
  const [editMentorDesignation, setEditMentorDesignation] = useState('');
  const [editStudents, setEditStudents] = useState<Array<{
    name: string;
    className: string;
    regNo: string;
  }>>([
    { name: '', className: '', regNo: '' },
    { name: '', className: '', regNo: '' },
    { name: '', className: '', regNo: '' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleOpenEdit = (item: MasterSchoolListItem) => {
    setEditingItem(item);
    const reg = item.registration;
    setEditUdise(reg?.school.school_code || '');
    setEditStatus(reg?.school.status || 'submitted');
    setEditPrincipalName(reg?.school.principal_name || '');
    setEditPrincipalPhone(reg?.school.contact_number || '');
    setEditContact(reg?.school.contact_number || reg?.mentor.phone || '');
    setEditEmail(reg?.school.school_email || reg?.mentor.email || '');
    setEditMentorName(reg?.mentor.full_name || '');
    setEditMentorPhone(reg?.mentor.phone || '');
    setEditMentorEmail(reg?.mentor.email || '');
    setEditMentorDesignation(reg?.mentor.designation || 'Faculty In-Charge');

    const stus = [1, 2, 3].map(num => {
      const found = reg?.students.find(s => s.student_number === num);
      return {
        name: found?.full_name || '',
        className: found?.class_name || '',
        regNo: found?.student_registration_number || found?.registration_number || '',
      };
    });
    setEditStudents(stus);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
  };

  const handleUpdateStudentField = (index: number, field: 'name' | 'className' | 'regNo', val: string) => {
    const copy = [...editStudents];
    copy[index] = { ...copy[index], [field]: val };
    setEditStudents(copy);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editMentorName.trim() || !editMentorPhone.trim()) {
      alert('Mentor Full Name and Contact Phone are required.');
      return;
    }

    try {
      setIsSaving(true);
      const isAlreadyRegistered = Boolean(editingItem.registration);

      if (isAlreadyRegistered && editingItem.registration) {
        await api.updateRegistrationByAdmin(
          editingItem.registration.school.id,
          {
            school: {
              school_code: editUdise.trim(),
              principal_name: editPrincipalName.trim(),
              contact_number: editPrincipalPhone.trim() || editContact.trim() || editMentorPhone.trim(),
              school_email: editEmail.trim(),
            },
            status: editStatus,
            mentor: {
              full_name: editMentorName.trim(),
              phone: editMentorPhone.trim(),
              email: editMentorEmail.trim(),
              designation: editMentorDesignation.trim() || 'In-Charge Faculty',
            },
            students: editStudents.map((s, idx) => ({
              student_number: idx + 1,
              full_name: s.name.trim(),
              class_name: s.className.trim(),
              student_registration_number: s.regNo.trim(),
            }))
          },
          user?.google_email || 'admin@eventportal.org'
        );
      } else {
        // Registering on behalf of school
        const regId = `GKQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const schoolData = {
          participating_school_id: editingItem.participatingSchool.id,
          school_name: editingItem.participatingSchool.school_name,
          district: editingItem.participatingSchool.district,
          school_code: editUdise.trim(),
          address: '',
          city: editingItem.participatingSchool.district,
          principal_name: editPrincipalName.trim(),
          school_email: editEmail.trim(),
          contact_number: editPrincipalPhone.trim() || editContact.trim() || editMentorPhone.trim(),
          status: editStatus,
          registration_id: regId,
          submitted_at: new Date().toISOString(),
        };

        const mentorData = {
          full_name: editMentorName.trim(),
          phone: editMentorPhone.trim(),
          email: editMentorEmail.trim(),
          designation: editMentorDesignation.trim() || 'In-Charge Faculty',
        };

        const studentsData = editStudents.map((s, idx) => ({
          student_number: idx + 1,
          full_name: s.name.trim(),
          class_name: s.className.trim(),
          student_registration_number: s.regNo.trim(),
          identity_document_type: 'school_id' as const,
        }));

        await api.saveSchoolDraft(
          user?.id || 'admin-user',
          schoolData,
          mentorData,
          studentsData
        );
      }

      setActionMessage({
        text: `Successfully saved changes for "${editingItem.participatingSchool.school_name}"!`,
        isError: false
      });
      setTimeout(() => setActionMessage(null), 5000);
      setEditingItem(null);
      await loadSchools();
    } catch (err: any) {
      alert(err.message || 'Failed to update registration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRegistration = async (item: MasterSchoolListItem) => {
    const sName = item.participatingSchool.school_name;
    const ok = window.confirm(
      `Are you sure you want to permanently delete the registration data for:\n"${sName}"?\n\nThis will remove mentor info, student delegates, uploaded documents, and reset status back to Not Registered.`
    );
    if (!ok) return;

    try {
      const targetId = item.registration?.school.id || item.participatingSchool.id;
      const success = await api.deleteRegistrationByAdmin(targetId, user?.google_email || 'admin@eventportal.org');
      if (success) {
        setActionMessage({
          text: `Registration data for "${sName}" was deleted.`,
          isError: false
        });
        setTimeout(() => setActionMessage(null), 5000);
        await loadSchools();
      } else {
        alert('Could not find registration to delete.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete registration.');
    }
  };

  // Direct Admin Email Verification Handler
  const handleDirectAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectAuthError(null);
    const clean = directEmailInput.trim().toLowerCase();

    if (!clean) {
      setDirectAuthError('Please enter an admin email address.');
      return;
    }

    if (isAuthorizedAdmin(clean)) {
      loginWithEmail(clean, isSuperAdmin(clean) ? 'superadmin' : 'admin');
    } else {
      setDirectAuthError(
        `Access Denied: "${clean}" is not an authorized administrator. Only ${DEFAULT_SUPER_ADMIN} or emails added by the Super Admin have access.`
      );
    }
  };

  // Filter schools
  const filtered = schools.filter((item) => {
    const dist = item.participatingSchool.district;
    if (selectedDistrict !== 'all' && dist !== selectedDistrict) return false;

    if (statusFilter === 'submitted' && !item.registration) return false;
    if (statusFilter === 'pending' && item.registration) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sName = item.participatingSchool.school_name.toLowerCase();
      const mName = item.registration?.mentor.full_name?.toLowerCase() || '';
      const stuMatch = item.registration?.students.some(s => 
        s.full_name?.toLowerCase().includes(q) ||
        s.student_registration_number?.toLowerCase().includes(q)
      );
      const regId = item.registration?.school.registration_id?.toLowerCase() || '';

      return sName.includes(q) || mName.includes(q) || stuMatch || regId.includes(q);
    }

    return true;
  });

  // Direct download helper
  const handleDownload = (fileUrl: string, fileName: string) => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'District',
      'School Name',
      'School UDISE Number',
      'Registration ID',
      'Mentor Name',
      'Mentor Phone',
      'Mentor Email',
      'Mentor Designation',
      'Student 1 Name (Mandatory)',
      'Student 1 Reg No',
      'Student 1 Class',
      'Student 2 Name (Mandatory)',
      'Student 2 Reg No',
      'Student 2 Class',
      'Student 3 Name',
      'Student 3 Reg No',
      'Student 3 Class',
      'Status'
    ];

    const rows = filtered.map(item => [
      `"${item.participatingSchool.district}"`,
      `"${item.participatingSchool.school_name}"`,
      `"${item.registration?.school.school_code || 'N/A'}"`,
      `"${item.registration?.school.registration_id || 'N/A'}"`,
      `"${item.registration?.mentor.full_name || 'N/A'}"`,
      `"${item.registration?.mentor.phone || 'N/A'}"`,
      `"${item.registration?.mentor.email || 'N/A'}"`,
      `"${item.registration?.mentor.designation || 'N/A'}"`,
      `"${item.registration?.students[0]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[0]?.student_registration_number || 'N/A'}"`,
      `"${item.registration?.students[0]?.class_name || 'N/A'}"`,
      `"${item.registration?.students[1]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[1]?.student_registration_number || 'N/A'}"`,
      `"${item.registration?.students[1]?.class_name || 'N/A'}"`,
      `"${item.registration?.students[2]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[2]?.student_registration_number || 'N/A'}"`,
      `"${item.registration?.students[2]?.class_name || 'N/A'}"`,
      `"${item.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GK_Quiz_Contest_2026_Registrations_${selectedDistrict}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download single school registration form PDF
  const handleDownloadSchoolPDF = (reg: FullSchoolRegistration) => {
    generateAcknowledgementPDF(reg);
  };

  // Download all submitted registrations' PDFs (batch download)
  const handleDownloadAllPDFs = () => {
    const submittedSchools = schools.filter(s => s.registration);
    if (submittedSchools.length === 0) {
      alert('No submitted registrations found to download.');
      return;
    }
    submittedSchools.forEach((s, idx) => {
      setTimeout(() => {
        if (s.registration) {
          generateAcknowledgementPDF(s.registration);
        }
      }, idx * 400);
    });
  };

  // 1. GATE 1: NOT LOGGED IN
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-8 sm:p-12 text-center space-y-7">
          <div className="flex items-center justify-center gap-5">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img src="/logo.png" alt="Team Tameer Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img src="/logo2.jpeg" alt="Event Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-xl" />
            </div>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border-2 border-amber-200 shadow-inner">
            <Shield className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-3.5 py-1 rounded-full border border-slate-200">
              Restricted Console
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Admin Portal Access
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              This section is strictly restricted to designated administrators.
              <br />
              <strong className="text-slate-900 font-bold">Primary Super Admin:</strong>{' '}
              <span className="text-blue-600 font-mono font-bold">{DEFAULT_SUPER_ADMIN}</span>
            </p>
          </div>

          {/* Google Sign In Button */}
          <div className="pt-2">
            <GoogleSignInButton 
              buttonText="Sign in with Google as Admin"
              redirectTo="/admin"
              className="w-full justify-center"
            />
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-bold">Or verify authorized email</span>
            </div>
          </div>

          {/* Direct Email Verification Form */}
          <form onSubmit={handleDirectAdminVerify} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Authorized Admin Email
              </label>
              <input 
                type="email"
                value={directEmailInput}
                onChange={(e) => setDirectEmailInput(e.target.value)}
                placeholder="e.g. argaikwad24@gmail.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-slate-50/50"
              />
            </div>

            {directAuthError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{directAuthError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black transition-all shadow-md cursor-pointer"
            >
              Verify & Enter Admin Console
            </button>
          </form>

          <div className="pt-2">
            <Link to="/" className="text-xs font-bold text-slate-500 hover:text-blue-600">
              ← Return to Public Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. GATE 2: LOGGED IN BUT NOT AUTHORIZED
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border-2 border-rose-200">
            <ShieldAlert className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-3.5 py-1 rounded-full border border-rose-200">
              Access Denied
            </span>
            <h1 className="text-3xl font-black text-slate-900">
              Unauthorized Account
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              You are signed in as: <strong className="text-slate-900 font-bold">{user.google_email}</strong>.
              <br />
              This account does not have administrator privileges for State-Level GK Quiz Contest 2026.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left space-y-1">
            <p className="font-bold text-slate-800">Need Admin Access?</p>
            <p>
              Please sign in with the primary administrator account (<strong className="text-slate-900">{DEFAULT_SUPER_ADMIN}</strong>) or ask them to add your email ({user.google_email}) to the authorized administrators list.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => logout()}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account / Sign Out</span>
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold text-center"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. FULL AUTHORIZED ADMIN PANEL
  const totalCount = schools.length;
  const submittedCount = schools.filter(s => s.registration).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-9 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
            <img src="/logo.png" alt="Team Tameer Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
            <img src="/logo2.jpeg" alt="Event Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-xl" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                State-Level GK Quiz Contest 2026 Admin Panel
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                isSuper 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-purple-100 text-purple-800 border-purple-200'
              }`}>
                {isSuper ? '★ Super Admin Console' : 'Admin Console'}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Logged in as: <strong className="text-slate-900 font-bold">{user.google_email}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Super Admin Control Button */}
          {isSuper && (
            <button
              type="button"
              onClick={() => setShowManageAdmins(!showManageAdmins)}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Admin Access ({adminList.length})</span>
              {showManageAdmins ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={loadSchools}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export to CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAllPDFs}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-98"
            title="Download complete registration forms & passes for all submitted schools"
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>Download All Forms (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-3 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SUPER ADMIN ACCESS CONTROL CARD (Only visible to argaikwad24@gmail.com) */}
      {isSuper && showManageAdmins && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-9 shadow-2xl border-2 border-indigo-700/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Administrator Access Control
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  As the Super Admin (<strong className="text-amber-300">{DEFAULT_SUPER_ADMIN}</strong>), you can authorize or revoke other admin accounts.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowManageAdmins(false)}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer self-start sm:self-center"
            >
              Close Panel
            </button>
          </div>

          {/* Add Admin Form */}
          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={newAdminInput}
              onChange={(e) => setNewAdminInput(e.target.value)}
              placeholder="Enter new administrator email address (e.g. colleague@school.edu)"
              className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-white/20 bg-white/10 text-white placeholder:text-slate-400 text-sm font-semibold focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Authorize Admin</span>
            </button>
          </form>

          {/* Feedback Message */}
          {adminFeedback && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              adminFeedback.isError 
                ? 'bg-rose-500/20 border border-rose-400 text-rose-200' 
                : 'bg-emerald-500/20 border border-emerald-400 text-emerald-200'
            }`}>
              <span>{adminFeedback.text}</span>
            </div>
          )}

          {/* Authorized Admins List */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Currently Authorized Administrators ({adminList.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {adminList.map((email) => {
                const isSuperRecord = email.toLowerCase() === DEFAULT_SUPER_ADMIN.toLowerCase();
                return (
                  <div
                    key={email}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSuperRecord ? 'bg-amber-400 text-slate-950' : 'bg-white/15 text-white'
                      }`}>
                        {isSuperRecord ? '★' : '✓'}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-black text-white truncate">{email}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {isSuperRecord ? 'Primary Super Administrator (Owner)' : 'Authorized Administrator'}
                        </p>
                      </div>
                    </div>

                    {!isSuperRecord && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(email)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-rose-400/30"
                        title="Revoke admin access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border-2 shadow-sm ${
          actionMessage.isError
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-3">
            {actionMessage.isError ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <p className="font-extrabold text-sm sm:text-base">{actionMessage.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* District Filter Cards (Large Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => setSelectedDistrict('all')}
          className={`p-5 sm:p-7 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            selectedDistrict === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm font-bold">
            <span>All Districts</span>
            <Building2 className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">36</p>
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">{submittedCount} submitted</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDistrict('Kolhapur')}
          className={`p-5 sm:p-7 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            selectedDistrict === 'Kolhapur'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-[1.02]'
              : 'bg-white hover:bg-blue-50/50 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Kolhapur</span>
            <MapPin className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">16</p>
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">Schools roster</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDistrict('Sangli')}
          className={`p-5 sm:p-7 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            selectedDistrict === 'Sangli'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl scale-[1.02]'
              : 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Sangli</span>
            <MapPin className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">12</p>
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">Schools roster</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDistrict('Satara')}
          className={`p-5 sm:p-7 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            selectedDistrict === 'Satara'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xl scale-[1.02]'
              : 'bg-white hover:bg-purple-50/50 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="flex items-center gap-1.5">
              Satara
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded">New</span>
            </span>
            <MapPin className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">8</p>
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">Includes Wai & Mahabaleshwar</p>
        </button>
      </div>

      {/* Search and Filter Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school name, mentor, student name, or registration ID..."
            className="w-full pl-12 pr-5 py-3.5 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-auto border-2 border-slate-200 rounded-2xl text-sm sm:text-base py-3.5 px-5 bg-white font-bold text-slate-700 focus:outline-none focus:border-blue-600 transition-all cursor-pointer"
          >
            <option value="all">All Schools ({filtered.length})</option>
            <option value="submitted">Submitted Applications Only</option>
            <option value="pending">Pending Registrations</option>
          </select>
        </div>
      </div>

      {/* Registrations List (Large Cards) */}
      <div className="space-y-6">
        {filtered.map((item) => {
          const hasReg = Boolean(item.registration);
          const school = item.registration?.school;
          const mentor = item.registration?.mentor;
          const studentsList = item.registration?.students || [];

          return (
            <div
              key={item.participatingSchool.id}
              className={`bg-white rounded-3xl border-2 p-6 sm:p-9 shadow-sm transition-all ${
                hasReg ? 'border-slate-200 hover:border-blue-300 hover:shadow-md' : 'border-slate-200/70 bg-slate-50/60 opacity-80'
              }`}
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b-2 border-slate-100">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                    item.participatingSchool.district === 'Kolhapur'
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                      : item.participatingSchool.district === 'Sangli'
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                      : 'bg-purple-50 text-purple-700 border-2 border-purple-200'
                  }`}>
                    {item.participatingSchool.district} District
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                    {item.participatingSchool.school_name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {school?.school_code && (
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl shadow-2xs">
                      UDISE: {school.school_code}
                    </span>
                  )}
                  {school?.registration_id ? (
                    <span className="font-mono text-sm sm:text-base font-black text-blue-700 bg-blue-50 border-2 border-blue-200 px-4 py-1.5 rounded-xl shadow-2xs">
                      ID: {school.registration_id}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 font-semibold italic bg-slate-100 px-3.5 py-1.5 rounded-xl">
                      Not Yet Registered
                    </span>
                  )}

                  {/* ADMIN ACTION BUTTONS: DOWNLOAD PDF, EDIT & DELETE */}
                  <div className="flex flex-wrap items-center gap-2 pl-2 sm:border-l-2 sm:border-slate-200">
                    {hasReg && item.registration && (
                      <button
                        type="button"
                        onClick={() => generateAcknowledgementPDF(item.registration!)}
                        title="Download Complete Registration Form (PDF)"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-2 border-emerald-200 hover:border-emerald-600 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      title={hasReg ? "Edit Registration Form Data" : "Register / Fill Form Data"}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border-2 border-blue-200 hover:border-blue-600 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-2xs"
                    >
                      {hasReg ? <Edit3 className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                      <span>{hasReg ? 'Edit Data' : '+ Fill Form'}</span>
                    </button>

                    {hasReg && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRegistration(item)}
                        title="Delete Registration Data"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-2 border-rose-200 hover:border-rose-600 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {hasReg && school && mentor ? (
                /* Submitted Details */
                <div className="mt-6 space-y-6">
                  {/* Faculty Mentor Information & Document Downloads */}
                  <div className="p-5 sm:p-7 bg-slate-50/90 rounded-2xl border-2 border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-emerald-600" />
                        <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                          Faculty Mentor In-Charge
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm bg-white border border-slate-200 px-3 py-1 rounded-lg font-bold text-slate-700 shadow-2xs">
                        {mentor.designation || 'In-Charge Faculty'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div>
                        <p className="font-black text-slate-900 text-base sm:text-xl">{mentor.full_name}</p>
                        <div className="text-slate-600 text-sm sm:text-base font-semibold flex flex-wrap items-center gap-4 mt-1.5">
                          <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {mentor.phone}</span>
                          {mentor.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {mentor.email}</span>}
                        </div>
                      </div>

                      {/* Mentor Documents Download Buttons */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {mentor.photo_path ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(mentor.photo_path!, `${mentor.full_name}_Photo.jpg`)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 text-blue-700 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-2xs cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Mentor Photo</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No Photo</span>
                        )}

                        {mentor.id_document_path ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(mentor.id_document_path!, `${mentor.full_name}_IDProof.pdf`)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-300 text-emerald-700 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-2xs cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Mentor ID Document</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No ID Proof</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Student Delegates with Document Download Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Registered Student Delegates (3 Students) & Uploaded Documents</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {studentsList.slice(0, 3).map((stu, sIdx) => {
                        return (
                          <div
                            key={stu.id || sIdx}
                            className="p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-3.5 shadow-sm hover:border-purple-300 transition-all"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="font-black text-xs text-slate-600 uppercase tracking-wide">
                                Student #{sIdx + 1}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800">
                                {stu.class_name || 'Delegate'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {stu.photo_path ? (
                                <img
                                  src={stu.photo_path}
                                  alt={stu.full_name}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-slate-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-sm bg-purple-50 text-purple-700 border-purple-100">
                                  #{sIdx + 1}
                                </div>
                              )}
                              <div>
                                <p className="font-extrabold text-sm sm:text-base leading-snug text-slate-900">
                                  {stu.full_name || 'Student Name'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                  {stu.student_registration_number && (
                                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                      Reg: {stu.student_registration_number}
                                    </span>
                                  )}
                                  {stu.class_name && (
                                    <p className="text-xs text-slate-500 font-semibold">{stu.class_name}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Student Document Downloads */}
                            <div className="pt-2 border-t-2 border-slate-100 flex flex-col gap-2">
                              {stu.photo_path && (
                                <button
                                  type="button"
                                  onClick={() => handleDownload(stu.photo_path!, `${stu.full_name}_Photo.jpg`)}
                                  className="w-full text-left inline-flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold transition-colors border border-slate-200/80 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Download Photo</span>
                                  </span>
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {stu.school_id_document_path && (
                                <button
                                  type="button"
                                  onClick={() => handleDownload(stu.school_id_document_path!, `${stu.full_name}_SchoolID.pdf`)}
                                  className="w-full text-left inline-flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold transition-colors border border-slate-200/80 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Download School ID</span>
                                  </span>
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {!stu.photo_path && !stu.school_id_document_path && (
                                <span className="text-xs text-slate-400 italic font-medium py-1">
                                  No files uploaded
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COMPLETE REGISTRATION FORM & DELEGATE PASS PDF BAR */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border-2 border-emerald-200 shadow-2xs">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-white text-emerald-700 rounded-xl border border-emerald-200 shadow-2xs">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-black text-slate-900">
                          Complete Official Registration Form & Delegate Pass (PDF)
                        </p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          Official A4 PDF with institution details, faculty mentor credentials, and 4 student delegates with registration numbers.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => generateAcknowledgementPDF(item.registration!)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Complete PDF Form</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Not registered placeholder */
                <div className="mt-4 py-6 text-center bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-sm text-slate-500 font-semibold italic">
                    This school has not submitted their registration yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Fill Registration Form for this School</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* EDIT / FILL REGISTRATION MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-4xl w-full p-6 sm:p-9 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-100">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {editingItem.participatingSchool.district} District
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {editingItem.registration ? 'Edit Registration Form' : 'Register Institution (Admin Form)'}
                </h3>
                <p className="text-sm text-slate-500 font-semibold mt-0.5">
                  {editingItem.participatingSchool.school_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {editingItem.registration && (
                  <button
                    type="button"
                    onClick={() => generateAcknowledgementPDF(editingItem.registration!)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* SECTION 1: INSTITUTION & REGISTRATION DETAILS */}
              <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border-2 border-slate-200/80 space-y-4">
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>1. Institutional & Status Details</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      School UDISE Number
                    </label>
                    <input
                      type="text"
                      value={editUdise}
                      onChange={(e) => setEditUdise(e.target.value)}
                      placeholder="e.g. 27280100101"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Registration Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as RegistrationStatus)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-blue-600 bg-white"
                    >
                      <option value="submitted">Submitted (Active)</option>
                      <option value="approved">Approved</option>
                      <option value="pending_verification">Pending Verification</option>
                      <option value="correction_required">Correction Required</option>
                      <option value="rejected">Rejected</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Principal Full Name
                    </label>
                    <input
                      type="text"
                      value={editPrincipalName}
                      onChange={(e) => setEditPrincipalName(e.target.value)}
                      placeholder="e.g. Dr. / Mr. Principal Name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Principal Mobile Number
                    </label>
                    <input
                      type="text"
                      value={editPrincipalPhone}
                      onChange={(e) => setEditPrincipalPhone(e.target.value)}
                      placeholder="e.g. +91 98220 12345"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Official Contact Phone
                    </label>
                    <input
                      type="text"
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                      placeholder="e.g. +91 98220 12345"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. school@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: FACULTY MENTOR */}
              <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border-2 border-slate-200/80 space-y-4">
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Faculty Mentor In-Charge</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Mentor Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editMentorName}
                      onChange={(e) => setEditMentorName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={editMentorDesignation}
                      onChange={(e) => setEditMentorDesignation(e.target.value)}
                      placeholder="e.g. Teacher / Coordinator"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editMentorPhone}
                      onChange={(e) => setEditMentorPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editMentorEmail}
                      onChange={(e) => setEditMentorEmail(e.target.value)}
                      placeholder="Email (Optional)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: 3 STUDENT DELEGATES */}
              <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border-2 border-slate-200/80 space-y-4">
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>3. Student Delegates (3 Students)</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {editStudents.map((stu, idx) => {
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border-2 space-y-3 bg-white border-slate-200"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                              #{idx + 1}
                            </span>
                            <span>Student Delegate #{idx + 1}</span>
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            Mandatory
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={stu.name}
                            onChange={(e) => handleUpdateStudentField(idx, 'name', e.target.value)}
                            required
                            placeholder={`Student ${idx + 1} Name`}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                              Class <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={stu.className}
                              onChange={(e) => handleUpdateStudentField(idx, 'className', e.target.value)}
                              required
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600 bg-white"
                            >
                              <option value="">-- Class --</option>
                              <option value="8th">8th Standard</option>
                              <option value="9th">9th Standard</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                              Student Reg No.
                            </label>
                            <input
                              type="text"
                              value={stu.regNo}
                              onChange={(e) => handleUpdateStudentField(idx, 'regNo', e.target.value)}
                              placeholder="e.g. REG-01"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-extrabold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Registration Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
