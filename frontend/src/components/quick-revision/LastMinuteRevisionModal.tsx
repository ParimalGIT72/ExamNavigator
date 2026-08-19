import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MathRenderer } from '@/components/ui/MathRenderer';
import { ILearningResource } from '@/types';

export interface LastMinuteRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectTitle: string;
  sheets: ILearningResource[];
}

export const LastMinuteRevisionModal: React.FC<LastMinuteRevisionModalProps> = ({
  isOpen,
  onClose,
  subjectTitle,
  sheets,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || sheets.length === 0) return null;

  const currentSheet = sheets[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === sheets.length - 1;

  const handleNext = () => {
    if (!isLast) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Last-Minute Quick Revision — ${subjectTitle}`}>
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>
              Sheet {currentIndex + 1} of {sheets.length}
            </span>
            <span className="text-amber-600">{Math.round(((currentIndex + 1) / sheets.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / sheets.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Sheet Content */}
        <div className="space-y-4 p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <Badge variant="warning">{currentSheet.resourceType}</Badge>
            <span className="text-xs font-mono text-slate-400">Order #{currentSheet.order || currentIndex + 1}</span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">{currentSheet.title}</h3>

          {currentSheet.textContent ? (
            <div className="p-5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs max-h-80 overflow-y-auto">
              <MathRenderer content={currentSheet.textContent} dark />
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No inline text. External file resource attached.</p>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={isFirst}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          {isLast ? (
            <Button variant="primary" size="sm" onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Complete Revision
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleNext} className="bg-amber-600 hover:bg-amber-700 text-white">
              Next Sheet <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
