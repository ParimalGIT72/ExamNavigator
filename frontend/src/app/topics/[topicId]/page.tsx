'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, Video, File, Award, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useTopicQuery, useResourcesQuery, useChapterQuery, useSubjectQuery } from '@/hooks/useAcademic';
import { ResourceType, IAcademicQueryParams } from '@/types';

export default function TopicDetailPage() {
  const params = useParams();
  const topicId = (params.topicId as string) || '';

  const [queryParams, setQueryParams] = useState<IAcademicQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    resourceType: undefined,
  });

  const { data: topic, isLoading: isTopicLoading } = useTopicQuery(topicId);
  const { data: resourcesData, isLoading: isResourcesLoading, isError, error, refetch } = useResourcesQuery(topicId, queryParams);

  // Resolve parent Chapter & Subject context
  const parentChapterId = typeof topic?.chapterId === 'object' ? topic.chapterId._id : topic?.chapterId || '';
  const parentChapterTitle = typeof topic?.chapterId === 'object' ? topic.chapterId.title : undefined;

  const parentSubjectId = typeof topic?.subjectId === 'object' ? topic.subjectId._id : topic?.subjectId || '';
  const parentSubjectName = typeof topic?.subjectId === 'object' ? topic.subjectId.name : undefined;

  const { data: parentChapter } = useChapterQuery(parentChapterId);
  const { data: parentSubject } = useSubjectQuery(parentSubjectId);

  const chapterTitle = parentChapterTitle || parentChapter?.title || 'Chapter';
  const subjectTitle = parentSubjectName || parentSubject?.name || 'Subject';

  const handleSearchChange = (search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleResourceTypeChange = (val: string) => {
    setQueryParams((prev) => ({
      ...prev,
      resourceType: val ? (val as ResourceType) : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'Video':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'FormulaSheet':
        return <Award className="h-5 w-5 text-amber-500" />;
      default:
        return <File className="h-5 w-5 text-brand-500" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Breadcrumb Hierarchy */}
          <Breadcrumb
            items={[
              { label: 'My Subjects', href: '/subjects' },
              { label: subjectTitle, href: parentSubjectId ? `/subjects/${parentSubjectId}` : undefined },
              { label: chapterTitle, href: parentChapterId ? `/chapters/${parentChapterId}` : undefined },
              { label: topic?.title || 'Topic Detail' },
            ]}
          />

          {/* Topic Header Banner */}
          {isTopicLoading ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : (
            topic && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      Topic {topic.topicNumber}
                    </span>
                    <Badge variant={topic.difficultyLevel === 'Hard' ? 'danger' : topic.difficultyLevel === 'Medium' ? 'warning' : 'success'}>
                      {topic.difficultyLevel}
                    </Badge>
                  </div>
                  {topic.importanceScore && (
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                      Importance: {topic.importanceScore}/10
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{topic.title}</h1>

                {topic.summary && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm leading-relaxed">
                    <h2 className="font-semibold text-slate-900 mb-1 text-xs uppercase tracking-wider">Topic Summary</h2>
                    <p>{topic.summary}</p>
                  </div>
                )}

                {topic.tags && topic.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {topic.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* Search & Resource Type Filter */}
          <SearchFilterBar
            searchPlaceholder="Search resources by title or author..."
            onSearchChange={handleSearchChange}
            filters={[
              {
                name: 'Filter by Resource Type',
                key: 'resourceType',
                value: queryParams.resourceType || '',
                options: [
                  { label: 'All Resource Types', value: '' },
                  { label: 'PDF Documents', value: 'PDF' },
                  { label: 'Video Tutorials', value: 'Video' },
                  { label: 'Study Notes', value: 'Notes' },
                  { label: 'Formula Sheets', value: 'FormulaSheet' },
                  { label: 'Other', value: 'Other' },
                ],
                onChange: handleResourceTypeChange,
              },
            ]}
          />

          {/* Error Banner with Retry */}
          {isError && (
            <div className="space-y-3">
              <Alert
                variant="error"
                title="Failed to Load Resources"
                message={error?.message || 'Network error occurred while fetching resources.'}
              />
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
              </button>
            </div>
          )}

          {/* Resources List */}
          {isResourcesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isResourcesLoading && resourcesData && resourcesData.items.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resourcesData.items.map((resource) => (
                  <Card key={resource._id} className="hover:shadow-md transition-all border-slate-200 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-slate-100 rounded-lg">{getResourceIcon(resource.resourceType)}</div>
                          <Badge variant="gray">{resource.resourceType}</Badge>
                        </div>
                        {resource.author && (
                          <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                            By {resource.author}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{resource.title}</h2>
                      {resource.textContent && (
                        <p className="text-slate-600 text-sm mt-2 line-clamp-3 leading-relaxed font-mono text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                          {resource.textContent}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/resources/${resource._id}`}
                        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Details
                      </Link>

                      {resource.contentUrl && (
                        <a
                          href={resource.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Open / Download
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Pagination pagination={resourcesData.pagination} onPageChange={handlePageChange} />
            </>
          )}

          {!isResourcesLoading && resourcesData && resourcesData.items.length === 0 && (
            <EmptyState
              title="No Learning Resources Available"
              description="There are currently no learning resources available for this topic."
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
