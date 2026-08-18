import React from 'react';
import { useAiChatStore } from '@/store/useAiChatStore';
import { IChatSession } from '@/types/ai.types';
import { MessageSquare, Plus, Trash2, Search, Bot } from 'lucide-react';

interface IChatSidebarProps {
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onArchiveSession: (sessionId: string) => void;
}

export const ChatSidebar: React.FC<IChatSidebarProps> = ({
  onSelectSession,
  onNewChat,
  onArchiveSession,
}) => {
  const { sessions, currentSessionId, isLoadingSessions } = useAiChatStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800 shrink-0">
      {/* Header & New Chat Button */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-white">AI Doubts Tutor</h2>
            <p className="text-xs text-slate-400">Syllabus Grounded AI</p>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Doubts Session</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoadingSessions ? (
          <div className="p-4 text-center text-xs text-slate-500">Loading conversations...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">No previous sessions found.</div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session._id === currentSessionId;
            return (
              <div
                key={session._id}
                onClick={() => onSelectSession(session._id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-medium'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-emerald-400" />
                  <span className="truncate">{session.title || 'Untitled Session'}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiveSession(session._id);
                  }}
                  title="Archive session"
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 rounded transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
