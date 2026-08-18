export interface IPromptTemplate {
  version: string;
  systemInstruction: string;
  renderUserPrompt(params: Record<string, any>): string;
}

export class PromptTemplateService {
  /**
   * Version-controlled prompt for AI Study Notes Generation.
   */
  public readonly NOTES_GENERATE_V1: IPromptTemplate = {
    version: '1.0.0',
    systemInstruction:
      'You are ExamNavigator Specialized Study Notes Generator. ' +
      'Your role is to produce comprehensive, highly structured markdown study notes for students preparing for competitive exams. ' +
      'Format notes with clear markdown headers (`# Title`, `## Executive Summary`, `## Key Concepts & Takeaways`, `## Detailed Breakdown`, `## Formulas & Key Terms`). ' +
      'MATHEMATICAL FORMULA RULES: Use \\( ... \\) for inline math and $$ ... $$ for block display math. Never use <math>, <equation>, MathML, or code blocks for formulas. ' +
      'Keep tone encouraging, precise, and educational. Avoid fluff or generic introductory remarks.',
    renderUserPrompt: (params: Record<string, any>) => {
      const topicName = params.topicName || 'Academic Topic';
      const customPrompt = params.customPrompt ? `\n\nStudent Focus Request: ${params.customPrompt}` : '';
      const context = params.context ? `\n\nReference Material:\n${params.context}` : '';
      return `Generate complete study notes for the topic: "${topicName}".${customPrompt}${context}`;
    },
  };

  /**
   * Version-controlled prompt for AI Flashcards Generation.
   * Strictly enforces raw JSON output matching [{ "front": "...", "back": "..." }].
   */
  public readonly FLASHCARDS_GENERATE_V1: IPromptTemplate = {
    version: '1.0.0',
    systemInstruction:
      'You are ExamNavigator Flashcard Generator. ' +
      'Your role is to extract concise active-recall question-and-answer pairs for spaced repetition study. ' +
      'CRITICAL OUTPUT RULE: Respond ONLY with a valid JSON array of objects. Each object MUST contain "front" (question/prompt) and "back" (concise answer) string properties. ' +
      'Do NOT wrap the output in markdown backticks. Do NOT include markdown text outside the JSON array.',
    renderUserPrompt: (params: Record<string, any>) => {
      const topicName = params.topicName || 'Academic Topic';
      const count = params.count || 5;
      const context = params.context ? `\n\nReference Material:\n${params.context}` : '';
      return `Generate exactly ${count} active-recall flashcard pairs for the topic: "${topicName}".${context}`;
    },
  };

  /**
   * Version-controlled prompt for Zero-Shot Topic Detection.
   */
  public readonly TOPIC_DETECT_V1: IPromptTemplate = {
    version: '1.0.0',
    systemInstruction:
      'You are ExamNavigator Topic Classifier. ' +
      'Analyze the provided student input query and extract the primary academic subject and topic name. ' +
      'Respond ONLY with a JSON object: {"topicName": "...", "subjectName": "...", "confidenceScore": 0.0 - 1.0}. ' +
      'Do NOT include markdown formatting or explanations.',
    renderUserPrompt: (params: Record<string, any>) => {
      return `Classify academic topic from text: "${params.text}"`;
    },
  };
}

export const promptTemplateService = new PromptTemplateService();
