import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  Users, 
  ClipboardCheck, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles, 
  Clock, 
  Check,
  School as SchoolIcon,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { School, Mentor, Student, FullSchoolRegistration, District } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileUploader } from '../components/ui/FileUploader';
import { SchoolSelectionStep } from '../components/wizard/SchoolSelectionStep';
import { StudentForm } from '../components/wizard/StudentForm';
import { DocumentPreviewModal } from '../components/ui/DocumentPreviewModal';
import { generateAcknowledgementPDF } from '../lib/pdfGenerator';

export const RegistrationWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRegistration, setSubmittedRegistration] = useState<FullSchoolRegistration | null>(null);

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; type: string } | null>(null);

  // Form State
  const [school, setSchool] = useState<Partial<School>>({
    participating_school_id: '',
    school_name: '',
    district: undefined,
    school_code: '',
    address: '',
    city: '',
    principal_name: '',
    school_email: '',
    contact_number: '',
    logo_path: '',
  });

  const [mentor, setMentor] = useState<Partial<Mentor>>({
    full_name: '',
    phone: '',
    email: '',
    designation: '',
    photo_path: '',
    id_document_path: '',
  });

  const [students, setStudents] = useState<Partial<Student>[]>([
    { student_number: 1, full_name: '', class_name: '', student_registration_number: '', photo_path: '', school_id_document_path: '', identity_document_type: 'school_id' },
    { student_number: 2, full_name: '', class_name: '', student_registration_number: '', photo_path: '', school_id_document_path: '', identity_document_type: 'school_id' },
    { student_number: 3, full_name: '', class_name: '', student_registration_number: '', photo_path: '', school_id_document_path: '', identity_document_type: 'school_id' },
    { student_number: 4, full_name: '', class_name: '', student_registration_number: '', photo_path: '', school_id_document_path: '', identity_document_type: 'school_id' },
  ]);

  // Step 4 Mandatory Declarations
  const [declAuthorized, setDeclAuthorized] = useState(false);
  const [declAccuracy, setDeclAccuracy] = useState(false);
  const [declParentConsent, setDeclParentConsent] = useState(false);
  const [declPrivacyNotice, setDeclPrivacyNotice] = useState(false);
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null);

  const handleAutoFillSampleData = () => {
    setSchool({
      participating_school_id: 'ps-kol-06',
      school_name: 'Urdu Anglo High School Shiroli',
      district: 'Kolhapur',
      school_code: '27340800301',
      address: 'National Highway 4, Shiroli MIDC',
      city: 'Shiroli, Kolhapur',
      principal_name: 'Dr. Tanveer Ahmed Ansari',
      school_email: 'principal.shiroli@urdueducation.org',
      contact_number: '+91 230 246 8899',
      logo_path: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
      is_representative_verified: true,
      status: 'draft',
    });

    setMentor({
      full_name: 'Prof. Farida Begum',
      phone: '+91 98230 11224',
      email: 'farida.begum@shiroli.edu',
      designation: 'Head of Science Department',
      photo_path: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      id_document_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    });

    setStudents([
      {
        student_number: 1,
        full_name: 'Mohammad Rehan Shaikh',
        class_name: 'Class 10-A',
        photo_path: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
      },
      {
        student_number: 2,
        full_name: 'Zoya Fatima Pathan',
        class_name: 'Class 10-B',
        photo_path: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
      },
      {
        student_number: 3,
        full_name: 'Amanullah Mujawar',
        class_name: 'Class 9-A',
        photo_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
      },
      {
        student_number: 4,
        full_name: 'Mariyam Inamdar',
        class_name: 'Class 9-B',
        photo_path: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
      },
    ]);

    setDeclAuthorized(true);
    setDeclAccuracy(true);
    setDeclParentConsent(true);
    setDeclPrivacyNotice(true);

    setAutoFillNotice('✨ All 4 steps populated with complete sample team data! You can navigate steps or submit right away.');
    setTimeout(() => setAutoFillNotice(null), 8000);
  };

  // Load existing draft or registration
  useEffect(() => {
    const loadDraft = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const existing = await api.getSchoolForUser(user.id);
        if (existing) {
          // If already submitted and not correction_required, redirect to dashboard
          if (existing.school.status !== 'draft' && existing.school.status !== 'correction_required') {
            navigate('/dashboard');
            return;
          }

          setSchool(existing.school);
          setMentor(existing.mentor);
          if (existing.students && existing.students.length === 4) {
            setStudents(existing.students);
          }
          setLastSavedTime(new Date(existing.school.updated_at).toLocaleTimeString());
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [user, navigate]);

  // Autosave handler
  const handleSaveDraft = async (silent = false) => {
    if (!user || !school.participating_school_id) return;
    try {
      if (!silent) setIsSaving(true);
      const saved = await api.saveSchoolDraft(user.id, school, mentor, students);
      setSchool(saved.school);
      setMentor(saved.mentor);
      setStudents(saved.students);
      const now = new Date().toLocaleTimeString();
      setLastSavedTime(now);
    } catch (err: any) {
      if (!silent) alert('Draft autosave failed: ' + err.message);
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  // Step 1 Validation (Must have selected master school, district, and basic principal info)
  const isStep1Valid = Boolean(
    school.participating_school_id &&
    school.school_name &&
    school.district &&
    school.principal_name?.trim() &&
    school.school_email?.trim() &&
    school.contact_number?.trim() &&
    school.address?.trim()
  );

  // Step 2 Validation (Mentor)
  const isStep2Valid = Boolean(
    mentor.full_name &&
    mentor.phone &&
    mentor.photo_path &&
    mentor.id_document_path
  );

  // Step 3 Validation (All 4 students must have name, class, photo, and school id)
  const isStudentComplete = (stu: Partial<Student>) => Boolean(
    stu.full_name && stu.class_name && stu.photo_path && stu.school_id_document_path
  );
  const completedStudentsCount = students.filter(isStudentComplete).length;
  const isStep3Valid = completedStudentsCount === 4;

  // Step 4 Validation
  const canSubmit = isStep1Valid && isStep2Valid && isStep3Valid && 
    declAuthorized && declAccuracy && declParentConsent && declPrivacyNotice;

  const handleStudentUpdate = (index: number, updated: Partial<Student>) => {
    const updatedList = [...students];
    updatedList[index] = updated;
    setStudents(updatedList);
  };

  const handleFinalSubmit = async () => {
    if (!canSubmit) {
      setSubmitError('Please complete all steps and agree to all legal declarations.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Save latest state first
      const saved = await api.saveSchoolDraft(user?.id || 'guest', school, mentor, students);
      
      // Submit registration
      const result = await api.submitRegistration(saved.school.id, user?.google_email || 'school@portal.org');
      setSubmittedRegistration(result);

      // Trigger Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-600">Loading school registration session...</p>
      </div>
    );
  }

  // Success Screen
  if (submittedRegistration) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Registration Successfully Submitted
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Application Under Review
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto mt-2">
              Thank you for registering <strong>{submittedRegistration.school.school_name}</strong> ({submittedRegistration.school.district} District) for the Interschool Educational Excellence Championship 2026.
            </p>
          </div>

          {/* Registration ID Banner */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl inline-block max-w-md w-full mx-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Your Official Registration ID
            </p>
            <p className="text-3xl font-mono font-black text-blue-600 tracking-wider">
              {submittedRegistration.school.registration_id}
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Please quote this ID in all official communication with the secretariat.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              variant="primary"
              leftIcon={<Download className="w-5 h-5" />}
              onClick={() => generateAcknowledgementPDF(submittedRegistration)}
            >
              Download Official Acknowledgement PDF
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              Go to School Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, title: 'District & School', icon: Building2, isValid: isStep1Valid },
    { num: 2, title: 'Mentor Faculty', icon: UserCheck, isValid: isStep2Valid },
    { num: 3, title: '4 Student Delegates', icon: Users, isValid: isStep3Valid },
    { num: 4, title: 'Review & Submit', icon: ClipboardCheck, isValid: canSubmit },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Wizard Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                School Team Registration
              </h1>
              {school.status === 'correction_required' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-800 border border-orange-200">
                  Correction Mode
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Official Participating School Selection • 1 School, 1 Mentor, exactly 4 Students
            </p>
          </div>

          {/* Action Buttons: 1-Click Auto Fill & Autosave / Draft */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {lastSavedTime && (
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Draft saved {lastSavedTime}
              </span>
            )}
            <button
              type="button"
              onClick={handleAutoFillSampleData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
              title="Populates all 4 steps with sample school, mentor, and 4 student delegates in 1 click"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>⚡ 1-Click Auto-Fill (Test Mode)</span>
            </button>
            <Button
              size="sm"
              variant="secondary"
              isLoading={isSaving}
              disabled={!school.participating_school_id}
              leftIcon={<Save className="w-4 h-4 text-slate-500" />}
              onClick={() => handleSaveDraft(false)}
            >
              Save Draft
            </Button>
          </div>
        </div>

        {/* Auto Fill Notification Toast Banner */}
        {autoFillNotice && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{autoFillNotice}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setAutoFillNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5 rounded text-[11px]"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* Correction Remarks Banner if applicable */}
        {school.status === 'correction_required' && school.correction_remarks && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-xs text-orange-950">
              <span className="font-bold">Administrator Correction Request: </span>
              {school.correction_remarks}
            </div>
          </div>
        )}

        {/* Step Progress Bar */}
        <div className="mt-8 border-y border-slate-200/80 py-4 bg-white rounded-xl shadow-2xs px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-3 text-left transition-all cursor-pointer ${
                    isActive ? 'opacity-100' : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : isPast || s.isValid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPast || s.isValid ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Step 0{s.num}
                    </p>
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                      {s.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wizard Content Panels */}
      <div className="space-y-6">
        {/* ================= STEP 1: PREDEFINED SCHOOL SELECTION ================= */}
        {currentStep === 1 && (
          <SchoolSelectionStep
            school={school}
            currentUserId={user?.id || 'guest'}
            onSelectSchool={(updates) => setSchool((prev) => ({ ...prev, ...updates }))}
            onProceed={() => {
              handleSaveDraft(true);
              setCurrentStep(2);
            }}
          />
        )}

        {/* ================= STEP 2: MENTOR INFORMATION ================= */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Step 2: Designated Faculty Mentor (Exactly 1)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Representing <strong>{school.school_name}</strong> ({school.district} District). Every school must register one official teacher to accompany the 4 students.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Input
                  label="Mentor Full Name"
                  placeholder="e.g. Prof. Abdul Rauf Khan"
                  required
                  value={mentor.full_name || ''}
                  onChange={(e) => setMentor({ ...mentor, full_name: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Mobile Contact Number"
                  placeholder="e.g. +91 98221 44556"
                  required
                  value={mentor.phone || ''}
                  onChange={(e) => setMentor({ ...mentor, phone: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Official Email Address"
                  type="email"
                  placeholder="e.g. abdul.khan@school.edu"
                  value={mentor.email || ''}
                  onChange={(e) => setMentor({ ...mentor, email: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Faculty Designation / Subject"
                  placeholder="e.g. Senior Lecturer in Physics"
                  value={mentor.designation || ''}
                  onChange={(e) => setMentor({ ...mentor, designation: e.target.value })}
                />
              </div>

              {/* Mentor Uploads */}
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 sm:col-span-1">
                <FileUploader
                  label="Mentor Passport Photograph"
                  helperText="Clear passport photograph (facing camera)"
                  required
                  type="photos"
                  value={mentor.photo_path}
                  onChange={(path, previewUrl) => setMentor({ ...mentor, photo_path: previewUrl || path })}
                  onPreview={() => mentor.photo_path && setPreviewDoc({
                    title: `Mentor Photo: ${mentor.full_name || 'Mentor'}`,
                    url: mentor.photo_path,
                    type: 'Mentor Photo'
                  })}
                />
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 sm:col-span-1">
                <FileUploader
                  label="Mentor Faculty ID Card / Authorization Letter"
                  helperText="School faculty ID or letter on school letterhead"
                  required
                  type="documents"
                  value={mentor.id_document_path}
                  onChange={(path, previewUrl) => setMentor({ ...mentor, id_document_path: previewUrl || path })}
                  onPreview={() => mentor.id_document_path && setPreviewDoc({
                    title: `Mentor Faculty ID: ${mentor.full_name || 'Mentor'}`,
                    url: mentor.id_document_path,
                    type: 'Mentor ID Card'
                  })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                size="md"
                variant="secondary"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(1)}
              >
                Back to School Selection
              </Button>

              <Button
                size="md"
                variant="primary"
                disabled={!isStep2Valid}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  handleSaveDraft(true);
                  setCurrentStep(3);
                }}
              >
                Proceed to 4 Student Delegates
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: 4 STUDENTS INFORMATION ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Step 3: Student Delegates (Exactly 4 Required)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Representing <strong>{school.school_name}</strong>. Each school delegation must consist of exactly 4 students.
                  </p>
                </div>

                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-center self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    Completed Profiles
                  </span>
                  <span className="text-lg font-black text-blue-900">
                    {completedStudentsCount} / 4 Students
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Student Cards Grid */}
            <div className="space-y-4">
              {[0, 1, 2, 3].map((idx) => (
                <StudentForm
                  key={idx}
                  studentNumber={idx + 1}
                  student={students[idx]}
                  onChange={(updated) => handleStudentUpdate(idx, updated)}
                />
              ))}
            </div>

            {/* Step 3 Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
              <Button
                size="md"
                variant="secondary"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(2)}
              >
                Back to Mentor Details
              </Button>

              <Button
                size="md"
                variant="primary"
                disabled={!isStep3Valid}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  handleSaveDraft(true);
                  setCurrentStep(4);
                }}
              >
                Review & Submit ({completedStudentsCount}/4 Ready)
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & SUBMIT ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Step 4: Application Review & Final Submission
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please verify all institution, mentor, and student records carefully before final submission.
              </p>
            </div>

            {/* Review Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selected School Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Selected Institution
                  </h4>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Change School
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                    <SchoolIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{school.school_name}</h5>
                    <p className="text-xs text-slate-600 font-medium">District: <strong className="text-blue-700">{school.district}</strong></p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {school.address}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Principal: {school.principal_name} • {school.contact_number}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mentor Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Designated Mentor
                  </h4>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  {mentor.photo_path ? (
                    <img src={mentor.photo_path} alt="Mentor" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <UserCheck className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{mentor.full_name}</h5>
                    <p className="text-xs text-slate-600">{mentor.designation || 'Faculty Mentor'}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Phone: {mentor.phone} • {mentor.email || 'Email on file'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Students Summary Grid */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered Student Delegation (4 / 4 Complete)
                </h4>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Edit Students
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {students.map((stu, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                    <img
                      src={stu.photo_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={stu.full_name}
                      className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-white shadow-2xs"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate">{stu.full_name}</p>
                      <p className="text-[11px] text-slate-500">{stu.class_name}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        ID Cards Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Legal Declarations & Consent */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Mandatory Authorization & Privacy Declarations:
              </h4>

              <label className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={declAuthorized}
                  onChange={(e) => setDeclAuthorized(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-normal">
                  I certify that I am the Principal or officially authorized representative of <strong>{school.school_name}</strong> to submit this registration.
                </span>
              </label>

              <label className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={declAccuracy}
                  onChange={(e) => setDeclAccuracy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-normal">
                  All submitted information, student enrollments, and faculty credentials are true, accurate, and verifiable.
                </span>
              </label>

              <label className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={declParentConsent}
                  onChange={(e) => setDeclParentConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-normal">
                  Lawful parental / legal guardian written consent has been secured for all 4 student participants, acknowledging event participation and document accreditation.
                </span>
              </label>

              <label className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={declPrivacyNotice}
                  onChange={(e) => setDeclPrivacyNotice(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-normal">
                  The institution understands that raw unmasked Aadhaar documents are prohibited, and agrees to the event's encrypted child privacy and document retention policy.
                </span>
              </label>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submission Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <Button
                size="md"
                variant="secondary"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(3)}
              >
                Back to Student Details
              </Button>

              <Button
                size="lg"
                variant="primary"
                disabled={!canSubmit}
                isLoading={isSubmitting}
                leftIcon={<Sparkles className="w-5 h-5 text-amber-300" />}
                onClick={handleFinalSubmit}
              >
                Submit Official Registration
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Global Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          documentUrl={previewDoc.url}
          documentType={previewDoc.type}
        />
      )}
    </div>
  );
};
