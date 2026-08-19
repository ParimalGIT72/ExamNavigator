import React from 'react';
import { ArrowLeft, ArrowRight, User, Calendar, Download, ExternalLink, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MathRenderer } from '@/components/ui/MathRenderer';
import { ILearningResource } from '@/types';

export interface FormulaSheetViewerProps {
  resource: ILearningResource;
  subjectTitle?: string;
  chapterTitle?: string;
  topicTitle?: string;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const FormulaSheetViewer: React.FC<FormulaSheetViewerProps> = ({
  resource,
  subjectTitle,
  chapterTitle,
  topicTitle,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
}) => {
  return (
    <Card className="p-6 sm:p-10 space-y-8 shadow-md bg-white border-slate-200">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Badge variant="warning">{resource.resourceType || 'FormulaSheet'}</Badge>
            {subjectTitle && (
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                {subjectTitle}
              </span>
            )}
          </div>

          {resource.createdAt && (
            <span className="flex items-center text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
              Updated {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {resource.title}
          </h1>

          {(chapterTitle || topicTitle) && (
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold text-slate-600">
              {chapterTitle && <span className="bg-slate-100 px-2.5 py-1 rounded-md">Chapter: {chapterTitle}</span>}
              {topicTitle && <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md">Topic: {topicTitle}</span>}
            </div>
          )}
        </div>

        {resource.author && (
          <div className="flex items-center text-xs font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg w-fit border border-slate-200">
            <User className="h-4 w-4 mr-2 text-amber-600" /> Faculty / Author: {resource.author}
          </div>
        )}
      </div>

      {/* KaTeX LaTeX Equations & Formula Content */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-amber-500" /> Key Formulas & Equations
        </div>

        {resource.textContent ? (
          <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto">
            <MathRenderer content={resource.textContent} dark />
          </div>
        ) : (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-slate-600 text-sm">External document file or link provided for this formula sheet.</p>
          </div>
        )}
      </div>

      {/* External Link or Document Download */}
      {resource.contentUrl && (
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500 font-mono truncate max-w-full">{resource.contentUrl}</span>
          <a href={resource.contentUrl} target="_blank" rel="noreferrer">
            <Button variant="primary" size="md">
              <Download className="h-4 w-4 mr-2" /> Download Document <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
            </Button>
          </a>
        </div>
      )}

      {/* Bounded Previous / Next Navigation */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="md"
          disabled={!hasPrevious}
          onClick={onPrevious}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous Sheet
        </Button>

        <span className="text-xs font-semibold text-slate-400 hidden sm:inline-block">
          Revision Mode
        </span>

        <Button
          variant="primary"
          size="md"
          disabled={!hasNext}
          onClick={onNext}
          className="flex items-center bg-amber-600 hover:bg-amber-700 text-white border-none"
        >
          Next Sheet <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
};
