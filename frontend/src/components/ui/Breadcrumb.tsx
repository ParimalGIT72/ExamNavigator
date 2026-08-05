import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1.5 text-xs sm:text-sm text-slate-500 ${className}`}>
      <Link href="/dashboard" className="flex items-center hover:text-brand-600 transition-colors" title="Home">
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-brand-600 font-medium transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
