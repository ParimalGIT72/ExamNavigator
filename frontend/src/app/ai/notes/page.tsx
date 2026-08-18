'use client';

import React, { useEffect, useState } from 'react';
import { SpecializedAiService } from '@/services/specialized-ai.service';
import { useAiChatStore } from '@/store/useAiChatStore';
import { IAiNote } from '@/types/ai.types';
import { NoteModal } from '@/components/ai/NoteModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText, Plus, Sparkles, Tag, Calendar } from 'lucide-react';

export default function AiNotesPage() {
  const { notes, setNotes, addNote, deleteNoteInStore } = useAiChatStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<IAiNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      setIsLoading(true);
      const res = await SpecializedAiService.getNotes(1, 20);
      if (res.success && res.data) {
        setNotes(res.data.notes);
      }
      setIsLoading(false);
    }
    fetchNotes();
  }, [setNotes]);

  const handleGenerateNote = async (topicId: string, customPrompt?: string) => {
    const res = await SpecializedAiService.generateNotes({ topicId, customPrompt });
    if (res.success && res.data) {
      addNote({
        _id: (res.data as any).noteId || res.data._id,
        userId: '',
        topicId: res.data.topicId,
        title: res.data.title,
        content: res.data.content,
        summary: res.data.summary,
        keyTakeaways: res.data.keyTakeaways,
        tags: res.data.tags,
        isPinned: false,
        isArchived: false,
        createdAt: res.data.createdAt,
        updatedAt: res.data.createdAt,
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const res = await SpecializedAiService.deleteNote(noteId);
    if (res.success) {
      deleteNoteInStore(noteId);
      setSelectedNote(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            AI Study Notes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Synthesized structured study guides grounded in official syllabus material.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Generate AI Note
        </Button>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No AI Study Notes Generated Yet"
          description="Click 'Generate AI Note' to create structured markdown study notes for any topic."
          actionText="Generate AI Note"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card
              key={note._id}
              className="cursor-pointer hover:border-indigo-500 transition-all shadow-sm hover:shadow-md p-5 flex flex-col justify-between"
              onClick={() => setSelectedNote(note)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                    <Sparkles className="w-3 h-3" /> AI Generated
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-2">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                  {note.summary || note.content.slice(0, 120)}
                </p>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Generation */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateNote}
      />

      {/* Modal for Viewing Single Note */}
      {selectedNote && (
        <NoteModal
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          note={selectedNote}
          onGenerate={handleGenerateNote}
          onDelete={handleDeleteNote}
        />
      )}
    </div>
  );
}
