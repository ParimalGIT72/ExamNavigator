'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';
import {
  useResourceQuery,
  useResourcesQuery,
  useTopicQuery,
  useChapterQuery,
  useSubjectQuery,
} from '@/hooks/useAcademic';
import { FormulaSheetViewer } from '@/components/quick-revision/FormulaSheetViewer';

export default function DedicatedFormulaSheetViewerPage() {
  const params = useParams();
  const router = useRouter();

  const subjectId = (params.subjectId as string) || '';
  const resourceId = (params.resourceId as string) || '';

  // Fetch current resource
  const { data: resource, isLoading, isError, error, refetch } = useResourceQuery(resourceId);

  // Fetch subject-level formula sheets for Previous / Next bounded navigation
  const { data: allSheetsData } = useResourcesQuery({
    subjectId,
    resourceType: 'FormulaSheet',
  });

  // Resolve parent Topic, Chapter, and Subject context for 5-level breadcrumb chain
  const parentTopicId = typeof resource?.topicId === 'object' ? resource.topicId._id : resource?.topicId || '';
  const parentTopicTitle = typeof resource?.topicId === 'object' ? resource.topicId.title : undefined;

  const parentChapterId = typeof resource?.chapterId === 'object' ? resource.chapterId._id : resource?.chapterId || '';
  const parentChapterTitle = typeof resource?.chapterId === 'object' ? resource.chapterId.title : undefined;

  const parentSubjectId = typeof resource?.subjectId === 'object' ? resource.subjectId._id : resource?.subjectId || subjectId;
  const parentSubjectName = typeof resource?.subjectId === 'object' ? resource.subjectId.name : undefined;

  const { data: parentTopic } = useTopicQuery(parentTopicId);
  const { data: parentChapter } = useChapterQuery(parentChapterId);
  const { data: parentSubject } = useSubjectQuery(parentSubjectId);

  const topicTitle = parentTopicTitle || parentTopic?.title || 'Topic';
  const chapterTitle = parentChapterTitle || parentChapter?.title || 'Chapter';
  const subjectTitle = parentSubjectName || parentSubject?.name || 'Subject';

  // Calculate Previous and Next resource indices
  const allSheets = useMemo(() => allSheetsData?.items || [], [allSheetsData]);
  const currentIndex = useMemo(
    () => allSheets.findIndex((s) => s._id === resourceId),
    [allSheets, resourceId]
  );

  const previousResource = currentIndex > 0 ? allSheets[currentIndex - 1] : null;
  const nextResource = currentIndex >= 0 && currentIndex < allSheets.length - 1 ? allSheets[currentIndex + 1] : null;

  const handlePrevious = () => {
    if (previousResource) {
      router.push(`/quick-revision/${subjectId}/sheet/${previousResource._id}`);
    }
  };

  const handleNext = () => {
    if (nextResource) {
      router.push(`/quick-revision/${subjectId}/sheet/${nextResource._id}`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
      <StudentLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Complete 5-Level Breadcrumb Hierarchy */}
          <Breadcrumb
            items={[
              { label: 'My Subjects', href: '/subjects' },
              { label: 'Quick Revision', href: '/quick-revision' },
              { label: subjectTitle, href: `/quick-revision/${subjectId}` },
              { label: chapterTitle, href: parentChapterId ? `/chapters/${parentChapterId}` : undefined },
              { label: resource?.title || 'Formula Sheet' },
            ]}
          />

          {/* Error Banner with Retry */}
          {isError && (
            <div className="space-y-3">
              <Alert
                variant="error"
                title="Failed to Load Formula Sheet"
                message={error?.message || 'Access denied or error occurred while loading formula sheet.'}
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
            <Card className="p-8 space-y-6 bg-white">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-48 w-full" />
            </Card>
          )}

          {/* Formula Sheet Viewer */}
          {!isLoading && resource && (
            <FormulaSheetViewer
              resource={resource}
              subjectTitle={subjectTitle}
              chapterTitle={chapterTitle}
              topicTitle={topicTitle}
              hasPrevious={!!previousResource}
              hasNext={!!nextResource}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          )}
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
