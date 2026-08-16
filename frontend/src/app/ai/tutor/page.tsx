'use client';

import React, { useEffect, useRef } from 'react';
import { useAiChatStore } from '@/store/useAiChatStore';
import { useAiChatStream } from '@/hooks/useAiChatStream';
import { ChatSidebar } from '@/components/ai/ChatSidebar';
import { MessageItem } from '@/components/ai/MessageItem';
import { ApiClient } from '@/lib/api-client';
import { IChatSession, IChatMessage } from '@/types/ai.types';
import { Send, Square, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

export default function AiTutorPage() {
  const [inputText, setInputText] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    messages,
    setMessages,
    archiveSessionInStore,
    setLoadingSessions,
    setLoadingMessages,
  } = useAiChatStore();

  const { sendMessage, stopGeneration, isStreaming, streamingError } = useAiChatStream();

  // 1. Load Sessions on Mount
  useEffect(() => {
    async function loadSessions() {
      setLoadingSessions(true);
      const res = await ApiClient.get<{ sessions: IChatSession[] }>('/ai/chat/sessions');
      if (res.success && res.data) {
        setSessions(res.data.sessions);
      }
      setLoadingSessions(false);
    }
    loadSessions();
  }, [setSessions, setLoadingSessions]);

  // 2. Load Messages when Active Session Changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }
    async function loadMessages() {
      setLoadingMessages(true);
      const res = await ApiClient.get<{ messages: IChatMessage[] }>(
        `/ai/chat/${currentSessionId}/messages`
      );
      if (res.success && res.data) {
        setMessages(res.data.messages);
      }
      setLoadingMessages(false);
    }
    loadMessages();
  }, [currentSessionId, setMessages, setLoadingMessages]);

  // 3. Auto-scroll to Bottom on New Token/Message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isStreaming) return;
    const text = inputText;
    setInputText('');
    sendMessage(text);
  };

  const handleNewChat = () => {
    if (isStreaming) stopGeneration();
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleArchiveSession = async (sessionId: string) => {
    const res = await ApiClient.delete(`/ai/chat/${sessionId}`);
    if (res.success) {
      archiveSessionInStore(sessionId);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar Session List */}
      <ChatSidebar
        onSelectSession={(id) => {
          if (isStreaming) stopGeneration();
          setCurrentSessionId(id);
        }}
        onNewChat={handleNewChat}
        onArchiveSession={handleArchiveSession}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-900/50 relative">
        {/* Top Header */}
        <header className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h1 className="font-semibold text-sm text-slate-100">
              {currentSessionId
                ? sessions.find((s) => s._id === currentSessionId)?.title || 'Doubts Session'
                : 'New AI Doubts Session'}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Phase 6B RAG Grounded</span>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-emerald-950">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">How can I help your studies today?</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Ask any competitive exam doubt (JEE, NEET, GATE). Answers are grounded in official syllabus notes via our Phase 6 RAG Engine.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => <MessageItem key={index} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert */}
        {streamingError && (
          <div className="mx-6 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{streamingError}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Ask a doubt or formula question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isStreaming}
              className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 text-sm px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-lg shadow-red-950 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white p-3 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-emerald-950 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
