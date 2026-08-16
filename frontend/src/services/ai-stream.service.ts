import { ISseEventCallbacks } from '@/types/ai.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class AiStreamService {
  /**
   * Initiates SSE stream via native fetch + ReadableStream reader.
   * Preserves JWT authentication header without exposing API keys.
   */
  public static async streamChatTurn(
    payload: {
      message: string;
      sessionId?: string;
      subjectId?: string;
      chapterId?: string;
      topicId?: string;
    },
    callbacks: ISseEventCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} Error`;
        try {
          const errData = await response.json();
          errorMessage = errData.message || errorMessage;
        } catch {
          // Fallback if not JSON
        }
        callbacks.onError?.({ message: errorMessage, errorCode: `HTTP_${response.status}` });
        return;
      }

      if (!response.body) {
        callbacks.onError?.({ message: 'No response stream body available.', errorCode: 'NO_STREAM' });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let currentEvent = 'token';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete trailing line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.replace(/^event:\s*/, '').trim();
          } else if (trimmed.startsWith('data:')) {
            const rawData = trimmed.replace(/^data:\s*/, '').trim();
            try {
              const parsed = JSON.parse(rawData);
              switch (currentEvent) {
                case 'start':
                  callbacks.onStart?.(parsed);
                  break;
                case 'citations':
                  callbacks.onCitations?.(parsed);
                  break;
                case 'token':
                  if (parsed.token) callbacks.onToken?.(parsed.token);
                  break;
                case 'done':
                  callbacks.onDone?.(parsed);
                  break;
                case 'error':
                  callbacks.onError?.(parsed);
                  break;
              }
            } catch {
              // Ignore invalid JSON chunk
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        callbacks.onError?.({ message: 'Generation stopped by user.', errorCode: 'USER_ABORT' });
      } else {
        callbacks.onError?.({ message: error.message || 'Stream processing failed.', errorCode: 'STREAM_ERROR' });
      }
    }
  }
}
