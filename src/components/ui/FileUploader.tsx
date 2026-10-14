import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle, Trash2, Eye, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface FileUploaderProps {
  label: string;
  helperText?: string;
  required?: boolean;
  type: 'photos' | 'documents';
  value?: string; // Preview URL or uploaded path
  onChange: (path: string, previewUrl: string) => void;
  onPreview?: () => void;
  disabled?: boolean;
  beforeUploadCheck?: () => Promise<boolean>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  helperText,
  required,
  type,
  value,
  onChange,
  onPreview,
  disabled = false,
  beforeUploadCheck,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPhoto = type === 'photos';
  const maxSizeMb = isPhoto ? 5 : 10;
  const acceptedTypes = isPhoto 
    ? 'image/jpeg,image/png,image/webp' 
    : 'application/pdf,image/jpeg,image/png';

  const handleFileProcess = async (file: File) => {
    setUploadError(null);

    // Optional advisory check
    if (beforeUploadCheck) {
      const allowed = await beforeUploadCheck();
      if (!allowed) return;
    }

    try {
      setIsUploading(true);
      const res = await api.uploadFile(file, type);
      onChange(res.path, res.previewUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <span className="text-[11px] text-slate-600 font-medium">
          {isPhoto ? 'Max 5MB (JPG, PNG)' : 'Max 10MB (PDF, JPG, PNG)'}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleInputChange}
      />

      {value ? (
        /* Uploaded state */
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 group transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
              {isPhoto ? (
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              ) : value.includes('.pdf') ? (
                <FileText className="w-6 h-6 text-rose-500" />
              ) : (
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">
                  Document Uploaded
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5 font-mono">
                Encrypted & Private
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                title="Preview Document"
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View</span>
              </button>
            )}

            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                title="Remove File"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Dropzone state */
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150
            ${isDragOver ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 bg-white'}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs font-medium text-slate-700">Encrypting & Uploading...</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                {isPhoto ? <ImageIcon className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click to browse or drag & drop file
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isPhoto ? 'Passport style photograph (clear face view)' : 'Authorized document scan (clear & legible)'}
              </p>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-rose-600 flex items-center gap-1 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {uploadError}
        </p>
      )}

      {helperText && !uploadError && (
        <p className="text-[11px] text-slate-600">{helperText}</p>
      )}
    </div>
  );
};
