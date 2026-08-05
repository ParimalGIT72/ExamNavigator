'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Layers, FileText, FileCode, ChevronRight, Shield } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Shield className="h-4 w-4" />
              <span>Admin Management Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome Administrator, {user?.fullName || 'Admin'}
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">
              Manage core academic subjects, chapter weightages, learning topics, and study resources.
            </p>
          </div>

          <Badge variant="danger" size="md">
            System Role: Admin
          </Badge>
        </div>

        {/* Quick Management Module Shell */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 bg-brand-50 rounded-xl text-brand-600 w-fit">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Subjects CRUD</h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                Create, edit, and filter academic subjects and exam codes.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Subjects</span>
              <Link href="/admin/subjects" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center">
                Manage <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 w-fit">
                <Layers className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Chapters CRUD</h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                Configure chapter titles, study hours, and exam weightages.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Chapters</span>
              <Link href="/admin/chapters" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
                Manage <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 w-fit">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Topics CRUD</h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                Set difficulty levels, importance scores, and topic summaries.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Topics</span>
              <Link href="/admin/topics" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center">
                Manage <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 w-fit">
                <FileCode className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Resources CRUD</h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                Upload PDFs, notes, video tutorial links, and formula sheets.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Resources</span>
              <Link href="/admin/resources" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center">
                Manage <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
