import { BookOpen, Layers, FileText, FileCode, LayoutDashboard } from 'lucide-react';
import React from 'react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Subjects & Learning',
    href: '/subjects',
    icon: BookOpen,
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Subjects',
    href: '/admin/subjects',
    icon: BookOpen,
  },
  {
    title: 'Chapters',
    href: '/admin/chapters',
    icon: Layers,
  },
  {
    title: 'Topics',
    href: '/admin/topics',
    icon: FileText,
  },
  {
    title: 'Learning Resources',
    href: '/admin/resources',
    icon: FileCode,
  },
];
