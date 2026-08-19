'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, RefreshCw, Layers } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubjectsQuery } from '@/hooks/useAcademic';
import { QuickRevisionCard } from '@/components/quick-revision/QuickRevisionCard';

export default function QuickRevisionPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useSubjectsQuery();

  const targetExam = user?.targetExam || 'JEE';

  return (
    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
      <StudentLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Breadcrumb
            items={[
              { label: 'My Subjects', href: '/subjects' },
              { label: 'Quick Revision' },
            ]}
          />

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Last-Minute Exam Preparation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Quick Revision & Formula Sheets
              </h1>
              <p className="text-amber-100 text-sm mt-2 max-w-2xl leading-relaxed">
                Access concise formula sheets, core derivations, and high-priority revision notes for your target exam (<span className="font-bold text-white px-2 py-0.5 bg-white/20 rounded">{targetExam}</span>).
              </p>
            </div>
          </div>

          {/* Subject Quick Revision Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Select Subject for Revision</h2>
                <p className="text-xs text-slate-500">
                  Formula sheets for <span className="font-semibold text-amber-600">{targetExam}</span> curriculum
                </p>
              </div>
            </div>

            {/* Error Banner with Retry */}
            {isError && (
              <div className="space-y-3">
                <Alert
                  variant="error"
                  title="Failed to Load Revision Subjects"
                  message={error?.message || 'Network error occurred while fetching curriculum subjects.'}
                />
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors"
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

            {/* Dynamic Subject Cards */}
            {!isLoading && data && data.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((subject) => (
                  <QuickRevisionCard
                    key={subject._id}
                    subject={subject}
                    formulaSheetCount={subject.resourceCount ? Math.ceil(subject.resourceCount / 2) : 3}
                    revisionNotesCount={subject.chapterCount ? subject.chapterCount * 2 : 5}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && data && data.items.length === 0 && (
              <EmptyState
                title="No Revision Subjects Found"
                description={`No active subjects available for target exam ${targetExam}.`}
              />
            )}
          </div>
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
