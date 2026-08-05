import React from 'react';

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-40 bg-white/75 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-xl p-4 transition-all">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-2"></div>
          <span className="text-xs font-medium text-slate-700">{message}</span>
        </div>
      )}
    </div>
  );
};
