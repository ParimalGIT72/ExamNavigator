'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Layers, GraduationCap, ChevronRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { useSubjectsQuery, useExamsQuery } from '@/hooks/useAcademic';
import { ExamType, IAcademicQueryParams } from '@/types';

export default function SubjectsPage() {
  const [params, setParams] = useState<IAcademicQueryParams>({
    page: 1,
    limit: 9,
    search: '',
    examType: undefined,
  });

  const { data, isLoading, isError, error } = useSubjectsQuery(params);
  const { data: examsData } = useExamsQuery();

  const handleSearchChange = (search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleExamTypeChange = (val: string) => {
    setParams((prev) => ({
      ...prev,
      examType: val ? (val as ExamType) : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const examFilterOptions = [
    { label: 'All Registered Exams', value: '' },
    ...(examsData?.items?.map((exam) => ({
      label: `${exam.code} (${exam.name})`,
      value: exam.code,
    })) || [
      { label: 'JEE (Engineering)', value: 'JEE' },
      { label: 'NEET (Medical)', value: 'NEET' },
      { label: 'MHT-CET', value: 'MHT-CET' },
      { label: 'GATE (Engineering)', value: 'GATE' },
      { label: 'CAT (Management)', value: 'CAT' },
    ]),
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-brand-600 font-semibold text-sm">
                <GraduationCap className="h-5 w-5" />
                <span>Academic Learning Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Available Subjects</h1>
              <p className="text-slate-600 text-sm mt-1">Explore subject curricula, structured chapter breakdown, and topic resources.</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <SearchFilterBar
            searchPlaceholder="Search subjects by title, code or description..."
            onSearchChange={handleSearchChange}
            filters={[
              {
                name: 'Filter by Exam',
                key: 'examType',
                value: params.examType || '',
                options: examFilterOptions,
                onChange: handleExamTypeChange,
              },
            ]}
          />

          {/* Error Banner */}
          {isError && (
            <Alert variant="error" title="Failed to Load Subjects" message={error?.message || 'Network error occurred.'} />
          )}

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Content Grid */}
          {!isLoading && data && data.items.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((subject) => (
                  <Card key={subject._id} className="hover:shadow-lg transition-all border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <Badge variant="brand">{subject.examType}</Badge>
                      </div>

                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{subject.code}</span>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5 line-clamp-1">{subject.name}</h2>
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

              {/* Pagination */}
              <Pagination pagination={data.pagination} onPageChange={handlePageChange} />
            </>
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
    </ProtectedRoute>
  );
}
