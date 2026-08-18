# Database Schema Document (DSD)

# ExamNavigator

Version: 1.0

Status: Architecture Frozen

Author: Maverik

Last Updated: August 2026

---

# Table of Contents

1. Introduction
2. Purpose
3. Database Design Goals
4. Database Selection
5. Database Architecture
6. Database Design Principles
7. Collections Overview
8. Collection Relationships
9. Entity Relationship Overview
10. Future Database Evolution

---

# 1. Introduction

The Database Schema Document defines the complete logical and physical database design for the ExamNavigator platform.

The database serves as the central source of truth for all application data including users, educational content, AI-generated resources, assessments, analytics, study plans, and administrative information.

The design follows a document-oriented approach using MongoDB Atlas to support flexibility, scalability, and efficient handling of hierarchical educational data.

---

# 2. Purpose

This document defines:

- Database architecture
- Collection structures
- Relationships
- Naming conventions
- Indexing strategy
- Validation rules
- Vector storage strategy
- Future scalability

The objective is to maintain a well-structured, maintainable, and scalable database throughout the project lifecycle.

---

# 3. Database Design Goals

The database has been designed to satisfy the following objectives.

## Flexibility

Support dynamic educational content without frequent schema modifications.

---

## Scalability

Handle increasing users, educational resources, AI conversations, and assessments with minimal architectural changes.

---

## Performance

Optimize read and write operations through indexing and efficient document modeling.

---

## Maintainability

Ensure collections remain modular and easy to understand.

---

## Security

Protect sensitive information using secure storage practices and proper access controls.

---

## AI Compatibility

Support Retrieval-Augmented Generation through vector embeddings and metadata filtering.

---

# 4. Database Selection

ExamNavigator uses **MongoDB Atlas** as the primary database.

Reasons for selection:

- Flexible document model
- JSON-like document storage
- Excellent integration with Node.js
- Horizontal scalability
- Aggregation framework
- Atlas Vector Search
- Cloud-native deployment
- Free tier suitable for MVP

MongoDB Atlas serves as both the operational database and the vector database for AI retrieval.

---

# 5. Database Architecture

The database architecture follows a domain-driven organization.

```text
Application

↓

Business Modules

↓

MongoDB Collections

↓

Indexes

↓

Atlas Vector Search
```

Each business module owns its respective collections while sharing common reference data where appropriate.

---

# 6. Database Design Principles

The database follows these principles:

- Document-Oriented Design
- Minimal Data Duplication
- Reference Where Necessary
- Embed Where Appropriate
- Consistent Naming
- Efficient Query Design
- Optimized Indexing
- Future Scalability

Collections should represent business domains rather than technical implementation details.

---

## End of Part 1

---

# 7. Collections Overview

The following collections constitute the core database of ExamNavigator.

| Collection | Purpose |
|------------|---------|
| users | Student and administrator accounts |
| userProfiles | Extended profile information |
| subjects | Subject definitions |
| chapters | Chapter information |
| topics | Topic hierarchy |
| documents | Uploaded educational resources |
| documentChunks | Processed document chunks |
| embeddings | Vector embeddings |
| questionBank | AI and admin approved questions |
| quizzes | Quiz definitions |
| mockTests | Mock examinations |
| testAttempts | Student submissions |
| analytics | Learning analytics |
| studyPlans | Personalized study schedules |
| flashcards | AI-generated flashcards |
| notes | AI-generated and uploaded notes |
| bookmarks | Saved learning resources |
| chatSessions | AI conversation sessions |
| chatMessages | Individual AI messages |
| notifications | User notifications |
| feedback | User feedback |
| reports | Administrative reports |
| settings | Platform settings |
| auditLogs | System activity logs |

---

# 8. Collection Relationships

The logical relationships between collections are shown below.

```text
Users

├── User Profiles

├── Study Plans

├── Bookmarks

├── Notifications

├── Analytics

├── Chat Sessions

│      └── Chat Messages

├── Test Attempts

└── Feedback
```

---

```text
Exams (ExamModel: canonical root entity)

↓

Subjects (SubjectModel: examId ref Exam)

↓

Chapters (ChapterModel: subjectId ref Subject)

↓

Topics (TopicModel: chapterId ref Chapter)

↓

Learning Resources (LearningResourceModel: topicId ref Topic)

↓

Embeddings (EmbeddingModel: chunk metadata filtering)
```

---

```text
Subjects

↓

Question Bank

↓

Quizzes

↓

Mock Tests

↓

Test Attempts

↓

Analytics
```

---

# 9. Entity Relationship Overview

Although MongoDB is document-oriented, the application maintains logical relationships between collections.

Primary relationships include:

Users → Study Plans

Users → Analytics

Users → Chat Sessions

Users → Test Attempts

Subjects → Chapters

Chapters → Topics

Topics → Documents

Documents → Chunks

Chunks → Embeddings

Question Bank → Mock Tests

Mock Tests → Test Attempts

Test Attempts → Analytics

Analytics → Recommendations

These relationships support efficient querying while avoiding excessive document nesting.

---

# 10. Database Organization Strategy

Collections are organized into five logical domains.

## User Domain

- users
- userProfiles
- bookmarks
- notifications

---

## Learning Domain

- subjects
- chapters
- topics
- documents
- notes
- flashcards

---

## Assessment Domain

- questionBank
- quizzes
- mockTests
- testAttempts

---

## AI Domain

- documentChunks
- embeddings
- chatSessions
- chatMessages

---

## Administration Domain

- feedback
- reports
- settings
- auditLogs

Each domain remains logically independent while allowing controlled relationships through document references.

---

## End of Part 2

---

# Part 3 – Collection Schemas

# 11. Users Collection

Purpose

Stores authentication and basic account information.

Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary Key |
| fullName | String | User Name |
| email | String | Unique Email |
| password | String | Hashed Password |
| role | String | Student / Admin |
| profileId | ObjectId | Reference to User Profile |
| accountStatus | String | Active / Suspended |
| emailVerified | Boolean | Verification Status |
| createdAt | Date | Creation Timestamp |
| updatedAt | Date | Last Update |

---

# 12. User Profiles Collection

Purpose

Stores extended profile information.

Fields

- userId
- profileImage
- gender
- dateOfBirth
- phoneNumber
- targetExam
- targetYear
- preferredSubjects
- learningPreferences
- createdAt
- updatedAt

---

# 13. Subjects Collection

Purpose

Stores available subjects.

Fields

- subjectName
- description
- icon
- displayOrder
- createdAt
- updatedAt

Example

```text
Physics
Chemistry
Mathematics
Biology
```

---

# 14. Chapters Collection

Purpose

Stores chapters for every subject.

Fields

- subjectId
- chapterName
- description
- estimatedLearningHours
- difficultyLevel
- displayOrder

---

# 15. Topics Collection

Purpose

Stores individual learning topics.

Fields

- chapterId
- topicName
- description
- estimatedTime
- prerequisites
- learningObjectives

---

# 16. Documents Collection

Purpose

Stores uploaded educational resources.

Fields

- title
- subjectId
- chapterId
- topicId
- uploadedBy
- documentType
- cloudStorageUrl
- fileSize
- uploadStatus
- processingStatus
- createdAt

Supported Types

- PDF
- Notes
- Formula Sheet
- PYQ
- Study Material

---

# 17. Document Chunks Collection

Purpose

Stores processed chunks used for RAG.

Fields

- documentId
- chunkNumber
- chunkText
- tokenCount
- metadata
- embeddingId
- createdAt

Each document may generate hundreds of chunks.

---

# 18. Embeddings Collection

Purpose

Stores vector representations.

Fields

- chunkId
- embeddingModel
- vector
- subjectId
- chapterId
- topicId
- createdAt

This collection powers semantic search.

---

# 19. Notes Collection

Purpose

Stores AI-generated and admin-created notes.

Fields

- title
- subjectId
- chapterId
- topicId
- content
- source
- generatedByAI
- version
- createdAt

---

# 20. Flashcards Collection

Purpose

Stores flashcards.

Fields

- topicId
- question
- answer
- difficulty
- generatedByAI
- createdAt

---

## End of Part 3

---

# Part 4 – Assessment, Analytics & AI Collections

# 21. Question Bank Collection

Purpose

Stores all approved questions.

Fields

- questionText
- options
- correctAnswer
- explanation
- subjectId
- chapterId
- topicId
- difficulty
- questionType
- bloomLevel
- tags
- generatedByAI
- approvedBy
- createdAt

Supported Types

- MCQ
- Numerical
- Subjective
- Assertion Reason
- Match the Following

---

# 22. Quizzes Collection

Purpose

Stores generated quizzes.

Fields

- title
- subjectId
- chapterId
- topicId
- questionIds
- totalMarks
- duration
- difficulty
- createdBy
- createdAt

---

# 23. Mock Tests Collection

Purpose

Stores full examinations.

Fields

- title
- examType
- questionIds
- totalQuestions
- totalMarks
- duration
- negativeMarking
- createdAt

---

# 24. Test Attempts Collection

Purpose

Purpose

Stores both in-progress and submitted mock test attempts, enabling draft recovery, evaluation, and performance tracking.

Fields

- userId
- mockTestId
- answers
- score
- accuracy
- rank
- totalTime
- submittedAt
- status
- draftAnswers
- lastSavedAt

Status Values

- IN_PROGRESS
- SUBMITTED
- ABANDONED

---

# 25. Analytics Collection

Purpose

Stores learning statistics.

Fields

- userId
- studyHours
- completedTopics
- completedChapters
- completedSubjects
- quizAccuracy
- weakTopics
- strongTopics
- averageScore
- predictedReadiness
- updatedAt

---

# 26. Study Plans Collection

Purpose

Stores personalized study schedules.

Fields

- userId
- dailyGoals
- weeklyGoals
- revisionSchedule
- completedTasks
- AIRecommendations
- createdAt

---

# 27. Chat Sessions Collection

Purpose

Stores AI conversation sessions.

Fields

- userId
- title
- subjectId
- currentTopic
- conversationSummary
- startedAt
- lastActivity

Each session contains multiple chat messages.

### Conversation Summary

The `conversationSummary` field stores an AI-generated summary of older messages within a chat session.

The AI updates this summary periodically as conversations grow longer.

During RAG retrieval, the summary is used together with recent chat messages to preserve conversational context while minimizing token usage.

---

# 28. Chat Messages Collection

Purpose

Stores conversation history.

Fields

- sessionId
- sender
- message
- citations
- retrievedDocuments
- AIResponseTime
- createdAt

---

# 29. Notifications Collection

Purpose

Stores platform notifications.

Fields

- userId
- title
- description
- notificationType
- isRead
- createdAt

---

# 30. Feedback Collection

Purpose

Stores feedback submitted by users.

Fields

- userId
- category
- message
- rating
- status
- createdAt

---

# 31. Reports Collection

Purpose

Stores generated reports.

Fields

- reportType
- generatedBy
- reportUrl
- createdAt

---

# 32. Settings Collection

Purpose

Stores configurable platform settings.

Fields

- settingKey
- settingValue
- updatedAt

---

# 33. Audit Logs Collection

Purpose

Stores important system events.

Fields

- userId
- action
- module
- ipAddress
- device
- timestamp

Audit logs support monitoring, debugging, and security investigations.

---

## End of Part 4

---

# Part 5 – Database Indexing, Validation & Constraints

# 34. Indexing Strategy

Indexes are created to improve query performance and reduce database response time.

The indexing strategy focuses on:

- Frequently searched fields
- Authentication queries
- Learning content retrieval
- Analytics
- AI retrieval
- Mock tests

---

# 35. Primary Indexes

The following fields should be indexed.

## Users

- email (Unique)
- role
- accountStatus

---

## Subjects

- subjectName

---

## Chapters

- subjectId
- chapterName

---

## Topics

- chapterId
- topicName

---

## Documents

- subjectId
- chapterId
- topicId
- processingStatus

---

## Question Bank

- subjectId
- chapterId
- topicId
- difficulty
- questionType

---

## Test Attempts

- userId
- mockTestId
- submittedAt

---

## Analytics

- userId

---

## Study Plans

- userId

---

## Chat Sessions

- userId
- lastActivity

---

## Chat Messages

- sessionId
- createdAt

---

## Notifications

- userId
- isRead

---

# 36. Compound Indexes

To improve multi-condition queries, compound indexes should be created.

Examples:

- subjectId + chapterId
- chapterId + topicId
- subjectId + difficulty
- userId + submittedAt
- userId + lastActivity
- processingStatus + createdAt

These indexes improve filtering and dashboard performance.

---

# 37. Unique Constraints

The following fields must remain unique.

| Collection | Field |
|------------|-------|
| users | email |
| subjects | subjectName |
| settings | settingKey |

Additional uniqueness may be enforced where business rules require it.

---

# 38. Validation Rules

Every collection should implement validation.

Examples include:

Users

- Valid Email
- Strong Password
- Required Name

Documents

- Valid File Type
- Maximum File Size

Question Bank

- Correct Answer Required
- Minimum Two Options

Study Plans

- Valid User Reference

Chat Messages

- Valid Session Reference

Validation should occur at both application and database levels whenever possible.

---

# 39. Data Integrity Rules

The database should maintain logical consistency.

Examples:

- A chapter must belong to one subject.
- A topic must belong to one chapter.
- A question must belong to one topic.
- A chat message must belong to one session.
- A study plan must belong to one user.

Broken references should be prevented by application logic.

---

# 40. Soft Delete Strategy

Collections supporting deletion should implement soft delete.

Fields include:

- isDeleted
- deletedAt
- deletedBy

Soft deletion preserves historical records and supports audit requirements.

---

# 41. Audit Fields

Every major collection should include:

- createdAt
- updatedAt
- createdBy
- updatedBy

These fields improve traceability and administrative monitoring.

---

## End of Part 5

---

# Part 6 – Vector Search, AI Data & Future Scalability

# 42. Vector Search Architecture

MongoDB Atlas Vector Search is used as the semantic retrieval engine for the RAG pipeline.

The vector index stores embeddings generated from educational content.

Supported sources include:

- Notes
- PDFs
- PYQs
- Formula Sheets
- AI Notes
- Question Bank

Only approved educational content is indexed.

---

# 43. Metadata Filtering Strategy

Before semantic search, metadata filtering should narrow the search scope.

Filters include:

- Exam
- Subject
- Chapter
- Topic
- Document Type

This improves retrieval accuracy and reduces unrelated search results.

---

# 44. Embedding Storage Strategy

Each processed chunk generates one embedding.

Each embedding stores:

- chunkId
- embeddingModel
- vector
- metadata
- createdAt

Embeddings remain independent from original documents to simplify future model upgrades.

---

# 45. Document Processing Status

Uploaded resources move through the following lifecycle.

```text
Uploaded

↓

Queued

↓

Processing

↓

Chunked

↓

Embedded

↓

Indexed

↓

Available for AI
```

Documents should not be available for AI retrieval until indexing is complete.

---

# 46. AI Retrieval Strategy

The retrieval process follows:

```text
Student Question

↓

Metadata Filter

↓

Vector Search

↓

Top Matching Chunks

↓

Prompt Builder

↓

Gemini

↓

Grounded Response
```

This ensures every educational response is based on verified resources.

---

# 47. Conversation Memory Strategy

Conversation history should use a sliding context window.

Rules include:

- Maintain recent messages.
- Summarize older conversations when necessary.
- Preserve topic continuity.
- Limit token usage.

This balances context quality and AI cost.

---

# 48. Database Backup Strategy

Database backups should include:

- Automated Backups
- Point-in-Time Recovery (Future)
- Export Capability

Critical educational data should be recoverable.

---

# 49. Database Performance Strategy

Performance improvements include:

- Proper Indexing
- Pagination
- Aggregation Optimization
- Efficient References
- Metadata Filtering
- Query Projection

Large collections should avoid unnecessary document retrieval.

---

# 50. Future Database Evolution

Future enhancements may include:

- Redis Cache
- Read Replicas
- Database Sharding
- Background Processing Queue
- Distributed Search
- Multi-Region Deployment

These enhancements should be introduced only when platform growth requires them.

---

# 51. Database Naming Conventions

Collection Names

- camelCase
- Plural Form

Field Names

- camelCase

Reference Fields

- userId
- subjectId
- chapterId
- topicId

Timestamp Fields

- createdAt
- updatedAt

Boolean Fields

- isActive
- isDeleted
- isRead
- isVerified

Naming consistency should be maintained across all collections.

---

# 52. Database Summary

The ExamNavigator database is designed to provide:

- Flexible document storage
- Efficient AI retrieval
- Modular collection organization
- Scalable architecture
- Secure data management
- Optimized query performance

The schema supports both traditional application data and AI-powered educational workflows while remaining extensible for future platform growth.

---

# End of Database Schema Document

