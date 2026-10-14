import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentUrl: string;
  documentType?: string;
  studentOrMentorName?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  documentUrl,
  documentType = 'Identity Document',
  studentOrMentorName,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const isPdf = documentUrl.toLowerCase().includes('.pdf') || documentUrl.startsWith('data:application/pdf');

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div 
        className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/60 border border-blue-800/60 rounded-lg text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/80 rounded-md">
                  Signed Preview
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {studentOrMentorName ? `Record: ${studentOrMentorName} • ` : ''}
                {documentType} • Access logged under Event Audit Policy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewer Controls */}
            {!isPdf && (
              <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 mr-2">
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono text-slate-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  title="Rotate 90°"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors ml-1"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Viewing Area */}
        <div className="relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4 select-none">
          {/* Watermark Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-10">
            <p className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest -rotate-25 whitespace-nowrap">
              CONFIDENTIAL • EVENT VERIFICATION ONLY
            </p>
          </div>

          {!documentUrl ? (
            <div className="text-center text-slate-500 py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-500" />
              <p className="text-sm font-medium">No document uploaded yet or document path invalid.</p>
            </div>
          ) : isPdf ? (
            <iframe 
              src={documentUrl} 
              className="w-full h-full rounded-lg border border-slate-800 bg-white"
              title={title}
            />
          ) : (
            <div className="transition-transform duration-200 flex items-center justify-center max-w-full max-h-full">
              <img
                src={documentUrl}
                alt={title}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform border border-slate-800"
              />
            </div>
          )}
        </div>

        {/* Bottom Status / Privacy Footer */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Secured Document Channel • High-resolution rendering</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset View
            </button>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
