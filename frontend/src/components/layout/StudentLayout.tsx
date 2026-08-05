'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Drawer } from '../ui/Drawer';
import { ToastContainer } from '../ui/ToastContainer';

export interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex flex-shrink-0" />

        {/* Mobile Navigation Drawer */}
        <Drawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} title="Menu">
          <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} className="w-full border-none p-0 min-h-0" />
        </Drawer>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
