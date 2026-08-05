'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { STUDENT_NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/config/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, className }) => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = user?.role === 'Admin' ? ADMIN_NAV_ITEMS : STUDENT_NAV_ITEMS;

  return (
    <aside className={clsx('w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 min-h-[calc(100vh-4rem)]', className)}>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3">
            {user?.role === 'Admin' ? 'Admin Controls' : 'Student Menu'}
          </span>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={clsx(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-brand-50 text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className={clsx('h-5 w-5', isActive ? 'text-brand-600' : 'text-slate-400')} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 text-center">
        <p className="font-semibold text-slate-700">ExamNavigator v1.0</p>
        <p className="mt-0.5">Competitive Exam Prep Platform</p>
      </div>
    </aside>
  );
};
