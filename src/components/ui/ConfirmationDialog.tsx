import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    success: <CheckCircle className="w-6 h-6 text-emerald-600" />,
    primary: <Info className="w-6 h-6 text-blue-600" />,
  };

  const bgColors = {
    danger: 'bg-rose-50 border-rose-100',
    success: 'bg-emerald-50 border-emerald-100',
    primary: 'bg-blue-50 border-blue-100',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${bgColors[variant]}`}>
          <div className="shrink-0">{icons[variant]}</div>
          <p className="text-xs text-slate-700 leading-relaxed font-normal">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : variant === 'success' ? 'success' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
