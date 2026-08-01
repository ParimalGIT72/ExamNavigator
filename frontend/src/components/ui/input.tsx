import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
        <input
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-slate-100',
              error && 'border-red-500 focus:ring-red-500',
              className
            )
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
