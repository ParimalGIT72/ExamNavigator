'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, Search, Filter, RefreshCw, BookOpen, Layers } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSubjectQuery, useChaptersQuery, useResourcesQuery } from '@/hooks/useAcademic';
import { FormulaSheetCard } from '@/components/quick-revision/FormulaSheetCard';
import { LastMinuteRevisionModal } from '@/components/quick-revision/LastMinuteRevisionModal';

export default function SubjectQuickRevisionPage() {
  const params = useParams();
  const subjectId = (params.subjectId as string) || '';

  const { data: subject, isLoading: subjectLoading, isError: subjectError, error: subjectErr, refetch: refetchSubject } = useSubjectQuery(subjectId);
  const { data: chaptersData, isLoading: chaptersLoading } = useChaptersQuery(subjectId);
  const { data: resourcesData, isLoading: resourcesLoading, isError: resourcesError, error: resourcesErr, refetch: refetchResources } = useResourcesQuery({
    subjectId,
    resourceType: 'FormulaSheet',
  });

  const [selectedChapterId, setSelectedChapterId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);

  const chapters = useMemo(() => chaptersData?.items || [], [chaptersData]);
  const allFormulaSheets = useMemo(() => resourcesData?.items || [], [resourcesData]);

  // Filter formula sheets by chapter and search query
  const filteredSheets = useMemo(() => {
    return allFormulaSheets.filter((sheet) => {
      // Chapter filter
      if (selectedChapterId !== 'ALL') {
        const chId = typeof sheet.chapterId === 'object' ? sheet.chapterId._id : sheet.chapterId;
        if (chId !== selectedChapterId) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = sheet.title.toLowerCase().includes(query);
        const textMatch = (sheet.textContent || '').toLowerCase().includes(query);
        const authorMatch = (sheet.author || '').toLowerCase().includes(query);
        return titleMatch || textMatch || authorMatch;
      }

      return true;
    });
  }, [allFormulaSheets, selectedChapterId, searchQuery]);

  // Group filtered sheets by Chapter
  const groupedByChapter = useMemo(() => {
    const map = new Map<string, { chapterTitle: string; sheets: typeof filteredSheets }>();

    filteredSheets.forEach((sheet) => {
      const chId = typeof sheet.chapterId === 'object' ? sheet.chapterId._id : sheet.chapterId || 'general';
      const chTitle = typeof sheet.chapterId === 'object' ? sheet.chapterId.title : chapters.find((c) => c._id === chId)?.title || 'General Revision';

      if (!map.has(chId)) {
        map.set(chId, { chapterTitle: chTitle, sheets: [] });
      }
      map.get(chId)?.sheets.push(sheet);
    });

    return Array.from(map.entries()).map(([chId, val]) => ({
      chapterId: chId,
      chapterTitle: val.chapterTitle,
      sheets: val.sheets,
    }));
  }, [filteredSheets, chapters]);

  return (
    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
      <StudentLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Breadcrumb
            items={[
              { label: 'My Subjects', href: '/subjects' },
              { label: 'Quick Revision', href: '/quick-revision' },
              { label: subject?.name || 'Subject Formula Sheets' },
            ]}
          />

          {/* Subject Quick Revision Header */}
          {subjectLoading ? (
            <Card className="p-8 space-y-4 bg-white">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ) : subject ? (
            <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
                  <Badge variant="warning">{subject.examType || 'Curriculum'}</Badge>
                  <span>{subject.code}</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">{subject.name} — Formula Sheets</h1>
                <p className="text-amber-100 text-sm mt-2 max-w-xl leading-relaxed">
                  {subject.description || 'High-priority formula sheets and concise equations for quick exam revision.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsRevisionModalOpen(true)}
                  disabled={allFormulaSheets.length === 0}
                  className="bg-white text-slate-950 hover:bg-amber-100 font-bold shadow-md transition-all border-none"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-amber-600" /> Start Last-Minute Revision
                </Button>
              </div>
            </div>
          ) : null}

          {/* Subject Error Banner */}
          {subjectError && (
            <Alert
              variant="error"
              title="Subject Access Error"
              message={subjectErr?.message || 'Unable to load subject details or access denied.'}
            />
          )}

          {/* Search & Chapter Filters Bar */}
          <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search formula title or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-slate-500 hidden sm:inline-block" />
                <select
                  aria-label="Filter by Chapter"
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium w-full sm:w-64"
                >
                  <option value="ALL">All Chapters ({chapters.length})</option>
                  {chapters.map((ch) => (
                    <option key={ch._id} value={ch._id}>
                      Ch {ch.chapterNumber}: {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Error Banner for Resources */}
          {resourcesError && (
            <div className="space-y-3">
              <Alert
                variant="error"
                title="Failed to Load Formula Sheets"
                message={resourcesErr?.message || 'Error occurred while retrieving formula resources.'}
              />
              <button
                onClick={() => refetchResources()}
                className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {resourcesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Grouped Formula Sheets List */}
          {!resourcesLoading && groupedByChapter.length > 0 && (
            <div className="space-y-8">
              {groupedByChapter.map((group) => (
                <div key={group.chapterId} className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-slate-900">{group.chapterTitle}</h3>
                    <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                      {group.sheets.length} formula sheet{group.sheets.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.sheets.map((sheet) => (
                      <FormulaSheetCard
                        key={sheet._id}
                        resource={sheet}
                        subjectId={subjectId}
                        chapterTitle={group.chapterTitle}
                        topicTitle={typeof sheet.topicId === 'object' ? sheet.topicId.title : undefined}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!resourcesLoading && filteredSheets.length === 0 && (
            <EmptyState
              title="No Formula Sheets Found"
              description={
                searchQuery || selectedChapterId !== 'ALL'
                  ? 'No formula sheets match your selected filters.'
                  : 'No formula sheets available for this subject yet.'
              }
            />
          )}

          {/* Last Minute Revision Player Modal */}
          <LastMinuteRevisionModal
            isOpen={isRevisionModalOpen}
            onClose={() => setIsRevisionModalOpen(false)}
            subjectTitle={subject?.name || 'Subject'}
            sheets={filteredSheets}
          />
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
