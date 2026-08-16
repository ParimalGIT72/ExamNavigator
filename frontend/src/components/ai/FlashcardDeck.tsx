import React, { useState } from 'react';
import { IFlashcard } from '@/types/ai.types';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, Award } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface IFlashcardDeckProps {
  cards: IFlashcard[];
  onDelete?: (cardId: string) => void;
}

export const FlashcardDeck: React.FC<IFlashcardDeckProps> = ({ cards, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Card Navigation Controls Top */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <Badge variant="brand">{currentCard.masteryState}</Badge>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 cursor-pointer perspective-1000 group"
      >
        <div
          className={`w-full h-full relative duration-500 rounded-2xl shadow-xl transition-all border border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-between select-none ${
            isFlipped
              ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>{isFlipped ? 'ANSWER (BACK)' : 'QUESTION (FRONT)'}</span>
            <RotateCw className="w-4 h-4 text-indigo-400 animate-spin-slow" />
          </div>

          <div className="flex-1 flex items-center justify-center text-center px-4">
            <p className="text-lg font-medium leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          <div className="text-center text-xs text-slate-400">
            Click card to flip
          </div>
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-900/30"
        >
          Flip Card
        </button>

        <button
          onClick={handleNext}
          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
