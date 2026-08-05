'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FileCode, ExternalLink } from 'lucide-react';
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
import { ResourceForm } from '@/components/academic/ResourceForm';
import {
  useSubjectsQuery,
  useChaptersQuery,
  useTopicsQuery,
  useResourcesQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} from '@/hooks/useAcademic';
import { IAcademicQueryParams, ILearningResource, ResourceType } from '@/types';

export default function AdminResourcesPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [params, setParams] = useState<IAcademicQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ILearningResource | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

  const { data: subjectsData } = useSubjectsQuery({ limit: 100 });
  const subjects = subjectsData?.items || [];
  const currentSubjectId = selectedSubjectId || (subjects.length > 0 ? subjects[0]._id : '');

  const { data: chaptersData } = useChaptersQuery(currentSubjectId, { limit: 100 });
  const chapters = chaptersData?.items || [];
  const currentChapterId = selectedChapterId || (chapters.length > 0 ? chapters[0]._id : '');

  const { data: topicsData } = useTopicsQuery(currentChapterId, { limit: 100 });
  const topics = topicsData?.items || [];
  const currentTopicId = selectedTopicId || (topics.length > 0 ? topics[0]._id : '');

  const { data, isLoading, isError, error } = useResourcesQuery(currentTopicId, params);

  const createMutation = useCreateResourceMutation();
  const updateMutation = useUpdateResourceMutation();
  const deleteMutation = useDeleteResourceMutation();

  const handleSearchChange = (search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleResourceTypeFilter = (val: string) => {
    setParams((prev) => ({
      ...prev,
      resourceType: val ? (val as ResourceType) : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleOpenCreate = () => {
    setEditingResource(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (resource: ILearningResource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (editingResource) {
      updateMutation.mutate(
        { resourceId: editingResource._id, data: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingResource(null);
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
    if (deletingResourceId) {
      deleteMutation.mutate(deletingResourceId, {
        onSuccess: () => {
          setDeletingResourceId(null);
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
                <FileCode className="h-5 w-5" />
                <span>Admin Academic Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Learning Resources Management</h1>
              <p className="text-slate-600 text-sm mt-1">Upload, edit, and link PDFs, study notes, videos, and formula sheets.</p>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/admin/subjects">
                <Button variant="outline" size="sm">Back to Subjects →</Button>
              </Link>
              <Button variant="primary" size="md" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Resource
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <SearchFilterBar
            searchPlaceholder="Search by resource title..."
            onSearchChange={handleSearchChange}
            filters={[
              {
                name: 'Subject',
                key: 'subjectFilter',
                value: currentSubjectId,
                options: subjects.map((s) => ({ label: s.name, value: s._id })),
                onChange: (val) => {
                  setSelectedSubjectId(val);
                  setSelectedChapterId('');
                  setSelectedTopicId('');
                },
              },
              {
                name: 'Chapter',
                key: 'chapterFilter',
                value: currentChapterId,
                options: chapters.map((c) => ({ label: c.title, value: c._id })),
                onChange: (val) => {
                  setSelectedChapterId(val);
                  setSelectedTopicId('');
                },
              },
              {
                name: 'Topic',
                key: 'topicFilter',
                value: currentTopicId,
                options: topics.map((t) => ({ label: t.title, value: t._id })),
                onChange: (val) => setSelectedTopicId(val),
              },
              {
                name: 'Resource Type',
                key: 'typeFilter',
                value: params.resourceType || '',
                options: [
                  { label: 'All Types', value: '' },
                  { label: 'PDF', value: 'PDF' },
                  { label: 'Video', value: 'Video' },
                  { label: 'Notes', value: 'Notes' },
                  { label: 'Formula Sheet', value: 'FormulaSheet' },
                ],
                onChange: handleResourceTypeFilter,
              },
            ]}
          />

          {/* Error Banner */}
          {isError && (
            <Alert variant="error" title="Failed to Load Resources" message={error?.message || 'Network error occurred.'} />
          )}

          {/* Loading Skeleton */}
          {isLoading && <SkeletonTable rows={5} />}

          {/* Resources Table */}
          {!isLoading && data && data.items.length > 0 && (
            <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Content / Link</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.items.map((resource) => (
                      <tr key={resource._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          <div>{resource.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="brand">{resource.resourceType}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{resource.author || '-'}</td>
                        <td className="px-6 py-4">
                          {resource.contentUrl ? (
                            <a
                              href={resource.contentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center"
                            >
                              URL <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ) : resource.textContent ? (
                            <span className="text-xs text-slate-500 font-mono">Text Content</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(resource)}
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Resource"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingResourceId(resource._id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Resource"
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
              title="No Learning Resources Found"
              description="No resources exist under the selected topic. Click below to add a resource."
              actionText="Add New Resource"
              onAction={handleOpenCreate}
            />
          )}

          {/* Modal Form */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                  {editingResource ? 'Edit Learning Resource' : 'Add Learning Resource'}
                </h3>
                <ResourceForm
                  initialData={editingResource}
                  subjects={subjects}
                  chapters={chapters}
                  topics={topics}
                  defaultTopicId={currentTopicId}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setIsModalOpen(false)}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          <ConfirmDialog
            isOpen={!!deletingResourceId}
            title="Delete Learning Resource?"
            message="Are you sure you want to soft delete this learning resource?"
            confirmText="Yes, Delete"
            isLoading={deleteMutation.isPending}
            onConfirm={handleConfirmDelete}
            onClose={() => setDeletingResourceId(null)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
