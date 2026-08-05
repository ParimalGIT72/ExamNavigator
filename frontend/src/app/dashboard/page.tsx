'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Bell, Award, Layers } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
      <StudentLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-brand-200 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Student Learning Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.fullName || 'Student'}! 👋
              </h1>
              <p className="text-brand-100 text-sm mt-2 max-w-xl leading-relaxed">
                Target Exam: <span className="font-bold text-white">{user?.targetExam || 'JEE'}</span>. Explore structured academic curricula, subject modules, and study resources.
              </p>
            </div>

            <Link
              href="/subjects"
              className="inline-flex items-center justify-center px-5 py-3 bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-bold text-sm shadow transition-all flex-shrink-0"
            >
              <BookOpen className="h-4 w-4 mr-2" /> Browse Subjects
            </Link>
          </div>

          {/* Quick Learning Access Shell */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-brand-50 rounded-xl text-brand-600 w-fit">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Academic Subjects</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Access Physics, Chemistry, Mathematics, and Biology structured curricula.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Core Curriculum</span>
                <Link href="/subjects" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center">
                  Explore <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </Card>

            <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 w-fit">
                  <Layers className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Chapter Breakdown</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  View topic-wise weightages, estimated study hours, and learning notes.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Structured Study</span>
                <Link href="/subjects" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
                  View Chapters <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </Card>

            <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 w-fit">
                  <Award className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Learning Resources</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Download formula sheets, study notes, and video tutorial links.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Study Materials</span>
                <Link href="/subjects" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center">
                  Open Resources <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </Card>
          </div>

          {/* Notification & System Shell Placeholder (UI Only) */}
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Platform Announcements</h3>
                <p className="text-xs text-slate-500">System updates and learning module status</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="brand">Academic System</Badge>
                    <span className="text-xs font-semibold text-slate-900">Phase 5 Core Frontend Active</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Subject, Chapter, Topic, and Resource learning interfaces are active and connected to Phase 4 backend endpoints.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium">Just now</span>
              </div>
            </div>
          </Card>
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
