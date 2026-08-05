import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'error',
  title,
  message,
  className,
}) => {
  const variantStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    error: <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={clsx(
        'p-3.5 border rounded-lg flex items-start space-x-3 text-sm shadow-sm',
        variantStyles[variant],
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <p className="leading-snug">{message}</p>
      </div>
    </div>
  );
};
