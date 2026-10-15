import React, { useState } from 'react';
import { User, CheckCircle2, AlertCircle, FileCheck, Shield, Eye } from 'lucide-react';
import { Student, IdentityDocType } from '../../types';
import { Input } from '../ui/Input';
import { FileUploader } from '../ui/FileUploader';
import { AadhaarMaskingAdvisoryModal } from '../ui/AadhaarMaskingAdvisoryModal';
import { DocumentPreviewModal } from '../ui/DocumentPreviewModal';

interface StudentFormProps {
  studentNumber: number;
  student: Partial<Student>;
  onChange: (updated: Partial<Student>) => void;
  disabled?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  studentNumber,
  student,
  onChange,
  disabled = false,
}) => {
  const [showAadhaarAdvisory, setShowAadhaarAdvisory] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; type: string } | null>(null);

  const isComplete = Boolean(
    student.full_name &&
    student.class_name &&
    student.photo_path &&
    student.school_id_document_path
  );

  const handleFieldChange = (field: keyof Student, value: any) => {
    onChange({
      ...student,
      student_number: studentNumber,
      [field]: value,
    });
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden bg-white shadow-xs
      ${isComplete ? 'border-emerald-200 shadow-emerald-50/50' : 'border-slate-200'}`}
    >
      {/* Student Card Header */}
      <div className={`px-5 py-3.5 border-b flex items-center justify-between
        ${isComplete ? 'bg-emerald-50/60 border-emerald-100' : 'bg-slate-50/70 border-slate-200/80'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
            ${isComplete ? 'bg-emerald-600 text-white shadow-xs' : 'bg-blue-600 text-white'}`}
          >
            {studentNumber}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              {student.full_name ? student.full_name : `Student Delegate #${studentNumber}`}
            </h4>
            <p className="text-[11px] text-slate-500">
              {student.class_name ? `Class: ${student.class_name}` : 'Student registration details & credentials'}
            </p>
          </div>
        </div>

        <div>
          {isComplete ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Profile Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Pending Required Fields
            </span>
          )}
        </div>
      </div>

      {/* Student Form Body */}
      <div className="p-5 space-y-5">
        {/* Name, Class, and Registration Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Full Name of Student"
            placeholder="e.g. Aryan Sharma"
            required
            value={student.full_name || ''}
            disabled={disabled}
            onChange={(e) => handleFieldChange('full_name', e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class / Standard <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={disabled}
              value={student.class_name || ''}
              onChange={(e) => handleFieldChange('class_name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="">-- Select Class --</option>
              <option value="8th">8th Standard</option>
              <option value="9th">9th Standard</option>
            </select>
          </div>

          <Input
            label="Student Registration Number"
            placeholder="e.g. REG-01 / Roll No"
            value={student.student_registration_number || ''}
            disabled={disabled}
            onChange={(e) => handleFieldChange('student_registration_number', e.target.value)}
          />
        </div>

        {/* Uploads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 1. Passport Photograph */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80">
            <FileUploader
              label="1. Student Photograph"
              helperText="Passport format with white/plain background"
              required
              type="photos"
              value={student.photo_path}
              disabled={disabled}
              onChange={(path, previewUrl) => handleFieldChange('photo_path', previewUrl || path)}
              onPreview={() => student.photo_path && setPreviewDoc({
                title: `Photograph: ${student.full_name || `Student ${studentNumber}`}`,
                url: student.photo_path,
                type: 'Student Passport Photo'
              })}
            />
          </div>

          {/* 2. School ID Card */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80">
            <FileUploader
              label="2. School ID Card"
              helperText="Official Student ID issued by school"
              required
              type="documents"
              value={student.school_id_document_path}
              disabled={disabled}
              onChange={(path, previewUrl) => handleFieldChange('school_id_document_path', previewUrl || path)}
              onPreview={() => student.school_id_document_path && setPreviewDoc({
                title: `School ID Card: ${student.full_name || `Student ${studentNumber}`}`,
                url: student.school_id_document_path,
                type: 'School ID Card'
              })}
            />
          </div>

          {/* 3. Secondary Identity Proof (Subject to Privacy Rules) */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>3. Identity Proof</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Optional alternative)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAadhaarAdvisory(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline flex items-center gap-0.5"
                >
                  <Shield className="w-3 h-3" />
                  Masking Rules
                </button>
              </div>

              {/* Select ID Type */}
              <select
                value={student.identity_document_type || 'school_id'}
                disabled={disabled}
                onChange={(e) => handleFieldChange('identity_document_type', e.target.value as IdentityDocType)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="school_id">School ID Card (Primary Verification)</option>
                <option value="masked_aadhaar">Masked Aadhaar (Last 4 Digits Only)</option>
                <option value="passport">Passport / Government ID</option>
                <option value="other_id">Bonafide Principal Certificate</option>
              </select>

              <FileUploader
                label=""
                helperText={
                  student.identity_document_type === 'masked_aadhaar'
                    ? 'Only masked Aadhaar (first 8 digits obscured)'
                    : 'Clear front scan of selected ID document'
                }
                type="documents"
                value={student.identity_document_path}
                disabled={disabled}
                beforeUploadCheck={async () => {
                  if (student.identity_document_type === 'masked_aadhaar') {
                    setShowAadhaarAdvisory(true);
                    return false; // Handled after modal confirmation
                  }
                  return true;
                }}
                onChange={(path, previewUrl) => handleFieldChange('identity_document_path', previewUrl || path)}
                onPreview={() => student.identity_document_path && setPreviewDoc({
                  title: `Identity Proof: ${student.full_name || `Student ${studentNumber}`}`,
                  url: student.identity_document_path,
                  type: student.identity_document_type || 'Identity Proof'
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Modal for Aadhaar Masking */}
      <AadhaarMaskingAdvisoryModal
        isOpen={showAadhaarAdvisory}
        onClose={() => setShowAadhaarAdvisory(false)}
        onConfirmConsent={() => {
          // Handled consent
          setShowAadhaarAdvisory(false);
        }}
      />

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          documentUrl={previewDoc.url}
          documentType={previewDoc.type}
          studentOrMentorName={student.full_name}
        />
      )}
    </div>
  );
};
