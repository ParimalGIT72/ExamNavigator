import { create } from 'zustand';
import { IChatSession, IChatMessage, IAiNote, IFlashcard, ICitation } from '@/types/ai.types';

interface IAiChatStoreState {
  sessions: IChatSession[];
  currentSessionId: string | null;
  messages: IChatMessage[];
  notes: IAiNote[];
  flashcards: IFlashcard[];
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;

  setSessions: (sessions: IChatSession[]) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  addSession: (session: IChatSession) => void;
  archiveSessionInStore: (sessionId: string) => void;
  setMessages: (messages: IChatMessage[]) => void;
  addMessage: (message: IChatMessage) => void;
  updateLastMessageContent: (content: string, citations?: ICitation[], isStreaming?: boolean) => void;

  setNotes: (notes: IAiNote[]) => void;
  addNote: (note: IAiNote) => void;
  updateNoteInStore: (noteId: string, data: Partial<IAiNote>) => void;
  deleteNoteInStore: (noteId: string) => void;

  setFlashcards: (flashcards: IFlashcard[]) => void;
  deleteFlashcardInStore: (cardId: string) => void;

  setLoadingSessions: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
}

export const useAiChatStore = create<IAiChatStoreState>((set) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  notes: [],
  flashcards: [],
  isLoadingSessions: false,
  isLoadingMessages: false,

  setSessions: (sessions) => set({ sessions }),
  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions], currentSessionId: session._id })),
  archiveSessionInStore: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s._id !== sessionId),
      currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
      messages: state.currentSessionId === sessionId ? [] : state.messages,
    })),

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessageContent: (content, citations, isStreaming = true) =>
    set((state) => {
      const copy = [...state.messages];
      if (copy.length === 0) return state;
      const lastIndex = copy.length - 1;
      const lastMsg = copy[lastIndex];
      if (lastMsg.sender === 'Assistant') {
        copy[lastIndex] = {
          ...lastMsg,
          content,
          citations: citations || lastMsg.citations,
          isStreaming,
        };
      }
      return { messages: copy };
    }),

  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNoteInStore: (noteId, data) =>
    set((state) => ({
      notes: state.notes.map((n) => (n._id === noteId ? { ...n, ...data } : n)),
    })),
  deleteNoteInStore: (noteId) =>
    set((state) => ({ notes: state.notes.filter((n) => n._id !== noteId) })),

  setFlashcards: (flashcards) => set({ flashcards }),
  deleteFlashcardInStore: (cardId) =>
    set((state) => ({ flashcards: state.flashcards.filter((f) => f._id !== cardId) })),

  setLoadingSessions: (loading) => set({ isLoadingSessions: loading }),
  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
}));
