# AI & RAG Architecture Document (ARD)

# ExamNavigator

Version: 1.0

Status: Architecture Frozen

Author: Maverik

Last Updated: August 2026

---

# Table of Contents

1. Introduction
2. Purpose
3. AI Vision
4. Design Goals
5. AI Architecture
6. RAG Overview
7. Core AI Services
8. Design Principles

---

# Part 1 – AI & RAG Foundation

# 1. Introduction

This document defines the Artificial Intelligence (AI) and Retrieval-Augmented Generation (RAG) architecture for ExamNavigator.

The AI subsystem enables intelligent tutoring, question generation, note generation, personalized study planning, adaptive recommendations, and educational assistance while ensuring that responses remain accurate, contextual, and grounded in trusted educational resources.

---

# 2. Purpose

The objectives of this document are:

- Define AI architecture
- Define the RAG pipeline
- Standardize AI workflows
- Reduce hallucinations
- Improve response quality
- Ensure scalability
- Maintain AI security
- Optimize AI cost

---

# 3. AI Vision

The AI within ExamNavigator is designed to function as an intelligent learning companion rather than a generic chatbot.

The AI should:

- Explain concepts
- Solve doubts
- Guide learning
- Generate educational resources
- Personalize learning
- Recommend improvements
- Assist exam preparation

Every response should prioritize educational accuracy over creativity.

---

# 4. Design Goals

The AI architecture is designed to achieve:

- Accurate Responses
- Context-Aware Conversations
- Low Hallucination Rate
- Fast Response Time
- Modular Design
- Provider Independence
- Cost Efficiency
- Security
- Scalability

---

# 5. AI Architecture Overview

The AI subsystem consists of multiple independent services.

```text
Student

↓

AI Gateway

↓

Prompt Builder

↓

RAG Engine

↓

Gemini API

↓

Response Validator

↓

Frontend
```

Each component has a single responsibility.

---

# 6. Why RAG?

Large Language Models possess broad knowledge but may produce inaccurate or hallucinated responses when answering domain-specific educational questions.

Retrieval-Augmented Generation (RAG) addresses this limitation by retrieving relevant educational content before generating a response.

Benefits include:

- Reduced Hallucinations
- Contextual Answers
- Source-Based Responses
- Updated Knowledge
- Better Educational Accuracy

---

# 7. Core AI Services

The AI subsystem provides:

- AI Tutor
- AI Notes Generator
- AI Flashcard Generator
- AI Question Generator
- AI Quiz Generator
- AI Study Planner
- AI Performance Coach
- AI Revision Assistant
- AI Answer Evaluator

Each service uses the same underlying RAG infrastructure while employing specialized prompts.

---

# 8. AI Design Principles

The architecture follows these principles:

- Ground Every Response
- Retrieve Before Generate
- Context Over Memory
- Modular AI Services
- Provider Independence
- Security by Design
- Explainable Outputs
- Minimize Token Usage
- Human Review for Admin Content

---

# 9. AI Provider

Primary AI Model

- Gemini 2.5 Pro

Future Supported Models

- GPT
- Claude
- Open Source Models

The platform should support changing AI providers with minimal changes to business logic.

---

# 10. AI Processing Pipeline

Every AI request follows:

```text
User Request

↓

Authentication

↓

Request Validation

↓

Context Detection

↓

RAG Retrieval

↓

Prompt Construction

↓

Gemini

↓

Initial Safety Validation

↓

Streaming Response

↓

Citation & Metadata Validation

↓

Conversation Storage
```

The response is streamed to the frontend for an improved user experience.

---

## End of Part 1

---

# Part 2 – RAG Pipeline & Document Processing

# 11. RAG Architecture

ExamNavigator implements Retrieval-Augmented Generation (RAG) to ensure that AI responses are grounded in verified educational resources rather than relying solely on the LLM's pretrained knowledge.

Knowledge Sources

- Official Syllabus
- Study Notes
- PDFs
- Formula Sheets
- Previous Year Questions
- AI Generated Notes
- Admin Approved Content

Only approved educational resources participate in retrieval.

---

# 12. RAG Pipeline

```text
Student Question

↓

Query Understanding

↓

Metadata Filtering

↓

Embedding Generation

↓

Vector Search

↓

Top-k Retrieval

↓

Context Builder

↓

Prompt Builder

↓

Gemini

↓

Initial Safety Validation

↓

Streaming Response

↓

Citation Validation
```

---

# 13. Document Ingestion Pipeline

Educational resources follow a standardized ingestion workflow.

```text
Document Upload

↓

Virus Scan

↓

File Validation

↓

Text Extraction

↓

Cleaning

↓

Chunking

↓

Embedding Generation

↓

Vector Indexing

↓

Processing Complete
```

Only documents with **Processing Complete** status are available for AI retrieval.

---

# 14. Chunking Strategy

Documents are divided into semantic chunks.

Each chunk contains:

- Chunk ID
- Source Document
- Subject
- Chapter
- Topic
- Chunk Text
- Token Count

Chunks should preserve educational context and avoid breaking concepts.

---

# 15. Embedding Strategy

Embeddings are generated using the configured embedding model.

Embeddings are created for:

- Notes
- PDFs
- Formula Sheets
- Question Bank
- Flashcards

Each embedding is linked to metadata for efficient filtering.

---

# 16. Metadata Filtering

Before semantic search, retrieval is narrowed using metadata.

Filters include:

- Exam
- Subject
- Chapter
- Topic
- Document Type
- Difficulty (where applicable)

Metadata filtering improves retrieval accuracy and reduces irrelevant context.

---

# 17. Vector Search

Vector Search retrieves the most semantically relevant chunks.

Retrieval process:

```text
User Query

↓

Embedding

↓

Metadata Filter

↓

Vector Similarity Search

↓

Top-k Chunks

↓

Context Builder
```

The number of retrieved chunks should be configurable.

---

# 18. Context Builder

The Context Builder combines:

- Retrieved Chunks
- Current Subject
- Current Topic
- Learning Context
- Conversation Summary (if applicable)

The constructed context is passed to the Prompt Builder.

---

# 19. Response Validation

Initial safety validation is performed before streaming begins.

After streaming completes, the system verifies citations, response completeness, and supporting metadata before storing the conversation.

- Validate formatting
- Remove unsafe content
- Verify retrieved citations
- Check response completeness

Invalid responses should trigger regeneration or graceful failure.

---

# 20. Document Lifecycle

```text
Uploaded

↓

Validated

↓

Processed

↓

Embedded

↓

Indexed

↓

Available

↓

Archived (Future)
```

---

## End of Part 2

---

# Part 3 – Prompt Engineering & Conversation Memory

# 21. Prompt Engineering

Each AI capability uses a dedicated prompt template.

Prompt categories:

- AI Tutor
- Notes Generator
- Flashcard Generator
- Question Generator
- Quiz Generator
- Study Planner
- Answer Evaluator

Prompt templates should be version-controlled.

---

# 22. Prompt Structure

Every prompt consists of:

- System Instructions
- User Query
- Retrieved Context
- Conversation Summary
- Output Instructions

This structure ensures consistent AI behavior.

---

# 23. System Prompt

The System Prompt defines:

- AI Role
- Educational Boundaries
- Tone
- Response Style
- Safety Rules
- Citation Rules

Users must never be able to modify the system prompt.

---

# 24. Prompt Injection Protection

The AI should defend against prompt injection attacks.

Protection includes:

- Input Sanitization
- Instruction Isolation
- Context Separation
- Prompt Validation
- Restricted System Prompt Access

Malicious instructions should be ignored.

---

# 25. Conversation Memory

Conversation memory is maintained per chat session.

Stored information includes:

- Previous Questions
- Previous Answers
- Current Subject
- Current Topic
- Learning Progress

Memory improves follow-up interactions.

---

# 26. Sliding Context Window

To control token usage, the platform implements a sliding context window.

Strategy:

- Keep recent messages.
- Summarize older messages.
- Preserve important concepts.
- Remove unnecessary history.

This balances context quality and API cost.

---

# 27. Conversation Summarization

Older conversations should be summarized automatically.

The summary retains:

- Important Concepts
- Student Doubts
- Learning Progress
- Current Discussion

The full conversation remains stored in the database.

---

# 28. Citation Strategy

Every educational response should include references to retrieved educational content whenever applicable.

Sources may include:

- Notes
- PDFs
- Formula Sheets
- Question Banks

This improves transparency and student trust.

---

# 29. AI Response Guidelines

AI responses should be:

- Accurate
- Educational
- Concise
- Structured
- Context-Aware
- Citation-Based

Responses should avoid unsupported claims.

---

# 30. Token Optimization

To reduce API cost:

- Limit retrieved chunks.
- Compress context.
- Remove duplicate information.
- Reuse conversation summaries.
- Stream responses using SSE.

The objective is to maximize answer quality while minimizing token consumption.

---

## End of Part 3

---

# Part 4 – AI Services, API Flow & Streaming

# 31. AI Service Architecture

The AI subsystem is composed of multiple independent services.

Services include:

- AI Tutor
- Question Generator
- Quiz Generator
- Notes Generator
- Flashcard Generator
- Study Planner
- Performance Coach
- Answer Evaluator

Each service shares the same RAG infrastructure while using its own prompt template and business rules.

---

# 32. AI Gateway

All AI requests enter through a centralized AI Gateway.

Responsibilities include:

- Authentication
- Authorization
- Request Validation
- User Quota Verification
- Rate Limiting
- Request Routing
- Logging

The gateway serves as the single entry point for every AI request.

---

# 33. AI Request Flow

```text
Frontend

↓

AI Gateway

↓

Authentication

↓

Quota Check

↓

Prompt Builder

↓

RAG Engine

↓

Gemini API

↓

Output Validation

↓

Streaming

↓

Frontend
```

---

# 34. AI Tutor Workflow

The AI Tutor performs:

- Concept Explanation
- Doubt Resolution
- Follow-up Questions
- Learning Guidance
- Reference Suggestions

Responses should remain educational and syllabus-focused.

---

# 35. AI Notes Generator

The Notes Generator creates:

- Short Notes
- Revision Notes
- Formula Sheets
- Key Points
- Summary Notes

Generated notes should reference retrieved educational material.

---

# 36. AI Question Generator

The Question Generator supports:

- MCQ
- Numerical
- Subjective
- Assertion-Reason
- Match the Following

Questions are categorized by:

- Difficulty
- Subject
- Chapter
- Topic
- Bloom's Taxonomy Level

AI-generated questions require admin approval before entering the Question Bank.

---

# 37. AI Study Planner

The Study Planner considers:

- Target Exam
- Remaining Time
- Weak Topics
- Strong Topics
- Daily Availability
- Previous Performance

The generated schedule should be realistic and adaptable.

---

# 38. AI Streaming

AI responses are delivered using Server-Sent Events (SSE).

Benefits include:

- Lower Time-To-First-Token (TTFT)
- Better User Experience
- Live Typing Effect
- Progressive Rendering
- Reduced Perceived Latency

### Streaming Workflow

```text
LLM Response

↓

Lightweight Safety Validation

↓

Start SSE Stream

↓

Incremental Token Streaming

↓

Final Citation & Metadata Delivery

↓

Close Connection
```

Streaming begins immediately after initial safety validation.

Only lightweight validation (authentication, request validation, prompt injection detection, and safety checks) is performed before streaming starts.

Citation metadata and supporting information are generated concurrently and delivered after the complete response has been streamed.

This approach minimizes Time-To-First-Token (TTFT) while maintaining response quality and grounded AI outputs.

The SSE connection closes automatically after the final event is transmitted.

# 39. AI Usage Limits

To ensure fair usage and control operational costs, the AI Gateway enforces:

- User-Level Daily AI Request Limits
- User-Level Token Consumption Limits
- Per-Minute Rate Limits
- Request Logging
- Quota Monitoring

When a user exceeds the allocated quota, the request is rejected with an appropriate error response.

Administrators can configure quota values without modifying application code.

---

# 40. AI Logging

The platform logs:

- AI Request ID
- Response Time
- Tokens Used
- Model Used
- Errors
- Retrieval Time

Prompt contents should never expose sensitive user information.

---

## End of Part 4

---

# Part 5 – AI Security, Guardrails & Cost Optimization

# 41. AI Security Architecture

AI security is implemented across multiple layers.

Layers include:

- Authentication
- Authorization
- Prompt Validation
- Input Sanitization
- Output Validation
- Rate Limiting
- Audit Logging

Security applies to every AI service.

---

# 42. Prompt Guardrails

The platform prevents prompt manipulation through:

- System Prompt Isolation
- User Prompt Validation
- Context Separation
- Restricted Instruction Execution
- Prompt Injection Detection

System prompts remain inaccessible to end users.

---

# 43. Content Safety

The AI should reject or safely respond to:

- Harmful Content
- Malicious Instructions
- Prompt Injection Attempts
- Offensive Language
- Requests Outside Educational Scope

Responses should remain professional and educational.

---

# 44. Cost Optimization Strategy

To reduce operational costs:

- Reuse Conversation Summaries
- Retrieve Only Required Chunks
- Limit Context Size
- Cache Frequently Used Responses (Future)
- Compress Prompts
- Optimize Token Usage

Cost optimization should never significantly reduce response quality.

---

# 45. AI Performance Metrics

The following metrics should be monitored:

- Time To First Token (TTFT)
- Total Response Time
- Retrieval Latency
- Token Usage
- Cost Per Request
- User Satisfaction

These metrics support continuous optimization.

---

# 46. AI Failure Handling

When AI services fail:

- Retry transient failures
- Return user-friendly messages
- Log the incident
- Preserve conversation state
- Avoid exposing internal errors

The application should degrade gracefully.

---

# 47. AI Monitoring

Monitor:

- API Usage
- Request Volume
- Error Rate
- Model Availability
- Vector Search Performance
- Embedding Generation
- Streaming Performance

Alerts should be generated for abnormal behavior.

---

# 48. AI Compliance

Educational AI should:

- Cite retrieved sources where applicable
- Avoid unsupported claims
- Respect user privacy
- Store only necessary data
- Follow secure data handling practices

---

# 49. Future AI Enhancements

Future improvements include:

- Multi-LLM Support
- AI Model Routing
- Voice Tutor
- OCR-Based Question Solving
- Image Understanding
- Personalized AI Mentor
- Offline AI Assistance (Future)

---

# 50. AI Architecture Summary

The AI architecture combines:

- Retrieval-Augmented Generation
- Modular AI Services
- Prompt Engineering
- Secure Guardrails
- Streaming Responses
- Cost Optimization
- Conversation Memory

This architecture provides accurate, scalable, and secure AI-powered educational assistance while minimizing hallucinations and operational costs.

---

## End of Part 5

---

# Part 6 – Future Evolution & Best Practices

# 51. Future AI Roadmap

The AI architecture is designed to evolve over time.

Future capabilities include:

- Multi-LLM Routing
- Voice Tutor
- OCR-Based Question Solving
- Diagram Understanding
- Personalized AI Mentor
- Adaptive Learning Engine
- Real-Time Collaboration
- Offline AI Assistance
- Institution-Specific AI Models

The architecture should support these additions without major redesign.

---

# 52. Multi-LLM Strategy

The platform should remain independent of any single AI provider.

Supported providers may include:

- Gemini
- OpenAI GPT
- Anthropic Claude
- Open Source Models

The AI Gateway should route requests without affecting business logic.

---

# 53. AI Model Selection Strategy

Different AI tasks may use different models.

Examples:

- AI Tutor → Large Reasoning Model
- Flashcard Generation → Lightweight Model
- Question Generation → Reasoning Model
- OCR Processing → Vision Model
- Summarization → Cost-Optimized Model

This reduces operational cost while maintaining quality.

---

# 54. Continuous Learning

The platform should continuously improve through:

- User Feedback
- AI Quality Metrics
- Prompt Versioning
- Model Evaluation
- Retrieval Performance Analysis

Improvements should be data-driven.

---

# 55. AI Quality Assurance

AI outputs should be evaluated using:

- Accuracy
- Relevance
- Groundedness
- Citation Quality
- Response Time
- User Satisfaction
- Hallucination Rate

Regular evaluation ensures reliable educational assistance.

---

# 56. Best Practices

The AI subsystem should always:

- Retrieve Before Generate
- Use Metadata Filtering
- Limit Context Size
- Stream Responses
- Protect System Prompts
- Respect User Privacy
- Track AI Usage
- Log Errors Securely
- Optimize Token Consumption

These practices ensure long-term maintainability.

---

# 57. AI Documentation Standards

Future AI development should document:

- Prompt Templates
- Prompt Versions
- Embedding Models
- Retrieval Parameters
- Model Configurations
- Performance Metrics
- Cost Reports

Documentation should remain synchronized with implementation.

---

# 58. AI Deployment Guidelines

Production deployment should ensure:

- Secure API Keys
- Environment Variable Management
- HTTPS Communication
- Monitoring & Alerting
- Automatic Logging
- Backup Configuration
- Health Checks

AI services should remain highly available.

---

# 59. AI Readiness Checklist

Before production deployment, verify:

- RAG Pipeline Functional
- Prompt Templates Reviewed
- Embeddings Generated
- Vector Index Ready
- Metadata Filters Working
- SSE Streaming Enabled
- AI Quotas Configured
- Guardrails Active
- Monitoring Enabled

---

# 60. Conclusion

The AI & RAG architecture provides the foundation for an intelligent, scalable, and secure educational platform.

By combining Retrieval-Augmented Generation, modular AI services, prompt engineering, metadata-aware retrieval, streaming responses, and robust security practices, ExamNavigator delivers accurate, explainable, and personalized learning experiences while remaining cost-efficient and future-ready.

---

# End of AI_RAG_ARCHITECTURE Document