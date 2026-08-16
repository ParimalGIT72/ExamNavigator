import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IAiNote } from '@/types/ai.types';
import { Sparkles, FileText, Pin, Trash2 } from 'lucide-react';

interface INoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: IAiNote | null;
  onGenerate: (topicId: string, customPrompt?: string) => Promise<void>;
  onSave?: (noteId: string, title: string, content: string) => Promise<void>;
  onDelete?: (noteId: string) => Promise<void>;
}

export const NoteModal: React.FC<INoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onGenerate,
  onSave,
  onDelete,
}) => {
  const [topicId, setTopicId] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const isViewMode = !!note;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      await onGenerate(topicId.trim(), customPrompt.trim());
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? note.title : 'Generate AI Study Note'}
    >
      {isViewMode ? (
        <div className="space-y-4 text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Created {new Date(note.createdAt).toLocaleDateString()}
            </span>
            {onDelete && (
              <button
                onClick={() => onDelete(note._id)}
                className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Note
              </button>
            )}
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
            {note.content}
          </div>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic ID (MongoDB ObjectId)
            </label>
            <Input
              type="text"
              placeholder="e.g. 507f1f77bcf86cd799439011"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Focus Request (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Focus on mathematical derivations and JEE formulas"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isGenerating}>
              <Sparkles className="w-4 h-4 mr-1.5" /> Generate Note
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
