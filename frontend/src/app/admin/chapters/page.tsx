'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ChapterForm } from '@/components/academic/ChapterForm';
import {
  useSubjectsQuery,
  useChaptersQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} from '@/hooks/useAcademic';
import { IAcademicQueryParams, IChapter } from '@/types';

export default function AdminChaptersPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [params, setParams] = useState<IAcademicQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<IChapter | null>(null);
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null);

  const { data: subjectsData } = useSubjectsQuery({ limit: 100 });
  const subjects = subjectsData?.items || [];

  const { data, isLoading, isError, error } = useChaptersQuery(
    selectedSubjectId || (subjects.length > 0 ? subjects[0]._id : ''),
    params
  );

  const createMutation = useCreateChapterMutation();
  const updateMutation = useUpdateChapterMutation();
  const deleteMutation = useDeleteChapterMutation();

  const handleSearchChange = (search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleOpenCreate = () => {
    setEditingChapter(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (chapter: IChapter) => {
    setEditingChapter(chapter);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (editingChapter) {
      updateMutation.mutate(
        { chapterId: editingChapter._id, data: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingChapter(null);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingChapterId) {
      deleteMutation.mutate(deletingChapterId, {
        onSuccess: () => {
          setDeletingChapterId(null);
        },
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-brand-600 font-semibold text-sm">
                <Layers className="h-5 w-5" />
                <span>Admin Academic Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Chapters Management</h1>
              <p className="text-slate-600 text-sm mt-1">Create, edit, and organize chapter curricula under subjects.</p>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/admin/topics">
                <Button variant="outline" size="sm">Manage Topics →</Button>
              </Link>
              <Button variant="primary" size="md" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Chapter
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <SearchFilterBar
            searchPlaceholder="Search by chapter title..."
            onSearchChange={handleSearchChange}
            filters={[
              {
                name: 'Select Subject',
                key: 'subjectFilter',
                value: selectedSubjectId || (subjects.length > 0 ? subjects[0]._id : ''),
                options: subjects.map((s) => ({ label: `${s.name} (${s.examType})`, value: s._id })),
                onChange: (val) => setSelectedSubjectId(val),
              },
            ]}
          />

          {/* Error Banner */}
          {isError && (
            <Alert variant="error" title="Failed to Load Chapters" message={error?.message || 'Network error occurred.'} />
          )}

          {/* Loading Skeleton */}
          {isLoading && <SkeletonTable rows={5} />}

          {/* Chapters Table */}
          {!isLoading && data && data.items.length > 0 && (
            <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Ch. No</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Weightage</th>
                      <th className="px-6 py-4">Est. Hours</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.items.map((chapter) => (
                      <tr key={chapter._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">Ch {chapter.chapterNumber}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          <div>{chapter.title}</div>
                          {chapter.description && (
                            <div className="text-xs text-slate-500 font-normal truncate max-w-xs">{chapter.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {chapter.weightage ? `${chapter.weightage}%` : '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {chapter.estimatedHours ? `${chapter.estimatedHours} hrs` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {chapter.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="gray">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(chapter)}
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Chapter"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingChapterId(chapter._id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Chapter"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination pagination={data.pagination} onPageChange={handlePageChange} />
            </Card>
          )}

          {!isLoading && data && data.items.length === 0 && (
            <EmptyState
              title="No Chapters Found"
              description="No chapters exist under the selected subject. Click below to add a chapter."
              actionText="Add New Chapter"
              onAction={handleOpenCreate}
            />
          )}

          {/* Modal Form */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                  {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                </h3>
                <ChapterForm
                  initialData={editingChapter}
                  subjects={subjects}
                  defaultSubjectId={selectedSubjectId}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setIsModalOpen(false)}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          <ConfirmDialog
            isOpen={!!deletingChapterId}
            title="Delete Chapter?"
            message="Are you sure you want to soft delete this chapter?"
            confirmText="Yes, Delete"
            isLoading={deleteMutation.isPending}
            onConfirm={handleConfirmDelete}
            onClose={() => setDeletingChapterId(null)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
