import React, { useState } from 'react';
import { ICitation } from '@/types/ai.types';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

interface ICitationCardProps {
  citations: ICitation[];
}

export const CitationCard: React.FC<ICitationCardProps> = ({ citations }) => {
  const [selectedCitation, setSelectedCitation] = useState<ICitation | null>(null);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Grounded RAG Sources ({citations.length}):</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {citations.map((citation, index) => (
          <button
            key={index}
            onClick={() => setSelectedCitation(citation)}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-emerald-950/50 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700/60 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[150px]">{citation.title}</span>
            <Badge variant="success" size="sm">
              {Math.round(citation.similarityScore * 100)}% Match
            </Badge>
          </button>
        ))}
      </div>

      {selectedCitation && (
        <Modal
          isOpen={!!selectedCitation}
          onClose={() => setSelectedCitation(null)}
          title={`Source Details: ${selectedCitation.title}`}
          className="bg-slate-900 border-slate-800 text-slate-100"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <p className="font-medium text-slate-100">{selectedCitation.title}</p>
                <p className="text-xs text-slate-400">Type: {selectedCitation.resourceType}</p>
              </div>
              <Badge variant="brand">
                Score: {selectedCitation.similarityScore}
              </Badge>
            </div>

            <p className="text-slate-300">
              This reference snippet was retrieved from the official competitive exam repository and used by the RAG Engine to ground the tutor response.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
