'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Clock, Award, ChevronRight, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useSubjectQuery, useChaptersQuery } from '@/hooks/useAcademic';
import { IAcademicQueryParams } from '@/types';

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = (params.subjectId as string) || '';

  const [queryParams, setQueryParams] = useState<IAcademicQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data: subject, isLoading: isSubjectLoading } = useSubjectQuery(subjectId);
  const { data: chaptersData, isLoading: isChaptersLoading, isError, error, refetch } = useChaptersQuery(subjectId, queryParams);

  const handleSearchChange = (search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Breadcrumb Hierarchy */}
          <Breadcrumb
            items={[
              { label: 'My Subjects', href: '/subjects' },
              { label: subject?.name || 'Subject Detail' },
            ]}
          />

          {/* Subject Header Banner */}
          {isSubjectLoading ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            subject && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {subject.code}
                    </span>
                    <Badge variant="brand">{subject.examType}</Badge>
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{subject.name}</h1>
                  <p className="text-slate-600 text-sm mt-2 max-w-3xl leading-relaxed">
                    {subject.description || 'Comprehensive curriculum chapters and structured learning topics.'}
                  </p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-slate-900">{chaptersData?.pagination.total || 0}</div>
                    <div className="text-xs text-slate-500 font-medium">Chapters</div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Chapter Search */}
          <SearchFilterBar
            searchPlaceholder="Search chapters by title or description..."
            onSearchChange={handleSearchChange}
          />

          {/* Error Banner with Retry */}
          {isError && (
            <div className="space-y-3">
              <Alert
                variant="error"
                title="Failed to Load Chapters"
                message={error?.message || 'Network error occurred while fetching chapters.'}
              />
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
              </button>
            </div>
          )}

          {/* Chapters List */}
          {isChaptersLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isChaptersLoading && chaptersData && chaptersData.items.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chaptersData.items.map((chapter) => (
                  <Card key={chapter._id} className="hover:shadow-md transition-all border-slate-200 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          Chapter {chapter.chapterNumber}
                        </span>
                        {chapter.weightage && (
                          <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Award className="h-3.5 w-3.5 mr-1" /> {chapter.weightage}% Exam Weightage
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{chapter.title}</h2>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {chapter.description || 'Theory concepts, key formulas, and topic-wise practice exercises.'}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1 text-slate-400" />
                          {chapter.topicCount ?? 0} Topics
                        </span>
                        {chapter.estimatedHours && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-slate-400" />
                            {chapter.estimatedHours} hrs
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/chapters/${chapter._id}`}
                        className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        View Topics <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Pagination pagination={chaptersData.pagination} onPageChange={handlePageChange} />
            </>
          )}

          {!isChaptersLoading && chaptersData && chaptersData.items.length === 0 && (
            <EmptyState
              title="No Chapters Available"
              description="There are currently no chapters available under this subject."
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
