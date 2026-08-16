import { ApiClient } from '@/lib/api-client';
import { IAiNote, IFlashcard, ITopicDetectionResult } from '@/types/ai.types';

export class SpecializedAiService {
  /**
   * Generates AI study notes for a topic (Phase 6D).
   */
  public static async generateNotes(payload: {
    topicId: string;
    customPrompt?: string;
    maxTokens?: number;
  }) {
    return await ApiClient.post<IAiNote>('/ai/notes', payload);
  }

  /**
   * Retrieves paginated study notes for the authenticated user.
   */
  public static async getNotes(page: number = 1, limit: number = 20, topicId?: string) {
    let endpoint = `/ai/notes?page=${page}&limit=${limit}`;
    if (topicId) endpoint += `&topicId=${topicId}`;
    return await ApiClient.get<{ notes: IAiNote[]; total: number; page: number; limit: number }>(endpoint);
  }

  /**
   * Retrieves a single note by ID.
   */
  public static async getNoteById(noteId: string) {
    return await ApiClient.get<IAiNote>(`/ai/notes/${noteId}`);
  }

  /**
   * Updates an existing note.
   */
  public static async updateNote(noteId: string, data: Partial<IAiNote>) {
    return await ApiClient.patch<IAiNote>(`/ai/notes/${noteId}`, data);
  }

  /**
   * Soft-deletes a note.
   */
  public static async deleteNote(noteId: string) {
    return await ApiClient.delete<{ noteId: string }>(`/ai/notes/${noteId}`);
  }

  /**
   * Generates AI flashcards for a topic (Phase 6D).
   */
  public static async generateFlashcards(payload: { topicId: string; count?: number }) {
    return await ApiClient.post<{ count: number; flashcards: IFlashcard[] }>('/ai/flashcards', payload);
  }

  /**
   * Retrieves user flashcards (paginated or due review queue).
   */
  public static async getFlashcards(page: number = 1, limit: number = 20, topicId?: string, dueOnly?: boolean) {
    let endpoint = `/ai/flashcards?page=${page}&limit=${limit}`;
    if (topicId) endpoint += `&topicId=${topicId}`;
    if (dueOnly) endpoint += `&dueOnly=true`;
    return await ApiClient.get<{ flashcards: IFlashcard[]; total: number }>(endpoint);
  }

  /**
   * Deletes a flashcard.
   */
  public static async deleteFlashcard(cardId: string) {
    return await ApiClient.delete<{ cardId: string }>(`/ai/flashcards/${cardId}`);
  }

  /**
   * Detects topic from input text (Phase 6D).
   */
  public static async detectTopic(text: string, subjectId?: string) {
    return await ApiClient.post<ITopicDetectionResult>('/ai/topic-detect', { text, subjectId });
  }
}
