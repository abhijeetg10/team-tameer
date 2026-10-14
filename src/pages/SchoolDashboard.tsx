import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  Users, 
  FileCheck, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Eye, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  School as SchoolIcon,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { FullSchoolRegistration } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DocumentPreviewModal } from '../components/ui/DocumentPreviewModal';
import { generateAcknowledgementPDF } from '../lib/pdfGenerator';

export const SchoolDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState<FullSchoolRegistration | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; type: string } | null>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getSchoolForUser(user.id);
        setRegistration(data);
      } catch (err) {
        console.error('Failed to load school dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchool();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-600">Loading school dashboard...</p>
      </div>
    );
  }

  // If no school registered yet, prompt to select from master list
  if (!registration) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
          <SchoolIcon className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Select Your School to Register</h2>
          <p className="text-slate-600 text-sm">
            Signed in as <strong>{user?.full_name}</strong> ({user?.google_email}). Choose your district (Kolhapur, Sangli, or Satara) and select your accredited institution to proceed.
          </p>
        </div>
        <Link to="/register">
          <Button size="lg" variant="primary" rightIcon={<ChevronRight className="w-5 h-5" />}>
            Select District & School
          </Button>
        </Link>
      </div>
    );
  }

  const { school, mentor, students } = registration;
  const completedStudentsCount = students.filter(s => s.full_name && s.class_name && s.photo_path && s.school_id_document_path).length;
  const isMentorComplete = Boolean(mentor.full_name && mentor.phone && mentor.photo_path && mentor.id_document_path);

  const canEdit = school.status === 'draft' || school.status === 'correction_required';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Status Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <SchoolIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {school.school_name}
                </h1>
                <Badge status={school.status} />
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2 font-medium">
                <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                  {school.registration_id}
                </span>
                <span className="font-bold text-slate-700">
                  District: {school.district}
                </span>
                <span>Principal: {school.principal_name}</span>
                {school.submitted_at && (
                  <span>
                    Submitted: {new Date(school.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canEdit ? (
              <Link to="/register">
                <Button size="md" variant="primary" leftIcon={<Edit3 className="w-4 h-4" />}>
                  {school.status === 'correction_required' ? 'Update & Resubmit Corrections' : 'Continue Registration Wizard'}
                </Button>
              </Link>
            ) : (
              <Button
                size="md"
                variant="primary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => generateAcknowledgementPDF(registration)}
              >
                Download Official Acknowledgement PDF
              </Button>
            )}
          </div>
        </div>

        {/* Administrator Correction Remarks Alert */}
        {school.status === 'correction_required' && school.correction_remarks && (
          <div className="mt-6 p-4 sm:p-5 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3.5">
            <AlertCircle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-xs text-orange-950 space-y-1">
              <p className="font-bold text-sm text-orange-900">
                Action Required: Administrator Requested Corrections
              </p>
              <p className="leading-relaxed">
                "{school.correction_remarks}"
              </p>
              <p className="text-[11px] text-orange-800 pt-1">
                Click "Update & Resubmit Corrections" above to modify the requested records and resubmit for immediate review.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Application Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Application Status
          </p>
          <div className="mt-2 flex items-center justify-between">
            <Badge status={school.status} />
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {school.status === 'approved' ? 'Accreditation granted. Bring acknowledgement pass to venue.' :
             school.status === 'submitted' ? 'Application in queue for administrative document check.' :
             school.status === 'under_review' ? 'Documents currently being audited by secretariat.' :
             school.status === 'correction_required' ? 'Modifications requested by administrator.' :
             'Draft not yet submitted.'}
          </p>
        </div>

        {/* Card 2: Students Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Students Registered
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{completedStudentsCount}</span>
            <span className="text-xs font-semibold text-slate-500">/ 4 Required</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${(completedStudentsCount / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Mentor Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Designated Mentor
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 truncate">
              {mentor.full_name || 'Not assigned'}
            </span>
            {isMentorComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isMentorComplete ? 'Faculty ID & photograph uploaded' : 'Incomplete credentials'}
          </p>
        </div>

        {/* Card 4: Representative Verification */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Representative Authorization
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
            {school.is_representative_verified ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified by Admin
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-500" /> Pending Admin Review
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Ensures one verified claim per institution.
          </p>
        </div>
      </div>

      {/* Mentor & Student Roster Cards */}
      <div className="space-y-6">
        {/* Mentor Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            Faculty Mentor In-Charge
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <img
                src={mentor.photo_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={mentor.full_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{mentor.full_name}</h4>
                <p className="text-xs text-slate-600">{mentor.designation || 'Faculty Member'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mobile: {mentor.phone} • Email: {mentor.email || 'N/A'}
                </p>
              </div>
            </div>

            {mentor.id_document_path && (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => setPreviewDoc({
                  title: `Faculty ID: ${mentor.full_name}`,
                  url: mentor.id_document_path!,
                  type: 'Faculty ID Card'
                })}
              >
                View Mentor ID
              </Button>
            )}
          </div>
        </div>

        {/* 4 Registered Students */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Registered Student Delegation (4 Members)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((stu) => (
              <div key={stu.student_number} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={stu.photo_path || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                    alt={stu.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      Student #{stu.student_number}
                    </span>
                    <h5 className="text-sm font-bold text-slate-900 mt-1">{stu.full_name || 'Unnamed Student'}</h5>
                    <p className="text-xs text-slate-600">{stu.class_name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Proof: {stu.identity_document_type === 'masked_aadhaar' ? 'Masked Aadhaar (Verified)' : 'School ID Card'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  {stu.school_id_document_path && (
                    <button
                      onClick={() => setPreviewDoc({
                        title: `School ID: ${stu.full_name}`,
                        url: stu.school_id_document_path!,
                        type: 'School ID Card'
                      })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      ID Card
                    </button>
                  )}
                  {stu.identity_document_path && (
                    <button
                      onClick={() => setPreviewDoc({
                        title: `Identity Proof: ${stu.full_name}`,
                        url: stu.identity_document_path!,
                        type: stu.identity_document_type || 'Identity Proof'
                      })}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      ID Proof
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
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
