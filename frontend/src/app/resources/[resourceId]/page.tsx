'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, Download, User, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useResourceQuery, useTopicQuery, useChapterQuery, useSubjectQuery } from '@/hooks/useAcademic';

export default function ResourceDetailPage() {
  const params = useParams();
  const resourceId = (params.resourceId as string) || '';

  const { data: resource, isLoading, isError, error, refetch } = useResourceQuery(resourceId);

  // Resolve parent Topic, Chapter, and Subject context for complete breadcrumb chain
  const parentTopicId = typeof resource?.topicId === 'object' ? resource.topicId._id : resource?.topicId || '';
  const parentTopicTitle = typeof resource?.topicId === 'object' ? resource.topicId.title : undefined;

  const parentChapterId = typeof resource?.chapterId === 'object' ? resource.chapterId._id : resource?.chapterId || '';
  const parentChapterTitle = typeof resource?.chapterId === 'object' ? resource.chapterId.title : undefined;

  const parentSubjectId = typeof resource?.subjectId === 'object' ? resource.subjectId._id : resource?.subjectId || '';
  const parentSubjectName = typeof resource?.subjectId === 'object' ? resource.subjectId.name : undefined;

  const { data: parentTopic } = useTopicQuery(parentTopicId);
  const { data: parentChapter } = useChapterQuery(parentChapterId);
  const { data: parentSubject } = useSubjectQuery(parentSubjectId);

  const topicTitle = parentTopicTitle || parentTopic?.title || 'Topic';
  const chapterTitle = parentChapterTitle || parentChapter?.title || 'Chapter';
  const subjectTitle = parentSubjectName || parentSubject?.name || 'Subject';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Complete Breadcrumb Hierarchy */}
          <Breadcrumb
            items={[
              { label: 'My Subjects', href: '/subjects' },
              { label: subjectTitle, href: parentSubjectId ? `/subjects/${parentSubjectId}` : undefined },
              { label: chapterTitle, href: parentChapterId ? `/chapters/${parentChapterId}` : undefined },
              { label: topicTitle, href: parentTopicId ? `/topics/${parentTopicId}` : undefined },
              { label: resource?.title || 'Resource Detail' },
            ]}
          />

          {/* Error Banner with Retry */}
          {isError && (
            <div className="space-y-3">
              <Alert
                variant="error"
                title="Failed to Load Resource"
                message={error?.message || 'Network error occurred while loading resource details.'}
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
            <Card className="p-8 space-y-6 bg-white">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-40 w-full" />
            </Card>
          )}

          {/* Resource Content View */}
          {!isLoading && resource && (
            <Card className="p-6 sm:p-10 space-y-8 shadow-md bg-white">
              {/* Header Info */}
              <div className="border-b border-slate-200 pb-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="brand">{resource.resourceType}</Badge>
                  {resource.createdAt && (
                    <span className="flex items-center text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      Uploaded {new Date(resource.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{resource.title}</h1>

                {resource.author && (
                  <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg w-fit border border-slate-200">
                    <User className="h-4 w-4 mr-2 text-brand-600" /> Author / Instructor: {resource.author}
                  </div>
                )}
              </div>

              {/* Text Content */}
              {resource.textContent ? (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Resource Content / Notes</h2>
                  <div className="p-6 bg-slate-900 text-slate-100 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    {resource.textContent}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">This resource consists of an external document file or media link.</p>
                </div>
              )}

              {/* Download / External Link Actions */}
              {resource.contentUrl && (
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 truncate max-w-full">
                    External URL: <span className="font-mono text-slate-700">{resource.contentUrl}</span>
                  </div>

                  <a href={resource.contentUrl} target="_blank" rel="noreferrer">
                    <Button variant="primary" size="md">
                      <Download className="h-4 w-4 mr-2" /> Open / Download File <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
                    </Button>
                  </a>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
