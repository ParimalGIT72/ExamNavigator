import React from 'react';
import { IChatMessage } from '@/types/ai.types';
import { CitationCard } from './CitationCard';
import { Bot, User, Sparkles } from 'lucide-react';

interface IMessageItemProps {
  message: IChatMessage;
}

export const MessageItem: React.FC<IMessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'User';

  return (
    <div
      className={`flex gap-3 p-4 rounded-xl transition-all ${
        isUser
          ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 ml-auto max-w-[85%]'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-[95%]'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {isUser ? 'You' : 'ExamNavigator Tutor'}
          </span>
          {!isUser && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
              <Sparkles className="w-3 h-3" /> Gemini 2.5 Pro
            </span>
          )}
        </div>

        {/* Message Content Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content || (message.isStreaming ? 'Thinking...' : '')}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse" />
          )}
        </div>

        {/* RAG Grounding Sources */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <CitationCard citations={message.citations} />
        )}
      </div>
    </div>
  );
};
