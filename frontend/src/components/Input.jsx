import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  id,
  className = '',
  required = false,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-darkbg-card/50 border-slate-200 dark:border-darkbg-border focus:border-brand-500 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-450 ${
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
        }`}
        {...props}
      />
      {error && (
        <span
          id={`${inputId}-error`}
          className="text-xs text-red-500 mt-1 block font-medium"
        >
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
