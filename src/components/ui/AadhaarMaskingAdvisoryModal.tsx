import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, FileText, Lock } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface AadhaarMaskingAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmConsent: () => void;
}

export const AadhaarMaskingAdvisoryModal: React.FC<AadhaarMaskingAdvisoryModalProps> = ({
  isOpen,
  onClose,
  onConfirmConsent,
}) => {
  const [acknowledgedMasking, setAcknowledgedMasking] = useState(false);
  const [acknowledgedParentConsent, setAcknowledgedParentConsent] = useState(false);
  const [preferSchoolId, setPreferSchoolId] = useState(false);

  const canProceed = (acknowledgedMasking && acknowledgedParentConsent) || preferSchoolId;

  const handleProceed = () => {
    if (canProceed) {
      onConfirmConsent();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Privacy & Identity Document Advisory"
      description="UIDAI & Child Data Protection Compliance Rules"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold text-sm text-amber-950 mb-1">
              Strict Notice: Never Upload Unmasked Aadhaar Numbers
            </p>
            As participating students are minors, statutory regulations prohibit the collection, storage, or transmission of unmasked 12-digit Aadhaar cards. Any raw Aadhaar uploaded will be automatically rejected.
          </div>
        </div>

        {/* Visual Masking Guide */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Permitted vs Prohibited Document Formats:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Permitted Documents:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li><strong className="text-emerald-950">Official School ID Card</strong> (Recommended)</li>
                <li>Masked Aadhaar (Showing only <strong className="font-mono">XXXX-XXXX-1234</strong>)</li>
                <li>Passport / Bonafide School Certificate</li>
              </ul>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Strictly Prohibited:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Raw, unmasked 12-digit Aadhaar card</li>
                <li>Biometric scans or QR copies</li>
                <li>Any document without parent authorization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mandatory Declarations */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={acknowledgedMasking}
              onChange={(e) => setAcknowledgedMasking(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 leading-normal">
              I confirm that the document being uploaded is either a <strong>School ID card</strong> or an appropriately <strong>masked Aadhaar card</strong> where the first 8 digits are obscured.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={acknowledgedParentConsent}
              onChange={(e) => setAcknowledgedParentConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 leading-normal">
              As the authorized school representative/principal, I verify that lawful <strong>parental/guardian consent</strong> has been obtained for the student to participate and share identity proofs for event accreditation.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Cancel Upload
          </button>
          <Button
            size="sm"
            variant="primary"
            disabled={!canProceed}
            onClick={handleProceed}
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Confirm & Proceed to Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
};
