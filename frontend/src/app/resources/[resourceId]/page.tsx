'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, Download, User, Calendar, ExternalLink } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { useResourceQuery } from '@/hooks/useAcademic';

export default function ResourceDetailPage() {
  const params = useParams();
  const resourceId = (params.resourceId as string) || '';

  const { data: resource, isLoading, isError, error } = useResourceQuery(resourceId);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Link href="/subjects" className="hover:text-brand-600 font-medium transition-colors">
              Academic Resources
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{resource?.title || 'Resource Details'}</span>
          </div>

          {/* Error Banner */}
          {isError && (
            <Alert variant="error" title="Failed to Load Resource" message={error?.message || 'Network error occurred.'} />
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <Card className="p-8 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-40 w-full" />
            </Card>
          )}

          {/* Resource Content View */}
          {!isLoading && resource && (
            <Card className="p-6 sm:p-10 space-y-8 shadow-md">
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
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Resource Content / Notes</h3>
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
                  <div className="text-xs text-slate-500">
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
