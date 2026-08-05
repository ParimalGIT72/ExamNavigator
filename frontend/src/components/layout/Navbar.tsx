'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Menu, Bell } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';

export interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-label="Open sidebar menu"
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            <Link href="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1">
              <GraduationCap className="h-8 w-8 text-brand-600 flex-shrink-0" />
              <span className="text-xl font-extrabold text-slate-900 tracking-tight hidden sm:inline">ExamNavigator</span>
            </Link>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-4">
            {/* Notification Placeholder UI Only */}
            <button
              type="button"
              aria-label="View notifications (UI placeholder)"
              className="relative p-2 text-slate-500 hover:text-brand-600 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
