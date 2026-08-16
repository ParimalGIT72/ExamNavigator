'use client';

import React, { useEffect, useState } from 'react';
import { SpecializedAiService } from '@/services/specialized-ai.service';
import { useAiChatStore } from '@/store/useAiChatStore';
import { IFlashcard } from '@/types/ai.types';
import { FlashcardDeck } from '@/components/ai/FlashcardDeck';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Layers, Plus, Sparkles, Clock, CheckCircle } from 'lucide-react';

export default function AiFlashcardsPage() {
  const { flashcards, setFlashcards, deleteFlashcardInStore } = useAiChatStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicId, setTopicId] = useState('');
  const [count, setCount] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function fetchFlashcards() {
      setIsLoading(true);
      const res = await SpecializedAiService.getFlashcards(1, 20);
      if (res.success && res.data) {
        setFlashcards(res.data.flashcards);
      }
      setIsLoading(false);
    }
    fetchFlashcards();
  }, [setFlashcards]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await SpecializedAiService.generateFlashcards({ topicId: topicId.trim(), count });
      if (res.success && res.data) {
        setFlashcards([...res.data.flashcards, ...flashcards]);
        setIsModalOpen(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFetchDue = async () => {
    setIsLoading(true);
    const res = await SpecializedAiService.getFlashcards(1, 20, undefined, true);
    if (res.success && res.data) {
      setFlashcards(res.data.flashcards);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            AI Flashcards & Spaced Repetition
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active-recall question-and-answer pairs generated from syllabus topic grounding.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleFetchDue}>
            <Clock className="w-4 h-4 mr-1.5" /> Review Due Cards
          </Button>

          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Generate Deck
          </Button>
        </div>
      </div>

      {/* Main Flashcard Deck */}
      {isLoading ? (
        <div className="h-80 w-full max-w-xl mx-auto bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
      ) : flashcards.length === 0 ? (
        <EmptyState
          title="No Active Flashcards"
          description="Generate a new active-recall flashcard deck for any competitive exam topic."
          actionText="Generate Deck"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <FlashcardDeck cards={flashcards} />
      )}

      {/* Generate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate AI Flashcards Deck"
      >
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
              Number of Cards (1 - 20)
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 5)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isGenerating}>
              <Sparkles className="w-4 h-4 mr-1.5" /> Generate Cards
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
