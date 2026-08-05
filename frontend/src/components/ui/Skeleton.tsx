import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return <div className={clsx('animate-pulse bg-slate-200 rounded', className)} />;
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/6" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="space-y-2 flex-1 max-w-md">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};
