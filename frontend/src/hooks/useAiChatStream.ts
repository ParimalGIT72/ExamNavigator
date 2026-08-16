import { useState, useRef, useCallback } from 'react';
import { useAiChatStore } from '@/store/useAiChatStore';
import { AiStreamService } from '@/services/ai-stream.service';
import { ICitation } from '@/types/ai.types';

export function useAiChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    currentSessionId,
    setCurrentSessionId,
    addMessage,
    updateLastMessageContent,
    addSession,
  } = useAiChatStore();

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (
      messageText: string,
      options: { subjectId?: string; chapterId?: string; topicId?: string } = {}
    ) => {
      const cleanMessage = messageText.trim();
      if (!cleanMessage || isStreaming) return;

      setStreamingError(null);
      setIsStreaming(true);

      // 1. Optimistically append User Message to Store
      addMessage({
        sender: 'User',
        content: cleanMessage,
        createdAt: new Date().toISOString(),
      });

      // 2. Optimistically append empty Assistant Message to Store
      addMessage({
        sender: 'Assistant',
        content: '',
        isStreaming: true,
        createdAt: new Date().toISOString(),
      });

      let accumulatedContent = '';
      let receivedCitations: ICitation[] = [];
      const controller = new AbortController();
      abortControllerRef.current = controller;

      await AiStreamService.streamChatTurn(
        {
          message: cleanMessage,
          sessionId: currentSessionId || undefined,
          subjectId: options.subjectId,
          chapterId: options.chapterId,
          topicId: options.topicId,
        },
        {
          onStart: ({ sessionId }) => {
            if (!currentSessionId) {
              setCurrentSessionId(sessionId);
              addSession({
                _id: sessionId,
                userId: '',
                title: cleanMessage.slice(0, 30),
                status: 'Active',
                messageCount: 2,
                lastMessageAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          },
          onCitations: ({ citations }) => {
            receivedCitations = citations;
            updateLastMessageContent(accumulatedContent, receivedCitations, true);
          },
          onToken: (token) => {
            accumulatedContent += token;
            updateLastMessageContent(accumulatedContent, receivedCitations, true);
          },
          onDone: ({ sessionId }) => {
            setIsStreaming(false);
            abortControllerRef.current = null;
            if (sessionId && !currentSessionId) {
              setCurrentSessionId(sessionId);
            }
            updateLastMessageContent(accumulatedContent, receivedCitations, false);
          },
          onError: ({ message }) => {
            setIsStreaming(false);
            abortControllerRef.current = null;
            setStreamingError(message);
            updateLastMessageContent(
              accumulatedContent || `*[Error: ${message}]*`,
              receivedCitations,
              false
            );
          },
        },
        controller.signal
      );
    },
    [
      isStreaming,
      currentSessionId,
      addMessage,
      updateLastMessageContent,
      setCurrentSessionId,
      addSession,
    ]
  );

  return {
    sendMessage,
    stopGeneration,
    isStreaming,
    streamingError,
  };
}
