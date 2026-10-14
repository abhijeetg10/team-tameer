import React from 'react';
import { RegistrationStatus } from '../../types';

interface BadgeProps {
  status?: RegistrationStatus;
  variant?: 'draft' | 'submitted' | 'under_review' | 'correction_required' | 'approved' | 'rejected' | 'not_registered' | 'pending_verification' | 'default';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className = '' }) => {
  const effectiveVariant = variant || status || 'default';

  const variantStyles: Record<string, string> = {
    not_registered: 'bg-slate-100 text-slate-500 border-slate-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    pending_verification: 'bg-amber-50 text-amber-700 border-amber-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    correction_required: 'bg-orange-50 text-orange-700 border-orange-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const labels: Record<RegistrationStatus, string> = {
    not_registered: 'Not Registered',
    draft: 'Draft',
    pending_verification: 'Pending Verification',
    submitted: 'Submitted',
    under_review: 'Under Review',
    correction_required: 'Correction Required',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const displayText = children || (status ? labels[status] : '');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase ${variantStyles[effectiveVariant] || variantStyles.default} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          effectiveVariant === 'approved' ? 'bg-emerald-500' :
          effectiveVariant === 'submitted' ? 'bg-blue-500' :
          effectiveVariant === 'under_review' || effectiveVariant === 'pending_verification' ? 'bg-amber-500' :
          effectiveVariant === 'correction_required' ? 'bg-orange-500' :
          effectiveVariant === 'rejected' ? 'bg-rose-500' : 'bg-slate-400'
        }`}
      />
      {displayText}
    </span>
  );
};
