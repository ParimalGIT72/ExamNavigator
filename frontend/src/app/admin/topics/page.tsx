'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
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
import { TopicForm } from '@/components/academic/TopicForm';
import {
  useSubjectsQuery,
  useChaptersQuery,
  useTopicsQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} from '@/hooks/useAcademic';
import { DifficultyLevel, IAcademicQueryParams, ITopic } from '@/types';

export default function AdminTopicsPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [params, setParams] = useState<IAcademicQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<ITopic | null>(null);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  const { data: subjectsData } = useSubjectsQuery({ limit: 100 });
  const subjects = subjectsData?.items || [];
  const currentSubjectId = selectedSubjectId || (subjects.length > 0 ? subjects[0]._id : '');

  const { data: chaptersData } = useChaptersQuery(currentSubjectId, { limit: 100 });
  const chapters = chaptersData?.items || [];
  const currentChapterId = selectedChapterId || (chapters.length > 0 ? chapters[0]._id : '');

  const { data, isLoading, isError, error } = useTopicsQuery(currentChapterId, params);

  const createMutation = useCreateTopicMutation();
  const updateMutation = useUpdateTopicMutation();
  const deleteMutation = useDeleteTopicMutation();

  const handleSearchChange = (search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleOpenCreate = () => {
    setEditingTopic(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (topic: ITopic) => {
    setEditingTopic(topic);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (editingTopic) {
      updateMutation.mutate(
        { topicId: editingTopic._id, data: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingTopic(null);
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
    if (deletingTopicId) {
      deleteMutation.mutate(deletingTopicId, {
        onSuccess: () => {
          setDeletingTopicId(null);
        },
      });
    }
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
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-brand-600 font-semibold text-sm">
                <FileText className="h-5 w-5" />
                <span>Admin Academic Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Topics Management</h1>
              <p className="text-slate-600 text-sm mt-1">Create, edit, and categorize learning topics under chapters.</p>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/admin/resources">
                <Button variant="outline" size="sm">Manage Resources →</Button>
              </Link>
              <Button variant="primary" size="md" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Topic
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <SearchFilterBar
            searchPlaceholder="Search by topic title..."
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
                },
              },
              {
                name: 'Chapter',
                key: 'chapterFilter',
                value: currentChapterId,
                options: chapters.map((c) => ({ label: `Ch ${c.chapterNumber}: ${c.title}`, value: c._id })),
                onChange: (val) => setSelectedChapterId(val),
              },
            ]}
          />

          {/* Error Banner */}
          {isError && (
            <Alert variant="error" title="Failed to Load Topics" message={error?.message || 'Network error occurred.'} />
          )}

          {/* Loading Skeleton */}
          {isLoading && <SkeletonTable rows={5} />}

          {/* Topics Table */}
          {!isLoading && data && data.items.length > 0 && (
            <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">No.</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4">Importance</th>
                      <th className="px-6 py-4">Tags</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.items.map((topic) => (
                      <tr key={topic._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">Topic {topic.topicNumber}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          <div>{topic.title}</div>
                          {topic.summary && (
                            <div className="text-xs text-slate-500 font-normal truncate max-w-xs">{topic.summary}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">{getDifficultyBadge(topic.difficultyLevel)}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{topic.importanceScore || 5}/10</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {topic.tags?.slice(0, 2).map((t, i) => (
                              <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(topic)}
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Topic"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTopicId(topic._id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Topic"
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
              title="No Topics Found"
              description="No topics exist under the selected chapter. Click below to add a topic."
              actionText="Add New Topic"
              onAction={handleOpenCreate}
            />
          )}

          {/* Modal Form */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                  {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                </h3>
                <TopicForm
                  initialData={editingTopic}
                  subjects={subjects}
                  chapters={chapters}
                  defaultChapterId={currentChapterId}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setIsModalOpen(false)}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          <ConfirmDialog
            isOpen={!!deletingTopicId}
            title="Delete Topic?"
            message="Are you sure you want to soft delete this topic?"
            confirmText="Yes, Delete"
            isLoading={deleteMutation.isPending}
            onConfirm={handleConfirmDelete}
            onClose={() => setDeletingTopicId(null)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
