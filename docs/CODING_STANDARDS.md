# Coding Standards Document (CSD)

# ExamNavigator

Version: 1.0

Status: Architecture Frozen

Author: Maverik

Last Updated: August 2026

---

# 1. Purpose

This document defines the coding standards and engineering practices for developing ExamNavigator.

The objective is to ensure that the codebase remains:

- Clean
- Consistent
- Maintainable
- Secure
- Scalable
- Easy to review
- Easy to extend

Every contributor should follow these standards to maintain a high-quality and production-ready codebase.

---

# 2. General Engineering Principles

The project follows these engineering principles:

- Clean Code
- SOLID Principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Separation of Concerns
- Single Responsibility Principle
- Composition over Inheritance
- Fail Fast
- Defensive Programming

Business logic should never be duplicated across modules.

Every function should have a single responsibility.

Large functions should be decomposed into smaller reusable units.

---

# 3. Language Standards

The project uses:

- TypeScript for Frontend
- TypeScript for Backend

JavaScript should not be used inside the project except for build tooling where necessary.

Type safety should always be preferred over using `any`.

---

# 4. Code Quality Rules

Code should be:

- Readable
- Predictable
- Modular
- Self-documenting

Avoid:

- Magic numbers
- Hardcoded strings
- Deep nesting
- Duplicate logic
- Dead code
- Commented-out code
- Unused imports
- Unused variables

Every Pull Request should improve or maintain overall code quality.

---

# 5. Project Structure

The project follows a modular monolith architecture.

Every module should contain:

- Controllers
- Services
- Repositories
- Routes
- Validation
- Types
- Utilities

Modules must not directly access another module's internal implementation.

Communication should occur only through well-defined service interfaces.

---

# 6. Naming Conventions

Folders

- lowercase
- kebab-case

Example

```
study-planner/
mock-test/
question-generator/
```

Files

Components

```
StudentDashboard.tsx
StudyPlannerCard.tsx
```

Backend

```
user.controller.ts
user.service.ts
user.repository.ts
user.routes.ts
user.validation.ts
```

Variables

camelCase

Example

```ts
userProfile
studyProgress
```

Functions

camelCase

Example

```ts
calculateAccuracy()
generateFlashcards()
```

Classes

PascalCase

Example

```ts
UserService
AnalyticsEngine
```

Interfaces

Prefix with I

Example

```ts
IUser
ITestAttempt
```

Enums

PascalCase

Example

```ts
QuestionDifficulty
UserRole
```

Constants

UPPER_SNAKE_CASE

Example

```ts
MAX_UPLOAD_SIZE
JWT_EXPIRATION_TIME
```

---

# 7. Backend Coding Standards

## Project Architecture

The backend follows a layered architecture:

Controller
↓

Service
↓

Repository
↓

Database

Each layer has a single responsibility.

---

## Controller Rules

Controllers should:

- Handle HTTP requests and responses.
- Validate incoming requests.
- Call service methods.
- Return standardized API responses.

Controllers must never contain business logic.

---

## Service Rules

Services contain all business logic.

Services should:

- Perform validations.
- Coordinate multiple repositories.
- Call AI services.
- Execute business workflows.

Services must never directly handle HTTP requests.

---

## Repository Rules

Repositories are responsible only for database operations.

Repositories should:

- Query MongoDB
- Insert documents
- Update documents
- Delete documents

Repositories must not contain business logic.

---

## Error Handling

Use centralized error handling.

Every API should return a standardized response format.

Example

```json
{
  "success": false,
  "message": "Invalid credentials.",
  "errorCode": "AUTH_001"
}
```

Never expose internal server details.

---

## Logging

Log:

- Authentication events
- AI requests
- Errors
- Database failures
- File uploads

Never log:

- Passwords
- JWT tokens
- API keys
- Sensitive user information

---

## Async Programming

Always use async/await.

Avoid nested callbacks.

Unhandled Promise rejections are not allowed.

---

## Validation

Validate all incoming requests using Zod.

Validate:

- Request body
- Query parameters
- URL parameters

Reject invalid requests before reaching the service layer.

---

# 8. Frontend Coding Standards

## Component Design

Every UI component should have a single responsibility.

Prefer reusable components over duplicated UI.

Components should remain small and focused.

---

## Folder Structure

Group files by feature rather than file type.

Example

```
ai-chat/

components/

hooks/

services/

types/

utils/
```

---

## State Management

Use:

- React Query for server state
- Zustand for global client state
- Local component state whenever possible

Avoid unnecessary global state.

---

## Forms

Use:

- React Hook Form
- Zod validation

Perform both client-side and server-side validation.

---

## API Communication

Never call APIs directly inside UI components.

Use dedicated service files.

Example

```
services/ai.service.ts
services/auth.service.ts
services/mockTest.service.ts
```

---

## Styling

Use TailwindCSS utility classes.

Prefer reusable UI components over inline styles.

Avoid custom CSS unless necessary.

---

## Accessibility

Every page should support:

- Keyboard navigation
- Screen readers
- Focus indicators
- Proper semantic HTML

---

## Performance

Use:

- Lazy loading
- Dynamic imports
- Image optimization
- Code splitting
- Memoization only when beneficial

Avoid unnecessary re-renders.

---

## Responsive Design

Desktop-first design with responsive support for:

- Laptop
- Tablet
- Mobile

Every screen should remain fully functional across supported devices.

---

# 9. Database Standards

## MongoDB Collections

Each collection should have a single responsibility.

Avoid storing unrelated data within the same document.

Use references only when necessary.

Embed documents where it improves read performance.

---

## Schema Design

Every collection should include:

- createdAt
- updatedAt

Soft deletion should use:

- isDeleted
- deletedAt

Avoid breaking existing schemas without migration.

---

## Indexing

Create indexes only for frequently queried fields.

Use indexes for:

- userId
- subjectId
- chapterId
- topicId
- email
- sessionId

Use MongoDB Atlas Vector Search indexes only for embedding collections.

---

# 10. API Standards

Follow REST principles.

Use plural resource names.

Examples

```
/users
/subjects
/mock-tests
/flashcards
```

Use proper HTTP methods:

- GET
- POST
- PUT
- PATCH
- DELETE

Every API should return a consistent response format.

Example

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Use appropriate HTTP status codes.

Examples:

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 429 Too Many Requests
- 500 Internal Server Error

---

# 11. Security Standards

Never expose:

- API Keys
- JWT Secrets
- Database Credentials
- Environment Variables

Store sensitive values only in environment variables.

Use:

- Helmet
- Rate Limiting
- Input Validation
- JWT Authentication
- Role-Based Authorization
- HTTPS

Sanitize all user inputs before processing.

Validate uploaded files before storage.

Protect AI endpoints against prompt injection attacks.

Apply the Principle of Least Privilege for all user roles.

---

# 12. Git Workflow

Branch Naming

Use:

```
feature/ai-chat
feature/mock-tests
bugfix/login
hotfix/auth
```

Commit Messages

Follow:

```
feat:
fix:
refactor:
docs:
test:
style:
chore:
```

Examples

```
feat: add AI tutor endpoint

fix: resolve JWT expiration issue

docs: update API specification
```

---

# 13. Testing Standards

Backend testing should cover:

- Unit Tests
- Integration Tests

Frontend testing should cover:

- Component Tests
- User Interaction Tests

Critical workflows to test:

- Authentication
- AI Tutor
- Mock Tests
- Document Upload
- RAG Retrieval
- Analytics

All critical bugs should include regression tests.

---

# 14. Documentation Standards

Every module should include:

- Purpose
- Responsibilities
- Public Interfaces
- Dependencies

Public functions should contain concise documentation where necessary.

Keep documentation synchronized with implementation.

Outdated documentation should be updated before merging code changes.

---

# 15. Code Review Checklist

Every Pull Request should verify:

- Code follows project architecture.
- No duplicated logic exists.
- Proper error handling is implemented.
- Validation is complete.
- Security best practices are followed.
- Performance impact is acceptable.
- Documentation is updated.
- No sensitive information is committed.
- Tests pass successfully.

Only reviewed and approved code should be merged into the main branch.

---