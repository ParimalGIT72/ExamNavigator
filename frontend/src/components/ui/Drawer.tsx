import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'left',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div
        className={clsx(
          'fixed inset-y-0 max-w-full flex z-50 bg-white shadow-2xl border-slate-200 transition-transform duration-300 w-80 sm:w-96',
          position === 'left' ? 'left-0' : 'right-0',
          className
        )}
      >
        <div className="w-full flex flex-col justify-between p-6 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors ml-auto"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
