import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Items Found',
  description = 'There are no records matching your current filter criteria or selection.',
  actionText,
  onAction,
  icon = <FolderOpen className="h-12 w-12 text-slate-400" />,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-slate-200 border-dashed rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center my-6 ${className}`}>
      <div className="p-3 bg-slate-50 rounded-full mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
