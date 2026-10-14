import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Eye, 
  Clock, 
  History, 
  ShieldCheck, 
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  School as SchoolIcon,
  UserPlus,
  HelpCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { FullSchoolRegistration, RegistrationStatus, ParticipatingSchool } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { DocumentPreviewModal } from '../../components/ui/DocumentPreviewModal';
import { generateAcknowledgementPDF } from '../../lib/pdfGenerator';

export const SchoolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [registration, setRegistration] = useState<FullSchoolRegistration | null>(null);
  const [unregisteredSchool, setUnregisteredSchool] = useState<ParticipatingSchool | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Modals & Document Viewer
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; type: string } | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  const loadSchool = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      if (id.startsWith('master-')) {
        // Master school that has not registered
        const masterId = id.replace('master-', '');
        const ps = await api.getParticipatingSchoolById(masterId);
        setUnregisteredSchool(ps);
        setRegistration(null);
      } else {
        const data = await api.getSchoolById(id);
        if (data) {
          setRegistration(data);
          setUnregisteredSchool(null);
        } else {
          // Check if id is actually a participating school id
          const regByPs = await api.getSchoolByParticipatingSchoolId(id);
          if (regByPs) {
            setRegistration(regByPs);
            setUnregisteredSchool(null);
          } else {
            const ps = await api.getParticipatingSchoolById(id);
            if (ps) {
              setUnregisteredSchool(ps);
              setRegistration(null);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load school details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchool();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-600">Loading school dossier and documents...</p>
      </div>
    );
  }

  // Clean empty state for Unregistered School from the official 34 dataset
  if (unregisteredSchool && !registration) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Master Directory</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <SchoolIcon className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Registration Not Received
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {unregisteredSchool.school_name}
            </h2>
            <p className="text-xs text-slate-500">
              Official Participating School • <strong>{unregisteredSchool.district} District</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-lg mx-auto text-xs text-slate-600 text-left space-y-2">
            <p className="font-semibold text-slate-800">Secretariat Follow-Up Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
              <li>This institution is an officially invited participant for the 2026 Championship.</li>
              <li>The Principal or authorized mentor has not yet submitted an online application.</li>
              <li>A draft may be initiated as soon as an authorized representative signs in with Google and selects this school.</li>
            </ul>
          </div>

          <div>
            <Button variant="secondary" size="md" onClick={() => navigate('/admin')}>
              Return to District Directory (36 Schools)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Registration Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested school registration does not exist in the database.</p>
        <Button variant="secondary" onClick={() => navigate('/admin')}>
          Return to Admin Dashboard
        </Button>
      </div>
    );
  }

  const { school, mentor, students, reviews } = registration;

  const handleStatusChange = async (newStatus: RegistrationStatus, remarks: string) => {
    if (!user) return;
    try {
      setIsActionLoading(true);
      setActionError(null);
      const updated = await api.reviewSchool(school.id, user, newStatus, remarks);
      setRegistration(updated);
      setShowApproveDialog(false);
      setShowCorrectionModal(false);
      setShowRejectModal(false);
      setRemarksInput('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to update review status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleVerifyRepresentative = async () => {
    if (!user) return;
    try {
      setIsActionLoading(true);
      const updated = await api.verifyRepresentative(school.id, user);
      setRegistration(updated);
    } catch (err: any) {
      alert('Verification failed: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Master Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => generateAcknowledgementPDF(registration)}
          >
            Download Summary PDF
          </Button>
        </div>
      </div>

      {/* Main Dossier Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <SchoolIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {school.school_name}
                </h1>
                <Badge status={school.status} />
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 mt-2">
                <span className="font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-bold">
                  {school.registration_id}
                </span>
                <span className="font-bold text-slate-700">
                  District: {school.district}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {school.city} • {school.address}
                </span>
                {school.school_code && (
                  <span className="font-mono">UDISE: {school.school_code}</span>
                )}
              </div>
            </div>
          </div>

          {/* Review Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!school.is_representative_verified && (
              <Button
                size="sm"
                variant="secondary"
                isLoading={isActionLoading}
                leftIcon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
                onClick={handleVerifyRepresentative}
              >
                Verify Representative
              </Button>
            )}

            <Button
              size="sm"
              variant="success"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => setShowApproveDialog(true)}
            >
              Approve Registration
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="text-orange-700 border-orange-200 hover:bg-orange-50"
              leftIcon={<AlertCircle className="w-4 h-4 text-orange-600" />}
              onClick={() => {
                setRemarksInput('');
                setShowCorrectionModal(true);
              }}
            >
              Request Correction
            </Button>

            <Button
              size="sm"
              variant="danger"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => {
                setRemarksInput('');
                setShowRejectModal(true);
              }}
            >
              Reject
            </Button>
          </div>
        </div>

        {/* Institution Contact Information & Representative Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Authorized Representative
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {school.is_representative_verified ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Verification Pending
                </span>
              )}
            </div>
            <p className="text-slate-500 text-[10px] mt-0.5">UID: {school.registered_by_user_id || 'System Seed'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Principal In-Charge
            </span>
            <p className="font-bold text-slate-900">{school.principal_name}</p>
            <p className="text-slate-500 mt-0.5">{school.school_email}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Contact Numbers
            </span>
            <p className="font-bold text-slate-900">{school.contact_number}</p>
            <p className="text-slate-500 mt-0.5">Official School Desk</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Submission Timestamp
            </span>
            <p className="font-bold text-slate-900">
              {school.submitted_at 
                ? new Date(school.submitted_at).toLocaleString('en-IN') 
                : 'Draft Mode'}
            </p>
            <p className="text-slate-500 mt-0.5">District: {school.district}</p>
          </div>
        </div>
      </div>

      {/* Mentor Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            Accompanying Faculty Mentor (1)
          </h3>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Faculty Mentor
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-4">
            <img
              src={mentor.photo_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={mentor.full_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
            />
            <div>
              <h4 className="text-base font-bold text-slate-900">{mentor.full_name}</h4>
              <p className="text-xs text-slate-600">{mentor.designation || 'Designated Mentor'}</p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {mentor.phone}
                </span>
                {mentor.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {mentor.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
                Inspect Mentor ID Card
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Registered Students Responsive Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Registered Student Delegation (Exactly 4 Members)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review photographs and school-issued identity cards. Raw Aadhaar numbers strictly prohibited.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {students.length} / 4 Students
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {students.map((stu) => (
            <div 
              key={stu.student_number}
              className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <img
                    src={stu.photo_path || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                    alt={stu.full_name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Delegate #{stu.student_number}
                    </span>
                    <h5 className="text-sm font-bold text-slate-900 mt-1">{stu.full_name || 'Incomplete Profile'}</h5>
                    <p className="text-xs text-slate-600">{stu.class_name || 'Class not specified'}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Identity Proof: {stu.identity_document_type === 'masked_aadhaar' ? 'Masked Aadhaar (XXXX-1234)' : 'School Identity Card'}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified
                </span>
              </div>

              {/* Secure Document Preview Buttons */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                {stu.school_id_document_path ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs"
                    leftIcon={<Eye className="w-3.5 h-3.5 text-blue-600" />}
                    onClick={() => setPreviewDoc({
                      title: `School ID Card: ${stu.full_name}`,
                      url: stu.school_id_document_path!,
                      type: 'School ID Card'
                    })}
                  >
                    View School ID Card
                  </Button>
                ) : (
                  <span className="text-xs text-rose-500 font-medium">Missing School ID</span>
                )}

                {stu.identity_document_path && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs"
                    leftIcon={<Eye className="w-3.5 h-3.5 text-slate-600" />}
                    onClick={() => setPreviewDoc({
                      title: `Identity Proof: ${stu.full_name}`,
                      url: stu.identity_document_path!,
                      type: stu.identity_document_type || 'Identity Proof'
                    })}
                  >
                    View Secondary Proof
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review History & Audit Trail */}
      {reviews && reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            Administrative Review & Audit Log History
          </h3>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{rev.admin_name || 'Event Registrar'}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500">
                      Changed status from <strong className="font-mono">{rev.previous_status}</strong> to <strong className="font-mono text-blue-600">{rev.new_status}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(rev.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
                {rev.remarks && (
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    "{rev.remarks}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Approve Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={() => handleStatusChange('approved', 'All 4 student photo IDs and mentor credentials verified and approved.')}
        title="Approve School Registration"
        message={`Are you sure you want to approve ${school.school_name} (${school.registration_id})? This will mark the registration as Approved and permit official accreditation passes.`}
        confirmText="Confirm Approval"
        variant="success"
        isLoading={isActionLoading}
      />

      {/* 2. Request Correction Modal (Requires Reason) */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Request Registration Corrections"
        description="Notify school representative of required document or data updates"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correction Reason & Detailed Instructions <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={remarksInput}
              onChange={(e) => setRemarksInput(e.target.value)}
              placeholder="e.g. Student 3 ID scan is blurry. Please upload a clear photo of the School ID card."
              className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              This message will be shown prominently to the school representative to guide their corrections.
            </p>
          </div>

          {actionError && (
            <p className="text-xs text-rose-600 font-medium">{actionError}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => setShowCorrectionModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!remarksInput.trim()}
              isLoading={isActionLoading}
              onClick={() => handleStatusChange('correction_required', remarksInput)}
            >
              Send Correction Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Reject Modal (Requires Reason) */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Registration"
        description="Mandatory formal grounds for application rejection"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grounds for Rejection <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={remarksInput}
              onChange={(e) => setRemarksInput(e.target.value)}
              placeholder="e.g. Institution registration could not be verified by authorized school leadership."
              className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={!remarksInput.trim()}
              isLoading={isActionLoading}
              onClick={() => handleStatusChange('rejected', remarksInput)}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

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
