'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Drawer } from '@/components/ui/Drawer';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

        <div className="flex-1 flex">
          {/* Desktop Admin Sidebar */}
          <Sidebar className="hidden lg:flex flex-shrink-0" />

          {/* Mobile Admin Sidebar Drawer */}
          <Drawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} title="Admin Menu">
            <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} className="w-full border-none p-0 min-h-0" />
          </Drawer>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </div>

        <ToastContainer />
      </div>
    </ProtectedRoute>
  );
}
