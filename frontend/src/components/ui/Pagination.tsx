import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { IPaginationMeta } from '@/types';

export interface PaginationProps {
  pagination?: IPaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  className = '',
}) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 ${className}`}>
      <div className="text-sm text-slate-600">
        Showing Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span> ({total} items total)
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        <span className="px-3 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-md">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next Page"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
