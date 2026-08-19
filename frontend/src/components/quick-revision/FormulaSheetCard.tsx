import React from 'react';
import Link from 'next/link';
import { FileText, ChevronRight, User, Hash, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ILearningResource } from '@/types';

export interface FormulaSheetCardProps {
  resource: ILearningResource;
  chapterTitle?: string;
  topicTitle?: string;
  subjectId: string;
}

export const FormulaSheetCard: React.FC<FormulaSheetCardProps> = ({
  resource,
  chapterTitle,
  topicTitle,
  subjectId,
}) => {
  const isFormulaSheet = resource.resourceType === 'FormulaSheet';

  return (
    <Card className="p-5 border-slate-200 hover:shadow-md transition-all bg-white flex flex-col justify-between group">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={isFormulaSheet ? 'warning' : 'brand'}>
            {resource.resourceType}
          </Badge>

          {resource.order && (
            <span className="flex items-center text-xs font-mono text-slate-400">
              <Hash className="h-3 w-3 mr-0.5" /> Order #{resource.order}
            </span>
          )}
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {resource.title}
          </h4>

          {(chapterTitle || topicTitle) && (
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
              {chapterTitle && (
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold line-clamp-1">
                  Ch: {chapterTitle}
                </span>
              )}
              {topicTitle && (
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold line-clamp-1">
                  Topic: {topicTitle}
                </span>
              )}
            </div>
          )}
        </div>

        {resource.textContent && (
          <p className="text-xs text-slate-600 line-clamp-2 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {resource.textContent}
          </p>
        )}

        {resource.author && (
          <div className="flex items-center text-xs text-slate-500 font-medium pt-1">
            <User className="h-3.5 w-3.5 mr-1 text-slate-400" /> {resource.author}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="flex items-center text-xs text-slate-400 font-medium">
          <Clock className="h-3.5 w-3.5 mr-1" /> Quick 5-min revision
        </span>

        <Link
          href={`/quick-revision/${subjectId}/sheet/${resource._id}`}
          className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
        >
          View Sheet <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Link>
      </div>
    </Card>
  );
};
