import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200" role="dialog" aria-modal="true">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <div className="p-2 bg-red-50 rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>

        <p className="text-slate-600 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end space-x-3">
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} size="md" onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
