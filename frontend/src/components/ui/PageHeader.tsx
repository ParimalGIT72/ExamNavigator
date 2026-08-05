import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  icon,
  className = '',
}) => {
  return (
    <div className={`space-y-3 border-b border-slate-200 pb-6 mb-6 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-2" />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          {icon && <div className="p-2 bg-brand-50 rounded-xl text-brand-600 flex-shrink-0 mt-0.5">{icon}</div>}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-slate-600 text-sm mt-1 leading-relaxed">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center space-x-3 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
