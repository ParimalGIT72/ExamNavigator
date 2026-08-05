'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogoutMutation } from '@/hooks/useAuth';
import { Badge } from '../ui/Badge';

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-sm font-bold text-slate-900 leading-none">{user.fullName}</span>
          <span className="text-xs text-slate-500 mt-0.5 capitalize">{user.role}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <div className="mt-2">
              <Badge variant={user.role === 'Admin' ? 'danger' : 'brand'} size="sm">
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="py-1">
            {user.role === 'Admin' ? (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Shield className="h-4 w-4 mr-2.5 text-slate-400" /> Admin Dashboard
              </Link>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-4 w-4 mr-2.5 text-slate-400" /> Student Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logoutMutation.mutate();
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2.5 text-red-500" /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
