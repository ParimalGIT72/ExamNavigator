'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Bell, Layers, Sparkles, Bot, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubjectsQuery } from '@/hooks/useAcademic';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useSubjectsQuery();

  const targetExam = user?.targetExam || 'JEE';

  return (
    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
      <StudentLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-brand-600 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-brand-200 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Student Learning Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.fullName || 'Student'}! 👋
              </h1>
              <p className="text-brand-100 text-sm mt-2 max-w-xl leading-relaxed">
                Target Exam: <span className="font-bold text-white px-2 py-0.5 bg-white/20 rounded-md">{targetExam}</span>. Explore your target exam curriculum modules, chapters, and resources.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ai/tutor"
                className="inline-flex items-center justify-center px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex-shrink-0"
              >
                <Sparkles className="h-4 w-4 mr-2 text-slate-950" /> Ask AI Tutor
              </Link>
              <Link
                href="/subjects"
                className="inline-flex items-center justify-center px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm shadow transition-all flex-shrink-0 border border-white/20"
              >
                <BookOpen className="h-4 w-4 mr-2" /> All Subjects
              </Link>
            </div>
          </div>

          {/* Quick Learning & AI Access */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Doubts Tutor Card */}
            <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between bg-gradient-to-b from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-900 lg:col-span-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
                    <Bot className="h-6 w-6" />
                  </div>
                  <Badge variant="success">AI Assistant</Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Doubts Tutor</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Ask doubts for your competitive exam ({targetExam}) with instant RAG-grounded AI solutions.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">24/7 AI Assistant</span>
                <Link href="/ai/tutor" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center">
                  Ask Doubts <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Quick Revision Card */}
            <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between bg-gradient-to-b from-amber-50/60 to-white dark:from-slate-900 dark:to-slate-900 lg:col-span-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl w-fit">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <Badge variant="warning">{targetExam} Formula Sheets</Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Quick Revision</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Fast formula sheets, key concepts, and high-priority revision notes for last-minute exam prep.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Last-Minute Prep</span>
                <Link href="/quick-revision" className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center">
                  Open Formula Sheets <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Platform Announcement Card */}
            <Card className="p-6 border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4 lg:col-span-1">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Announcements</h3>
                  <p className="text-xs text-slate-500">Curriculum progress</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="brand">{targetExam} Active</Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Your target exam curriculum ({targetExam}) is active. Browse your registered subjects below.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Dynamic "My Subjects" Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Subjects</h2>
                <p className="text-xs text-slate-500">
                  Curriculum for <span className="font-semibold text-brand-600">{targetExam}</span>
                </p>
              </div>
              <Link
                href="/subjects"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center"
              >
                View All Subjects <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>

            {/* Error State with Retry */}
            {isError && (
              <div className="space-y-3">
                <Alert
                  variant="error"
                  title="Failed to Load Subjects"
                  message={error?.message || 'Unable to load curriculum subjects.'}
                />
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Dynamic Subjects Grid */}
            {!isLoading && data && data.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((subject) => (
                  <Card
                    key={subject._id}
                    className="p-6 border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between bg-white"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <Badge variant="brand">{subject.examType || targetExam}</Badge>
                      </div>

                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{subject.code}</span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5 line-clamp-1">{subject.name}</h3>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {subject.description || 'Comprehensive syllabus modules covering theory, formulas, and topic exercises.'}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <Layers className="h-4 w-4 mr-1 text-slate-400" />
                        <span>{subject.chapterCount ?? 0} Chapters</span>
                      </div>

                      <Link
                        href={`/subjects/${subject._id}`}
                        className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        Explore <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && data && data.items.length === 0 && (
              <EmptyState
                title="No Subjects Available"
                description="No subjects available for your selected exam."
              />
            )}
          </div>
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
