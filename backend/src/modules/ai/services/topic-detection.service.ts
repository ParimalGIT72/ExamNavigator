import { TopicModel } from '../../academic/models/topic.model';
import { promptTemplateService } from './prompt-template.service';
import { aiGatewayService } from './ai-gateway.service';

export interface ITopicDetectionResult {
  topicId?: string;
  subjectId?: string;
  topicName: string;
  subjectName?: string;
  confidenceScore: number;
}

export class TopicDetectionService {
  /**
   * Resolves academic topic details from freeform student text or query.
   * Performs database string matching first, then falls back to zero-shot LLM classification.
   */
  public async detectTopic(text: string, subjectId?: string): Promise<ITopicDetectionResult> {
    const cleanText = text.trim();
    if (!cleanText) {
      return { topicName: 'General Study', confidenceScore: 0.5 };
    }

    // 1. First-pass Database string matching
    const queryFilter: any = { isDeleted: { $ne: true } };
    if (subjectId) {
      queryFilter.subjectId = subjectId;
    }

    const topics = await TopicModel.find(queryFilter).limit(50).exec();
    for (const topic of topics) {
      if (cleanText.toLowerCase().includes(topic.title.toLowerCase())) {
        return {
          topicId: topic._id.toString(),
          subjectId: topic.subjectId ? topic.subjectId.toString() : undefined,
          topicName: topic.title,
          confidenceScore: 0.95,
        };
      }
    }

    // 2. Fallback: LLM Zero-shot classification
    try {
      const template = promptTemplateService.TOPIC_DETECT_V1;
      const prompt = template.renderUserPrompt({ text: cleanText });

      const result = await aiGatewayService.processDirectChat({
        userId: 'system-topic-detector',
        prompt,
      });

      const parsed = JSON.parse(result.answer.replace(/```json|```/g, '').trim());
      return {
        topicName: parsed.topicName || cleanText.slice(0, 30),
        subjectName: parsed.subjectName,
        confidenceScore: parsed.confidenceScore || 0.8,
      };
    } catch {
      return {
        topicName: cleanText.slice(0, 30),
        confidenceScore: 0.6,
      };
    }
  }
}

export const topicDetectionService = new TopicDetectionService();
