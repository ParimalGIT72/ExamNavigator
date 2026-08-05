'use client';

import React from 'react';
import { useToastStore } from '@/store/useToastStore';
import { Alert } from './Alert';
import { X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto relative shadow-lg rounded-lg overflow-hidden animate-slide-up">
          <Alert variant={toast.type} title={toast.title} message={toast.message} />
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss toast"
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
