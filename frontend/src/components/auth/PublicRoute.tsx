'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  return <>{children}</>;
};
