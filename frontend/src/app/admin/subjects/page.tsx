'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
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
import { SubjectForm } from '@/components/academic/SubjectForm';
import {
  useSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from '@/hooks/useAcademic';
import { ExamType, IAcademicQueryParams, ISubject } from '@/types';

export default function AdminSubjectsPage() {
  const [params, setParams] = useState<IAcademicQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ISubject | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useSubjectsQuery(params);
  const createMutation = useCreateSubjectMutation();
  const updateMutation = useUpdateSubjectMutation();
  const deleteMutation = useDeleteSubjectMutation();

  const handleSearchChange = (search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleExamTypeFilter = (val: string) => {
    setParams((prev) => ({
      ...prev,
      examType: val ? (val as ExamType) : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: ISubject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (editingSubject) {
      updateMutation.mutate(
        { subjectId: editingSubject._id, data: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingSubject(null);
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
    if (deletingSubjectId) {
      deleteMutation.mutate(deletingSubjectId, {
        onSuccess: () => {
          setDeletingSubjectId(null);
        },
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Admin Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-brand-600 font-semibold text-sm">
                <BookOpen className="h-5 w-5" />
                <span>Admin Academic Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Subjects Management</h1>
              <p className="text-slate-600 text-sm mt-1">Create, edit, search, and manage subjects for competitive exams.</p>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/admin/chapters">
                <Button variant="outline" size="sm">Manage Chapters →</Button>
              </Link>
              <Button variant="primary" size="md" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Subject
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <SearchFilterBar
            searchPlaceholder="Search by subject name or code..."
            onSearchChange={handleSearchChange}
            filters={[
              {
                name: 'Exam Filter',
                key: 'examType',
                value: params.examType || '',
                options: [
                  { label: 'All Exam Types', value: '' },
                  { label: 'JEE', value: 'JEE' },
                  { label: 'NEET', value: 'NEET' },
                  { label: 'MHT-CET', value: 'MHT-CET' },
                  { label: 'University', value: 'University' },
                  { label: 'Other', value: 'Other' },
                ],
                onChange: handleExamTypeFilter,
              },
            ]}
          />

          {/* Error Banner */}
          {isError && (
            <Alert variant="error" title="Failed to Load Subjects" message={error?.message || 'Network error occurred.'} />
          )}

          {/* Loading Skeleton */}
          {isLoading && <SkeletonTable rows={6} />}

          {/* Subjects Data Table */}
          {!isLoading && data && data.items.length > 0 && (
            <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Target Exam</th>
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.items.map((subject) => (
                      <tr key={subject._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          <div>{subject.name}</div>
                          {subject.description && (
                            <div className="text-xs text-slate-500 font-normal truncate max-w-xs">{subject.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{subject.code}</td>
                        <td className="px-6 py-4">
                          <Badge variant="brand">{subject.examType}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{subject.order}</td>
                        <td className="px-6 py-4">
                          {subject.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="gray">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(subject)}
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Subject"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSubjectId(subject._id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Subject"
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
              title="No Subjects Found"
              description="No subjects exist matching your criteria. Click below to add your first subject."
              actionText="Add New Subject"
              onAction={handleOpenCreate}
            />
          )}

          {/* Modal Form */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </h3>
                <SubjectForm
                  initialData={editingSubject}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setIsModalOpen(false)}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={!!deletingSubjectId}
            title="Delete Subject?"
            message="Are you sure you want to soft delete this subject? Chapters and topics under this subject will remain intact."
            confirmText="Yes, Delete"
            isLoading={deleteMutation.isPending}
            onConfirm={handleConfirmDelete}
            onClose={() => setDeletingSubjectId(null)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
