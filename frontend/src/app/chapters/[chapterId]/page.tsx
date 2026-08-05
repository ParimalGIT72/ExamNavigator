'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Layers, FileText, ChevronRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { useChapterQuery, useTopicsQuery } from '@/hooks/useAcademic';
import { DifficultyLevel, IAcademicQueryParams } from '@/types';

export default function ChapterDetailPage() {
  const params = useParams();
  const chapterId = (params.chapterId as string) || '';

  const [queryParams, setQueryParams] = useState<IAcademicQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    difficultyLevel: undefined,
  });

  const { data: chapter, isLoading: isChapterLoading } = useChapterQuery(chapterId);
  const { data: topicsData, isLoading: isTopicsLoading, isError, error } = useTopicsQuery(chapterId, queryParams);

  const handleSearchChange = (search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleDifficultyChange = (val: string) => {
    setQueryParams((prev) => ({
      ...prev,
      difficultyLevel: val ? (val as DifficultyLevel) : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const getDifficultyBadge = (level: DifficultyLevel) => {
    switch (level) {
      case 'Easy':
        return <Badge variant="success">Easy</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'Hard':
        return <Badge variant="danger">Hard</Badge>;
      default:
        return <Badge variant="gray">{level}</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Link href="/subjects" className="hover:text-brand-600 font-medium transition-colors">
              Subjects
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{chapter?.title || 'Chapter Details'}</span>
          </div>

          {/* Chapter Header Banner */}
          {isChapterLoading ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : (
            chapter && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Chapter {chapter.chapterNumber}
                    </span>
                    {chapter.weightage && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {chapter.weightage}% Exam Weightage
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{chapter.title}</h1>
                  <p className="text-slate-600 text-sm mt-2 max-w-3xl leading-relaxed">
                    {chapter.description || 'Individual learning topics and formula modules for this chapter.'}
                  </p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-slate-900">{topicsData?.pagination.total || 0}</div>
                    <div className="text-xs text-slate-500 font-medium">Topics</div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Search & Difficulty Filter */}
          <SearchFilterBar
            searchPlaceholder="Search topics by title or summary..."
            onSearchChange={handleSearchChange}
            filters={[
              {
                name: 'Filter by Difficulty',
                key: 'difficultyLevel',
                value: queryParams.difficultyLevel || '',
                options: [
                  { label: 'All Difficulty Levels', value: '' },
                  { label: 'Easy', value: 'Easy' },
                  { label: 'Medium', value: 'Medium' },
                  { label: 'Hard', value: 'Hard' },
                ],
                onChange: handleDifficultyChange,
              },
            ]}
          />

          {/* Error Banner */}
          {isError && (
            <Alert variant="error" title="Failed to Load Topics" message={error?.message || 'Network error occurred.'} />
          )}

          {/* Topics Grid */}
          {isTopicsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isTopicsLoading && topicsData && topicsData.items.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topicsData.items.map((topic) => (
                  <Card key={topic._id} className="hover:shadow-md transition-all border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          Topic {topic.topicNumber}
                        </span>
                        {getDifficultyBadge(topic.difficultyLevel)}
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{topic.title}</h2>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {topic.summary || 'Essential derivations, study notes, and learning resources.'}
                      </p>

                      {topic.tags && topic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {topic.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <FileText className="h-4 w-4 mr-1 text-slate-400" />
                        <span>{topic.resourceCount ?? 0} Resources</span>
                      </div>

                      <Link
                        href={`/topics/${topic._id}`}
                        className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        Study Topic <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Pagination pagination={topicsData.pagination} onPageChange={handlePageChange} />
            </>
          )}

          {!isTopicsLoading && topicsData && topicsData.items.length === 0 && (
            <EmptyState
              title="No Topics Found"
              description="There are currently no topics matching your filter under this chapter."
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
