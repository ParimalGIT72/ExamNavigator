# API Specification Document (ASD)

# ExamNavigator

Version: 1.0

Status: Architecture Frozen

Author: Maverik

Last Updated: August 2026

---

# Table of Contents

1. Introduction
2. Purpose
3. API Design Principles
4. API Standards
5. Authentication
6. Versioning
7. Request Standards
8. Response Standards
9. HTTP Status Codes
10. Error Handling

---

# Part 1 – API Overview & Standards

# 1. Introduction

This document defines the REST API specification for ExamNavigator.

The APIs provide secure communication between the frontend application and backend services.

The API layer acts as the single gateway for all application functionality including authentication, learning, AI services, assessments, analytics, administration, and notifications.

---

# 2. Purpose

The objectives of this document are:

- Define REST endpoints
- Standardize request formats
- Standardize response formats
- Ensure secure API communication
- Simplify frontend-backend integration
- Maintain consistency across all modules

---

# 3. API Architecture

The application follows RESTful architecture.

```text
Frontend

↓

HTTPS Request

↓

REST API

↓

Authentication

↓

Authorization

↓

Validation

↓

Business Logic

↓

MongoDB / AI

↓

JSON Response
```

---

# 4. Base URL

Development

```text
http://localhost:5000/api/v1
```

Production

```text
https://api.examnavigator.com/api/v1
```

---

# 5. API Versioning

Every endpoint follows versioning.

Example

```text
/api/v1/auth/login

/api/v1/users/profile

/api/v1/subjects
```

Future versions

```text
/api/v2/
/api/v3/
```

---

# 6. API Design Principles

The API follows:

- RESTful Design
- Stateless Requests
- JSON Communication
- Secure Authentication
- Standard Responses
- Resource-Based URLs
- Proper HTTP Methods
- Consistent Naming

---

# 7. HTTP Methods

| Method | Purpose |
|----------|---------|
| GET | Retrieve Data |
| POST | Create Resource |
| PUT | Replace Resource |
| PATCH | Partial Update |
| DELETE | Remove Resource |

---

# 8. Request Format

Every request should include

Headers

```http
Content-Type: application/json

Authorization: Bearer <JWT_TOKEN>
```

Body

```json
{
  "data": {}
}
```

---

# 9. Response Format

Successful response

```json
{
  "success": true,
  "message": "Operation successful.",
  "data": {}
}
```

Error response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

---

# 10. HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Failed |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

# 11. Authentication Strategy

Protected endpoints require JWT authentication.

Flow

```text
Login

↓

JWT Generated

↓

Frontend Stores Token

↓

Token Attached To Every Request

↓

Middleware Verification

↓

Authorized Access
```

---

# 12. Authorization

Role Based Access Control (RBAC)

Roles

- Student
- Admin

Authorization determines access to:

- Student APIs
- Admin APIs
- AI Management
- Content Management

---

# 13. Rate Limiting

API requests should be limited to prevent abuse.

Protection applies to:

- Login APIs
- AI APIs
- Upload APIs

### AI API Quotas

The AI Gateway enforces user-level quotas for all AI endpoints.

Quota controls include:

- Daily AI Request Limits
- Daily Token Consumption Limits
- Per-Minute Rate Limits
- Request Logging
- Quota Monitoring

The following endpoints are subject to AI quotas:

- POST /ai/chat
- POST /ai/chat/{sessionId}
- POST /ai/notes
- POST /ai/flashcards
- POST /ai/questions
- POST /ai/quizzes
- POST /ai/study-plan

If a user exceeds the allocated quota, the API returns:

```http
HTTP 429 Too Many Requests
```

with an appropriate error message.

Administrators can configure quota limits without modifying application code.

---

# 14. API Security

Every endpoint should implement:

- JWT Authentication
- Input Validation
- Output Sanitization
- HTTPS
- Rate Limiting
- Role Validation
- Prompt Injection Protection (AI APIs)

---

## End of Part 1

---

# Part 2 – Authentication APIs

Authentication endpoints manage user identity and secure platform access.

---

# 15. Register User

Endpoint

```http
POST /auth/register
```

Purpose

Create a new student account.

Authentication Required

No

Request

```json
{
  "fullName": "",
  "email": "",
  "password": "",
  "targetExam": ""
}
```

Response

```json
{
  "success": true,
  "message": "Registration successful."
}
```

---

# 16. Login

Endpoint

```http
POST /auth/login
```

Purpose

Authenticate existing user.

Authentication Required

No

Request

```json
{
  "email": "",
  "password": ""
}
```

Response

```json
{
  "token": "",
  "user": {}
}
```

---

# 17. Logout

Endpoint

```http
POST /auth/logout
```

Purpose

Logout current user.

Authentication Required

Yes

---

# 18. Refresh Token

Endpoint

```http
POST /auth/refresh-token
```

Purpose

Issue a new JWT token.

Authentication Required

Yes

---

# 19. Forgot Password

Endpoint

```http
POST /auth/forgot-password
```

Purpose

Send password reset link.

Authentication Required

No

---

# 20. Reset Password

Endpoint

```http
POST /auth/reset-password
```

Purpose

Reset user password.

Authentication Required

No

---

# 21. Verify Email

Endpoint

```http
POST /auth/verify-email
```

Purpose

Verify user email.

Authentication Required

No

---

# 22. Google OAuth Login

Endpoint

```http
POST /auth/google
```

Purpose

Authenticate using Google.

Authentication Required

No

---

# 23. GitHub OAuth Login

Endpoint

```http
POST /auth/github
```

Purpose

Authenticate using GitHub.

Authentication Required

No

---

# 24. Get Current User

Endpoint

```http
GET /auth/me
```

Purpose

Retrieve authenticated user information.

Authentication Required

Yes

---

# 25. Change Password

Endpoint

```http
PATCH /auth/change-password
```

Purpose

Change current password.

Authentication Required

Yes

---

# 26. Delete Account

Endpoint

```http
DELETE /auth/account
```

Purpose

Delete user account.

Authentication Required

Yes

Soft delete should be used.

---

# 27. Update Profile

Endpoint

```http
PATCH /users/profile
```

Purpose

Update user profile.

Authentication Required

Yes

---

# 28. Upload Profile Image

Endpoint

```http
POST /users/profile-image
```

Purpose

Upload profile picture.

Authentication Required

Yes

---

# 29. Get User Profile

Endpoint

```http
GET /users/profile
```

Purpose

Retrieve user profile.

Authentication Required

Yes

---

## End of Part 2

---

# Part 3 – Student APIs

Student APIs provide access to learning resources, assessments, AI services, analytics, and profile management.

---

# 30. Get Dashboard

Endpoint

```http
GET /dashboard
```

Purpose

Retrieve student dashboard information.

Authentication Required

Yes

---

# 30B. Get Registered Exams

Endpoint

```http
GET /exams
```

Purpose

Retrieve active registered exams for use by public/student clients.

Authentication Required

Yes

---

# 31. Get Subjects

Endpoint

```http
GET /subjects
```

Purpose

Retrieve subjects scoped server-side to the authenticated student's assigned target exam (`UserProfile.targetExam`).

Authentication Required

Yes

Security & Scoping Note:

- Client-supplied `?examType=...` query parameters CANNOT override a student's assigned target exam.
- Direct resource access (`GET /subjects/:subjectId`, `GET /subjects/:subjectId/chapters`) enforces target exam ownership checks and returns `403 Forbidden` (`FORBIDDEN_EXAM_CURRICULUM`) if a student attempts direct ID manipulation across exams.

---

# 32. Get Chapters

Endpoint

```http
GET /subjects/{subjectId}/chapters
```

Purpose

Retrieve chapters of a subject.

Authentication Required

Yes

---

# 33. Get Topics

Endpoint

```http
GET /chapters/{chapterId}/topics
```

Purpose

Retrieve topics of a chapter.

Authentication Required

Yes

---

# 34. Get Learning Resources

Endpoint

```http
GET /topics/{topicId}/resources
```

Purpose

Retrieve notes, PDFs, flashcards and learning material.

Authentication Required

Yes

---

# 35. Get Notes

Endpoint

```http
GET /notes/{topicId}
```

Purpose

Retrieve topic notes.

Authentication Required

Yes

---

# 36. Get Flashcards

Endpoint

```http
GET /flashcards/{topicId}
```

Purpose

Retrieve flashcards.

Authentication Required

Yes

---

# 37. Bookmark Resource

Endpoint

```http
POST /bookmarks
```

Purpose

Bookmark learning resources.

Authentication Required

Yes

---

# 38. Get Bookmarks

Endpoint

```http
GET /bookmarks
```

Purpose

Retrieve bookmarked resources.

Authentication Required

Yes

---

# 39. Create Study Plan

Endpoint

```http
POST /study-plans
```

Purpose

Generate AI study plan.

Authentication Required

Yes

---

# 40. Get Study Plan

Endpoint

```http
GET /study-plans
```

Purpose

Retrieve current study plan.

Authentication Required

Yes

---

# 41. Update Study Progress

Endpoint

```http
PATCH /study-progress
```

Purpose

Update completed learning progress.

Authentication Required

Yes

---

# 42. Get Quiz

Endpoint

```http
GET /quizzes/{quizId}
```

Purpose

Retrieve quiz.

Authentication Required

Yes

---

# 43. Submit Quiz

Endpoint

```http
POST /quizzes/{quizId}/submit
```

Purpose

Submit quiz answers.

Authentication Required

Yes

---

# 44. Get Mock Tests

Endpoint

```http
GET /mock-tests
```

Purpose

Retrieve available mock tests.

Authentication Required

Yes

---

# 45. Start Mock Test

Endpoint

```http
POST /mock-tests/{mockTestId}/start
```

Purpose

Start examination.

Authentication Required

Yes

---
# 46. Save Mock Test Draft

Endpoint

```http
POST /mock-tests/{mockTestId}/save
```

Purpose

Save the student's current mock test progress for recovery.

Authentication Required

Yes

---

# 47. Resume Mock Test

Endpoint

```http
GET /mock-tests/{mockTestId}/resume
```

Purpose

Retrieve the latest saved mock test draft.

Authentication Required

Yes

---

# 48. Submit Mock Test

Endpoint

```http
POST /mock-tests/{mockTestId}/submit
```

Purpose

Submit a completed mock test for evaluation.

Authentication Required

Yes

Submission Workflow

- Validate submitted answers.
- Calculate score, accuracy, and total time synchronously.
- Store the test attempt.
- Return the result immediately to the student.
- Update detailed analytics (readiness score, weak topics, trends, recommendations) asynchronously.

Request Body

```json
{
  "answers": [
    {
      "questionId": "...",
      "selectedOption": "B"
    }
  ]
}
```

Successful Response

```json
{
  "score": 92,
  "accuracy": 88,
  "totalTime": 5100,
  "status": "Submitted"
}
```
Response

The API returns:

- Score
- Accuracy
- Total Time
- Subject-wise Performance
- Submission Status

Rank calculation may be performed asynchronously depending on platform configuration.

# 49. Get Test History

Endpoint

```http
GET /test-attempts
```

Purpose

Retrieve previous attempts.

Authentication Required

Yes

---

# 50. Get Analytics

Endpoint

```http
GET /analytics
```

Purpose

Retrieve learning analytics.

Authentication Required

Yes

---

# 51. Get Notifications

Endpoint

```http
GET /notifications
```

Purpose

Retrieve notifications.

Authentication Required

Yes

---

# 52. Mark Notification Read

Endpoint

```http
PATCH /notifications/{notificationId}
```

Purpose

Mark notification as read.

Authentication Required

Yes

---

## End of Part 3

---

# Part 4 – Administrator APIs

Administrator APIs are accessible only to users with the Admin role.

---

# 53. Get Users

Endpoint

```http
GET /admin/users
```

Purpose

Retrieve all users.

Authentication Required

Admin

---

# 54. Get User Details

Endpoint

```http
GET /admin/users/{userId}
```

Purpose

Retrieve user information.

Authentication Required

Admin

---

# 55. Update User Status

Endpoint

```http
PATCH /admin/users/{userId}
```

Purpose

Activate or suspend users.

Authentication Required

Admin

---

# 56. Delete User

Endpoint

```http
DELETE /admin/users/{userId}
```

Purpose

Soft delete user.

Authentication Required

Admin

---

# 57. Create Subject

Endpoint

```http
POST /admin/subjects
```

Purpose

Create subject.

Authentication Required

Admin

---

# 58. Update Subject

Endpoint

```http
PATCH /admin/subjects/{subjectId}
```

Purpose

Update subject.

Authentication Required

Admin

---

# 59. Delete Subject

Endpoint

```http
DELETE /admin/subjects/{subjectId}
```

Purpose

Delete subject.

Authentication Required

Admin

---

# 60. Create Chapter

Endpoint

```http
POST /admin/chapters
```

Purpose

Create chapter.

Authentication Required

Admin

---

# 61. Create Topic

Endpoint

```http
POST /admin/topics
```

Purpose

Create topic.

Authentication Required

Admin

---

# 62. Upload Educational Document

Endpoint

```http
POST /admin/documents
```

Purpose

Upload study material.

Authentication Required

Admin

---

# 63. Get Uploaded Documents

Endpoint

```http
GET /admin/documents
```

Purpose

Retrieve uploaded resources.

Authentication Required

Admin

---

# 64. Delete Document

Endpoint

```http
DELETE /admin/documents/{documentId}
```

Purpose

Remove uploaded document.

Authentication Required

Admin

---

# 65. Get Generated Questions

Endpoint

```http
GET /admin/questions
```

Purpose

Retrieve AI-generated questions.

Authentication Required

Admin

---

# 66. Approve Question

Endpoint

```http
PATCH /admin/questions/{questionId}/approve
```

Purpose

Approve AI-generated question.

Authentication Required

Admin

---

# 67. Reject Question

Endpoint

```http
PATCH /admin/questions/{questionId}/reject
```

Purpose

Reject generated question.

Authentication Required

Admin

---

# 68. Create Mock Test

Endpoint

```http
POST /admin/mock-tests
```

Purpose

Create mock examination.

Authentication Required

Admin

---

# 69. Get Platform Analytics

Endpoint

```http
GET /admin/analytics
```

Purpose

Retrieve overall platform analytics.

Authentication Required

Admin

---

# 70. Get Feedback

Endpoint

```http
GET /admin/feedback
```

Purpose

Retrieve user feedback.

Authentication Required

Admin

---

# 71. Update Platform Settings

Endpoint

```http
PATCH /admin/settings
```

Purpose

Update platform configuration.

Authentication Required

Admin

---

# 72. View Audit Logs

Endpoint

```http
GET /admin/audit-logs
```

Purpose

Retrieve system audit logs.

Authentication Required

Admin

---

## End of Part 4

---

# Part 5 – AI & RAG APIs

These APIs provide AI-powered educational capabilities.

All AI endpoints require authentication.

---

# 73. AI Tutor

Endpoint

```http
POST /ai/chat
```

Purpose

Ask educational questions to the AI Tutor using Retrieval-Augmented Generation (RAG).

Authentication Required

Yes

Request Type

```text
Content-Type: application/json
```

Response Type

```text
Content-Type: text/event-stream
```

Response Behavior

- AI responses are streamed using Server-Sent Events (SSE).
- Tokens are streamed incrementally.
- The connection closes automatically after the complete response is generated.
- In case of failure, an error event is returned.

Request Body

```json
{
  "message": "Explain Binary Search.",
  "sessionId": "optional",
  "subjectId": "optional",
  "chapterId": "optional",
  "topicId": "optional"
}
```

Successful Response

```json
Initial SSE Events

event: session
data: {
  "success": true,
  "sessionId": "..."
}

event: token
data: "Binary"

event: token
data: " Search"

...

event: metadata
data: {
  "citations": [],
  "retrievedDocuments": []
}

event: done
data: {}
```
---

# 74. Continue AI Conversation

Endpoint

```http
POST /ai/chat/{sessionId}
```

Purpose

Continue an existing AI conversation.

Authentication Required

Yes

Request Type

```text
Content-Type: application/json
```

Response Type

```text
Content-Type: text/event-stream
```

Response Behavior

- Responses are streamed using Server-Sent Events (SSE).
- Previous conversation context is loaded before retrieval.
- Streaming follows the same protocol as the AI Tutor endpoint.

---

# 75. Get Chat Sessions

Endpoint

```http
GET /ai/chat/sessions
```

Purpose

Retrieve previous AI conversations.

Authentication Required

Yes

---

# 76. Get Chat Messages

Endpoint

```http
GET /ai/chat/{sessionId}/messages
```

Purpose

Retrieve messages of a conversation.

Authentication Required

Yes

---

# 77. Delete Chat Session

Endpoint

```http
DELETE /ai/chat/{sessionId}
```

Purpose

Delete an AI conversation.

Authentication Required

Yes

---

# 78. Generate Notes

Endpoint

```http
POST /ai/notes
```

Purpose

Generate AI notes for a topic.

Authentication Required

Yes

---

# 79. Generate Flashcards

Endpoint

```http
POST /ai/flashcards
```

Purpose

Generate flashcards.

Authentication Required

Yes

---

# 80. Generate Quiz

Endpoint

```http
POST /ai/quizzes
```

Purpose

Generate quiz.

Authentication Required

Yes

---

# 81. Generate Questions

Endpoint

```http
POST /ai/questions
```

Purpose

Generate questions.

Authentication Required

Yes

Request Body

```json
{
  "subjectId": "...",
  "chapterId": "...",
  "topicId": "...",
  "difficulty": "Easy | Medium | Hard",
  "questionType": "MCQ | Numerical | Subjective | Assertion Reason | Match the Following",
  "count": 10
}
```
---

# 82. Evaluate Subjective Answer

Endpoint

```http
POST /ai/evaluate-answer
```

Purpose

Evaluate descriptive answers.

Authentication Required

Yes

---

# 83. Generate Study Plan

Endpoint

```http
POST /ai/study-plan
```

Purpose

Generate personalized study plan.

Authentication Required

Yes

---

# 84. Get AI Recommendations

Endpoint

```http
GET /ai/recommendations
```

Purpose

Retrieve personalized recommendations.

Authentication Required

Yes

---

# 85. Upload Learning Document

Endpoint

```http
POST /ai/documents/upload
```

Purpose

Upload document for AI processing.

Authentication Required

Admin

Request Body

multipart/form-data

Fields

- file
- subjectId
- chapterId
- topicId
- documentType
---

# 86. Get Document Processing Status

Endpoint

```http
GET /ai/documents/{documentId}/status
```

Purpose

Track document processing.

Authentication Required

Admin

---

# 87. Regenerate Embeddings

Endpoint

```http
POST /ai/embeddings/regenerate
```

Purpose

Regenerate vector embeddings.

Authentication Required

Admin

---

# 88. Search Knowledge Base

Endpoint

```http
POST /ai/search
```

Purpose

Semantic search across educational resources.

Authentication Required

Yes

---

## End of Part 5

---

# Part 6 – Analytics, Notifications & Common APIs

---

# 89. Get Learning Analytics

Endpoint

```http
GET /analytics/overview
```

Purpose

Retrieve learning statistics.

Authentication Required

Yes

---

# 90. Get Subject Analytics

Endpoint

```http
GET /analytics/subjects
```

Purpose

Retrieve subject-wise performance.

Authentication Required

Yes

---

# 91. Get Chapter Analytics

Endpoint

```http
GET /analytics/chapters
```

Purpose

Retrieve chapter performance.

Authentication Required

Yes

---

# 92. Get Weak Topics

Endpoint

```http
GET /analytics/weak-topics
```

Purpose

Retrieve weak learning areas.

Authentication Required

Yes

---

# 93. Get Strong Topics

Endpoint

```http
GET /analytics/strong-topics
```

Purpose

Retrieve strong learning areas.

Authentication Required

Yes

---

# 94. Get Study Streak

Endpoint

```http
GET /analytics/streak
```

Purpose

Retrieve study streak.

Authentication Required

Yes

---

# 95. Get Readiness Score

Endpoint

```http
GET /analytics/readiness
```

Purpose

Retrieve AI readiness prediction.

Authentication Required

Yes

---

# 96. Get Notifications

Endpoint

```http
GET /notifications
```

Purpose

Retrieve notifications.

Authentication Required

Yes

---

# 97. Mark Notification Read

Endpoint

```http
PATCH /notifications/{notificationId}/read
```

Purpose

Mark notification as read.

Authentication Required

Yes

---

# 98. Mark All Notifications Read

Endpoint

```http
PATCH /notifications/read-all
```

Purpose

Mark all notifications as read.

Authentication Required

Yes

---

# 99. Delete Notification

Endpoint

```http
DELETE /notifications/{notificationId}
```

Purpose

Delete notification.

Authentication Required

Yes

---

# 100. Submit Feedback

Endpoint

```http
POST /feedback
```

Purpose

Submit platform feedback.

Authentication Required

Yes

---

# 101. Get Platform Status

Endpoint

```http
GET /health
```

Purpose

Check backend health.

Authentication Required

No

---

# 102. API Documentation

Endpoint

```http
GET /docs
```

Purpose

Retrieve API documentation.

Authentication Required

No

---

# 103. Error Response Standard

All APIs should return errors using the following format.

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "",
      "message": ""
    }
  ]
}
```

---

# 104. Pagination Standard

Endpoints returning collections should support:

Query Parameters

```text
?page=1

&limit=20

&sort=createdAt

&order=desc
```

---

# 105. Filtering Standard

Supported filters include:

- Subject
- Chapter
- Topic
- Difficulty
- Date
- Status
- User

---

# 106. Search Standard

Endpoints supporting search should implement:

- Keyword Search
- Metadata Filtering
- Pagination
- Sorting

---

# 107. API Best Practices

All APIs should follow:

- REST Principles
- Stateless Requests
- JWT Authentication
- Consistent Responses
- Proper HTTP Status Codes
- Input Validation
- Rate Limiting
- Versioning

---

# End of API Specification Document

