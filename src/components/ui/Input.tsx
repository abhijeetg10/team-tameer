import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-1 font-semibold">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20' : 'border-slate-300'}
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
