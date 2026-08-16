export interface ICitation {
  resourceId: string;
  title: string;
  resourceType: string;
  similarityScore: number;
  chunkIndex?: number;
}

export interface IChatMessage {
  _id?: string;
  sessionId?: string;
  sender: 'User' | 'Assistant';
  content: string;
  citations?: ICitation[];
  tokenCount?: number;
  latencyMs?: number;
  createdAt?: string;
  isStreaming?: boolean;
}

export interface IChatSession {
  _id: string;
  userId: string;
  title: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  status: 'Active' | 'Archived';
  messageCount: number;
  lastMessageAt: string;
  conversationSummary?: string;
  summaryUpdatedAt?: string;
  currentTopic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAiNote {
  _id: string;
  userId: string;
  topicId: string;
  title: string;
  content: string;
  summary?: string;
  keyTakeaways?: string[];
  tags?: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFlashcard {
  _id: string;
  userId: string;
  topicId: string;
  front: string;
  back: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  masteryState: 'New' | 'Learning' | 'Review' | 'Mastered';
  createdAt: string;
  updatedAt: string;
}

export interface ITopicDetectionResult {
  topicId?: string;
  subjectId?: string;
  topicName: string;
  subjectName?: string;
  confidenceScore: number;
}

export interface ISseEventCallbacks {
  onStart?: (data: { sessionId: string }) => void;
  onCitations?: (data: { citations: ICitation[] }) => void;
  onToken?: (token: string) => void;
  onDone?: (data: { sessionId: string; tokensUsed?: any; latencyMs?: number }) => void;
  onError?: (error: { message: string; errorCode?: string }) => void;
}
