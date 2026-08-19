import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, FileText, Sparkles, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ISubject } from '@/types';

export interface QuickRevisionCardProps {
  subject: ISubject;
  formulaSheetCount?: number;
  revisionNotesCount?: number;
}

export const QuickRevisionCard: React.FC<QuickRevisionCardProps> = ({
  subject,
  formulaSheetCount = 0,
  revisionNotesCount = 0,
}) => {
  return (
    <Card className="p-6 border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between bg-white group">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="p-3 bg-amber-50 group-hover:bg-amber-100 text-amber-600 rounded-xl transition-colors">
            <Sparkles className="h-6 w-6" />
          </div>
          <Badge variant="brand">{subject.examType || 'Curriculum'}</Badge>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{subject.code}</span>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {subject.name}
          </h3>
          <p className="text-slate-600 text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {subject.description || 'Quick formula sheets, key principles, and last-minute revision materials.'}
          </p>
        </div>

        {/* Revision Material Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">{formulaSheetCount}</div>
              <div className="text-[10px] text-slate-500 font-medium">Formula Sheets</div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center space-x-2">
            <Layers className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">{revisionNotesCount}</div>
              <div className="text-[10px] text-slate-500 font-medium">Revision Notes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Quick Revision</span>
        <Link
          href={`/quick-revision/${subject._id}`}
          className="inline-flex items-center text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
        >
          Open Material <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </Card>
  );
};
