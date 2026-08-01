# System Design Document (SDD)

# ExamNavigator

Version: 1.0

Status: Architecture Frozen

Author: Maverik

Last Updated: August 2026

---

# Table of Contents

1. Introduction
2. Purpose
3. Scope
4. Design Goals
5. System Overview
6. High-Level Architecture
7. Major System Components
8. Architectural Principles
9. Key Design Decisions

---

# 1. Introduction

ExamNavigator is a modern AI-powered education platform designed to assist students in preparing for competitive examinations through intelligent tutoring, adaptive assessments, personalized learning, and advanced learning analytics.

Unlike conventional educational platforms that simply provide static content or generic AI chat interfaces, ExamNavigator integrates Retrieval-Augmented Generation (RAG), structured educational resources, adaptive testing, AI-assisted content generation, and personalized study planning into one unified ecosystem.

The platform follows a modular architecture to ensure scalability, maintainability, security, and future extensibility.

This document describes the overall system architecture, design philosophy, software components, technology stack, and engineering decisions that guide the implementation of ExamNavigator.

---

# 2. Purpose

The purpose of this System Design Document is to provide a comprehensive technical blueprint for the development of ExamNavigator.

This document defines:

- Overall system architecture.
- Component interactions.
- Software modules.
- Data flow.
- Technology selection.
- Deployment strategy.
- Scalability approach.
- Security architecture.
- AI integration strategy.
- Engineering standards.

This document serves as the primary technical reference for all future development activities.

---

# 3. Scope

This document covers the architecture and design of Version 1 (MVP) of ExamNavigator.

Included within scope:

- Student Portal
- Administrator Portal
- Authentication System
- Learning Management Module
- AI Tutor
- RAG Pipeline
- AI Question Generator
- Mock Test Engine
- Analytics Dashboard
- Study Planner
- Notification System
- MongoDB Database
- Cloud Deployment

Excluded from Version 1:

- Mobile Applications
- Live Video Classes
- Institution Management
- Online Payments
- Multi-language Support
- Offline Learning

These features are planned for future releases.

---

# 4. Design Goals

The architecture of ExamNavigator has been designed around the following engineering objectives.

## 4.1 Scalability

The platform should support increasing numbers of users, educational resources, and AI requests without requiring major architectural changes.

The architecture must allow future migration toward microservices when necessary.

---

## 4.2 Maintainability

Every feature should exist as an independent module.

Business logic, database operations, AI workflows, and user interfaces should remain loosely coupled.

The system should be easy to modify without affecting unrelated components.

---

## 4.3 Reliability

The platform should provide stable educational services even under heavy usage.

Critical services such as authentication, AI tutoring, and mock tests must be resilient to failures.

---

## 4.4 Security

Student information and educational resources must be protected using modern security standards.

Authentication, authorization, encrypted communication, secure API access, and input validation must be enforced throughout the system.

---

## 4.5 Performance

The system should provide:

- Fast dashboard loading
- Low-latency API responses
- Efficient AI retrieval
- Optimized database queries
- Responsive user interface

---

## 4.6 Extensibility

New AI models, examinations, educational content, and learning modules should be added without redesigning the entire platform.

---

## 4.7 User Experience

The platform should provide a modern, intuitive, and engaging learning environment with minimal friction.

Students should spend more time learning than navigating.

---

# 5. System Overview

ExamNavigator consists of multiple interconnected subsystems working together to provide an intelligent learning experience.

The system follows a layered architecture.

```text
                    Student / Admin
                           │
                           ▼
                    Next.js Frontend
                           │
                           ▼
                    REST API Gateway
                           │
                           ▼
                  Express Backend Server
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Authentication      Learning Engine      AI Engine
        │                  │                  │
        ▼                  ▼                  ▼
 Assessment Engine   Analytics Engine   Notification Engine
                           │
                           ▼
                      MongoDB Atlas
                           │
                           ▼
                MongoDB Atlas Vector Search
                           │
                           ▼
                      Gemini AI Services
```

The frontend communicates exclusively with the backend.

The backend is responsible for:

- Business logic
- Authentication
- Authorization
- Database communication
- AI orchestration
- Analytics
- RAG pipeline execution

The frontend never communicates directly with AI models or databases.

---

# 6. High-Level Architecture

ExamNavigator follows a Modular Monolith Architecture.

## Why Modular Monolith?

The project is initially developed by a single engineering team.

A microservice architecture would introduce unnecessary complexity including:

- Service discovery
- Distributed tracing
- API gateways
- Multiple deployments
- Event messaging
- Network latency
- Infrastructure costs

A modular monolith provides:

- Clear module boundaries
- Independent business domains
- Easier testing
- Faster development
- Simpler deployment

Future migration to microservices remains possible because each module is designed with clear interfaces and minimal coupling.

---

## Architecture Layers

The application is divided into six logical layers.

```text
Presentation Layer
        │
        ▼
API Layer
        │
        ▼
Business Logic Layer
        │
        ▼
AI Service Layer
        │
        ▼
Data Access Layer
        │
        ▼
Infrastructure Layer
```

### Presentation Layer

Responsible for:

- User Interface
- User interactions
- Form validation
- Navigation
- Data visualization

---

### API Layer

Responsible for:

- REST endpoints
- Authentication
- Authorization
- Request validation
- Response formatting

---

### Business Logic Layer

Responsible for:

- Learning workflows
- Quiz generation
- Study planning
- Analytics computation
- User management

---

### AI Service Layer

Responsible for:

- Prompt construction
- RAG orchestration
- AI tutoring
- Question generation
- Notes generation
- Flashcard generation

This layer acts as an abstraction over Large Language Models and prevents direct dependencies between business logic and AI providers.

---

### Data Access Layer

Responsible for:

- MongoDB communication
- Repository pattern
- Database transactions
- Data retrieval
- Vector search queries

---

### Infrastructure Layer

Responsible for:

- External APIs
- Cloud storage
- Email services
- Authentication providers
- Logging
- Monitoring

---

# 7. Major System Components

The system consists of the following primary components.

## Student Portal

Provides:

- Dashboard
- Learning interface
- AI Tutor
- Mock Tests
- Analytics
- Study Planner
- Flashcards
- Bookmarks

---

## Admin Portal

Provides:

- User Management
- Subject Management
- Document Upload
- AI Question Review
- Analytics Dashboard
- Platform Monitoring

---

## Authentication Service

Responsible for:

- User registration
- Secure login
- JWT authentication
- OAuth integration
- Session management

---

## Learning Engine

Responsible for:

- Subjects
- Chapters
- Topics
- Learning progress
- Educational resources

---

## Assessment Engine

Responsible for:

- Mock tests
- AI-generated quizzes
- Test evaluation
- Result generation
- Performance analysis

---

## AI Engine

Responsible for:

- AI Tutor
- Notes Generator
- Flashcard Generator
- Question Generator
- Revision Planner

This module never accesses the LLM directly without first consulting the RAG pipeline.

---

## Analytics Engine

Responsible for:

- Progress tracking
- Weak topic detection
- Strong topic detection
- Learning trends
- Readiness prediction

---

## Notification Service

Responsible for:

- Study reminders
- Achievement notifications
- Upcoming test alerts
- Revision reminders

---

# 8. Architectural Principles

The following engineering principles govern the implementation of ExamNavigator.

- Modular Design
- Separation of Concerns
- Single Responsibility Principle
- Dependency Inversion
- Clean Architecture
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Repository Pattern
- Service Layer Pattern
- Secure by Design
- API First Development
- Cloud Native Architecture

Every module should be independently maintainable and reusable.

---

# 9. Key Design Decisions

The following architectural decisions have been finalized for Version 1.

| Area | Decision | Reason |
|------|----------|--------|
| Architecture | Modular Monolith | Easier development and future migration |
| Frontend | Next.js + React + TypeScript | Performance, scalability, SEO, modern ecosystem |
| Backend | Node.js + Express + TypeScript | Strong ecosystem and maintainability |
| Database | MongoDB Atlas | Flexible document model for educational data |
| AI Provider | Gemini 2.5 Pro | High-quality reasoning and multimodal capabilities |
| RAG | LangChain + MongoDB Atlas Vector Search | Grounded AI responses with minimal infrastructure |
| Authentication | JWT + OAuth | Secure and scalable authentication |
| Storage | Cloudinary | Media and document storage |
| Deployment | Vercel + Render | Simple deployment and scalability |
| API Style | REST | Simplicity and broad tooling support |
| Communication | JSON over HTTPS | Standard web communication |

---

## End of Part 1

The next part of this document will cover:

- Complete Technology Stack
- Module Architecture
- Frontend Architecture
- Backend Architecture
- Internal Component Relationships
- Request Routing Strategy

---

# 10. Technology Stack

The technology stack has been selected based on scalability, maintainability, developer productivity, cloud compatibility, and long-term extensibility.

The platform follows a modern full-stack architecture using JavaScript/TypeScript technologies.

## 10.1 Frontend Technologies

| Technology | Purpose |
|------------|---------|
| Next.js | React Framework |
| React | UI Development |
| TypeScript | Type Safety |
| TailwindCSS | Styling Framework |
| ShadCN UI | Component Library |
| Framer Motion | Animations |
| React Query (TanStack Query) | Server State Management |
| Zustand | Global Client State |
| React Hook Form | Form Handling |
| Zod | Validation |
| Recharts | Analytics Charts |
| React Markdown | Markdown Rendering |
| KaTeX | Mathematical Formula Rendering |
| Lucide React | Icons |

---

## 10.2 Backend Technologies

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | REST API Framework |
| TypeScript | Backend Language |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Multer | File Upload |
| Socket.IO | Real-time Notifications |
| Winston | Logging |
| Helmet | Security Headers |
| Express Rate Limit | API Protection |
| CORS | Cross-Origin Access |

---

## 10.3 Database Technologies

| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Primary Database |
| MongoDB Atlas Vector Search | Vector Database |
| MongoDB Aggregation Pipeline | Analytics |

---

## 10.4 Artificial Intelligence Stack

| Technology | Purpose |
|------------|---------|
| Gemini 2.5 Pro | Primary LLM |
| Gemini Embeddings | Text Embeddings |
| LangChain | AI Orchestration |
| MongoDB Atlas Vector Search | Semantic Retrieval |

---

## 10.5 Cloud & Infrastructure

| Technology | Purpose |
|------------|---------|
| Vercel | Frontend Deployment |
| Render | Backend Deployment |
| Cloudinary | Media Storage |
| GitHub | Version Control |
| GitHub Actions | CI/CD |

---

# 11. Module Architecture

ExamNavigator follows a **Modular Monolith Architecture**.

Each business domain is implemented as an independent module.

Each module owns its own:

- Controllers
- Services
- Repository
- Validation
- Business Logic
- Routes

Modules communicate only through service interfaces.

Direct coupling between modules should be avoided.

---

## 11.1 Authentication Module

Purpose

Manage user identity and secure access.

Responsibilities

- Registration
- Login
- JWT Generation
- OAuth
- Password Reset
- Email Verification
- Session Validation

Dependencies

- User Module
- Notification Module

---

## 11.2 User Module

Purpose

Manage user information.

Responsibilities

- Profile
- Preferences
- Avatar
- Account Settings
- Learning Preferences

Dependencies

- Authentication
- Analytics

---

## 11.3 Learning Module

Purpose

Manage educational content.

Responsibilities

- Subjects
- Chapters
- Topics
- Notes
- Formula Sheets
- Learning Progress
- Study Resources

Dependencies

- AI Module
- Analytics

---

## 11.4 AI Module

Purpose

Provide AI-powered educational services.

Responsibilities

- AI Tutor
- Question Generation
- Notes Generation
- Flashcard Generation
- Study Planner
- Revision Suggestions

Dependencies

- RAG Module
- Learning Module

The AI module never communicates directly with the LLM.

Every request passes through the RAG pipeline.

---

## 11.5 RAG Module

Purpose

Ground AI responses using educational documents.

Responsibilities

- Document Chunking
- Embedding Generation
- Semantic Search
- Context Retrieval
- Prompt Construction

Dependencies

- MongoDB Atlas Vector Search
- Gemini Embeddings

---

## 11.6 Assessment Module

Purpose

Evaluate student knowledge.

Responsibilities

- Quiz Generation
- Mock Tests
- Test Evaluation
- Score Calculation
- Performance Analysis

Dependencies

- AI Module
- Analytics

---

## 11.7 Analytics Module

Purpose

Track learning performance.

Responsibilities

- Study Time
- Accuracy
- Weak Topics
- Strong Topics
- Learning Trends
- Readiness Score

Dependencies

- Assessment
- Learning

---

## 11.8 Study Planner Module

Purpose

Create personalized learning schedules.

Responsibilities

- Daily Plan
- Weekly Plan
- Revision Schedule
- AI Recommendations
- Target Tracking

Dependencies

- Analytics
- AI

---

## 11.9 Notification Module

Purpose

Notify users about important activities.

Responsibilities

- Study Reminders
- Revision Alerts
- Test Notifications
- Achievement Messages

Dependencies

- User
- Study Planner

---

## 11.10 Admin Module

Purpose

Manage the entire platform.

Responsibilities

- User Management
- Subject Management
- Document Upload
- AI Question Approval
- Analytics Dashboard
- Feedback Management
- System Configuration

Dependencies

All Modules

---

# 12. Module Communication

Modules must never directly manipulate another module's database collections.

Communication should occur through service interfaces.

Example

```text
Student requests AI explanation

↓

Learning Module

↓

AI Module

↓

RAG Module

↓

Vector Search

↓

Gemini

↓

AI Module

↓

Learning Module

↓

Student
```

---

# 13. Internal Communication Strategy

The system follows synchronous communication for Version 1.

Communication occurs using:

- Service Method Calls
- Repository Interfaces
- REST APIs

Asynchronous communication (Message Queues/Event Bus) is intentionally deferred to future versions.

---

# 14. Dependency Rules

To maintain clean architecture, the following rules apply:

✓ Controllers may access Services.

✓ Services may access Repositories.

✓ Repositories may access MongoDB.

✓ Services may communicate with other Services.

✗ Controllers must never access the database directly.

✗ Controllers must never call Gemini directly.

✗ Frontend must never communicate with MongoDB.

✗ Frontend must never call LLM APIs directly.

✗ Business Logic must never exist inside Controllers.

---

## End of Part 2

The next section will cover:

- Complete Frontend Architecture
- Application Routing
- State Management
- Component Design
- UI Layer
- Rendering Strategy
- Folder Structure

---

# 15. Frontend Architecture

The frontend of ExamNavigator is designed as a modern, responsive, and highly interactive Single Page Application (SPA) built using Next.js and React.

The frontend is responsible only for:

- Presenting data
- Managing user interactions
- Client-side validation
- Rendering visual components
- Communicating with backend APIs

The frontend shall never contain business logic, database operations, AI processing, or authentication logic beyond token management.

---

# 16. Frontend Design Goals

The frontend architecture is designed around the following objectives:

- Fast page rendering
- Excellent User Experience
- Responsive Design
- Component Reusability
- Clean Code Structure
- Accessibility
- Scalability
- Maintainability

The application should provide an intuitive learning experience while minimizing user interaction complexity.

---

# 17. Frontend Architecture Overview

The frontend follows a layered architecture.

```text
User

↓

Pages

↓

Layouts

↓

Feature Modules

↓

Reusable Components

↓

Hooks

↓

Services

↓

REST API
```

Each layer has a clearly defined responsibility.

---

# 18. Frontend Rendering Strategy

The application will use the rendering capabilities provided by Next.js based on the nature of the page.

| Page Type | Rendering Strategy |
|------------|-------------------|
| Landing Page | Server Side Rendering |
| Authentication Pages | Client Rendering |
| Student Dashboard | Client Rendering |
| AI Chat | Client Rendering |
| Mock Tests | Client Rendering |
| Analytics Dashboard | Client Rendering |
| Admin Dashboard | Client Rendering |

Static assets such as logos, icons, and public information pages may use static generation where appropriate.

---

# 19. Application Layout

The application consists of multiple layouts.

## Public Layout

Accessible without authentication.

Includes:

- Landing Page
- Login
- Register
- Forgot Password
- About
- Contact

---

## Student Layout

Accessible after student authentication.

Includes:

- Sidebar Navigation
- Top Navigation
- Main Workspace
- Notification Panel

---

## Admin Layout

Accessible only to administrators.

Includes:

- Admin Sidebar
- Dashboard
- Analytics
- User Management
- Content Management

---

# 20. Navigation Structure

The primary navigation for students consists of:

- Dashboard
- Subjects
- Learning
- AI Tutor
- Mock Tests
- Flashcards
- Study Planner
- Analytics
- Bookmarks
- Profile
- Settings

Administrator navigation includes:

- Dashboard
- Users
- Subjects
- Documents
- AI Questions
- Reports
- Feedback
- Settings

---

# 21. State Management

The frontend maintains two categories of state.

## Global State

Used for application-wide information.

Examples:

- User Authentication
- Theme
- Notifications
- User Profile
- Current Session

---

## Server State

Managed through API communication.

Examples:

- Subjects
- Topics
- Notes
- Tests
- Analytics
- Chat History
- AI Responses

Server state should always remain synchronized with backend APIs.

---

# 22. Component Architecture

The UI is built using reusable components.

Component hierarchy follows:

```text
Page

↓

Layout

↓

Feature Component

↓

Reusable Component

↓

UI Element
```

Reusable components include:

- Buttons
- Cards
- Inputs
- Tables
- Dialogs
- Charts
- Loaders
- Badges
- Alerts
- Modals

Feature components combine reusable components into complete application features.

---

# 23. Frontend Feature Modules

The frontend is divided into logical feature areas.

- Authentication
- Dashboard
- Learning
- AI Tutor
- Mock Tests
- Analytics
- Study Planner
- Flashcards
- Bookmarks
- Notifications
- Profile
- Admin

Each feature is independently maintainable.

---

# 24. API Communication

The frontend communicates exclusively with backend REST APIs.

Communication principles:

- HTTPS only
- JSON Request/Response
- JWT Authorization
- Centralized API Service
- Automatic Token Refresh
- Standard Error Handling

The frontend shall never communicate directly with:

- MongoDB
- Gemini API
- Vector Database
- Cloud Storage

---

# 25. Error Handling Strategy

The frontend shall provide user-friendly error handling.

Examples include:

- Network Failure
- Authentication Failure
- Authorization Failure
- AI Timeout
- File Upload Failure
- Validation Errors

Errors should be displayed with meaningful messages while preventing application crashes.

---

# 26. Loading Strategy

The application should provide visual feedback during asynchronous operations.

Loading indicators include:

- Skeleton Loaders
- Progress Indicators
- Button Loading States
- Infinite Scroll Loading
- AI Response Streaming Indicator

This improves perceived application performance.

---

# 27. Responsive Design

The application must support:

- Desktop
- Laptop
- Tablet
- Mobile

Layouts should automatically adapt based on screen size while preserving usability.

---

# 28. Accessibility

The frontend should follow modern accessibility practices.

Requirements include:

- Keyboard Navigation
- Proper Labels
- Semantic HTML
- Accessible Forms
- Sufficient Color Contrast
- Screen Reader Compatibility

---

# 29. UI Performance Optimization

Frontend performance should be improved using:

- Lazy Loading
- Code Splitting
- Dynamic Imports
- Image Optimization
- Route Prefetching
- Component Memoization
- API Response Caching

---

# 30. Frontend Security

The frontend should implement:

- Secure Token Storage
- Protected Routes
- Input Validation
- Output Sanitization
- CSRF Protection (where applicable)
- XSS Prevention

Sensitive business logic must never be implemented on the client side.

---

## End of Part 3

The next section will cover:

- Backend Architecture
- Service Layer
- Repository Layer
- Request Lifecycle
- Backend Folder Structure
- Internal Services
- API Processing Flow

---

# 31. Backend Architecture

The backend of ExamNavigator follows a Modular Monolith Architecture built using Node.js, Express.js, and TypeScript.

The backend is responsible for:

- Business Logic
- Authentication
- Authorization
- Database Operations
- AI Orchestration
- RAG Execution
- Analytics
- Notifications
- API Management

The backend acts as the single entry point for all client requests.

---

# 32. Backend Design Goals

The backend is designed with the following objectives:

- Modularity
- Maintainability
- Scalability
- Security
- Performance
- Reliability
- Extensibility
- Testability

Each module should be independently maintainable while remaining part of a unified application.

---

# 33. Backend Layered Architecture

The backend follows a layered architecture.

```text
HTTP Request

↓

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

MongoDB

↓

HTTP Response
```

Each layer has a clearly defined responsibility.

---

# 34. Request Lifecycle

Every incoming request follows the same processing pipeline.

```text
Client Request

↓

Authentication Middleware

↓

Authorization Middleware

↓

Validation Middleware

↓

Route

↓

Controller

↓

Service

↓

Repository

↓

MongoDB

↓

Controller

↓

Response Formatter

↓

Client Response
```

This ensures consistency across all APIs.

---

# 35. Controller Layer

Controllers serve as the interface between HTTP requests and business logic.

Responsibilities include:

- Accept Requests
- Validate Input
- Call Services
- Return Responses
- Handle HTTP Status Codes

Controllers must remain lightweight.

Business logic must never be implemented inside controllers.

---

# 36. Service Layer

The Service Layer contains the application's business logic.

Responsibilities include:

- User Management
- Learning Logic
- AI Orchestration
- Analytics
- Mock Test Evaluation
- Study Planning
- Notification Processing

### Mock Test Auto-Save

During an active mock test, student responses are automatically persisted in browser local storage after every answer update.
If network connectivity is available, the latest responses are synchronized with the backend periodically.
If the browser refreshes or the connection is interrupted, the application restores the latest saved state before continuing the examination.
Local draft data is removed after successful final submission.

Services may communicate with other services through well-defined interfaces.

### Evaluation Workflow

After test submission, the backend immediately calculates:

- Score
- Accuracy
- Total Time

These results are returned to the student instantly.

Advanced analytics such as readiness score, performance trends, weak topic analysis, and recommendations are processed independently after submission to improve scalability and reduce response latency.
---

# 37. Repository Layer

Repositories are responsible for database interaction.

Responsibilities include:

- CRUD Operations
- Query Optimization
- Aggregation Pipelines
- Transactions
- Data Mapping

Repositories isolate MongoDB implementation details from business logic.

---

# 38. Middleware Architecture

Middleware provides reusable request processing.

Common middleware includes:

- Authentication
- Authorization
- Validation
- Error Handling
- Logging
- Rate Limiting
- File Upload
- Request Parsing

Middleware should remain generic and reusable.

---

# 39. Validation Strategy

All incoming requests must be validated before reaching business logic.

Validation includes:

- Required Fields
- Data Types
- Length Constraints
- Email Format
- Password Rules
- File Validation
- Query Parameters

Invalid requests must return standardized error responses.

---

# 40. Authentication Flow

Authentication follows JWT-based stateless authentication.

Flow:

```text
Login Request

↓

Credential Verification

↓

JWT Generation

↓

JWT Returned

↓

Client Stores Token

↓

Token Sent With Future Requests

↓

Middleware Verification

↓

Authorized Request
```

OAuth authentication will also be supported for Google and GitHub accounts.

---

# 41. Authorization

Role-Based Access Control (RBAC) is used throughout the platform.

Primary roles include:

- Student
- Admin

Authorization determines access to:

- Routes
- Resources
- Administrative Functions
- AI Management
- User Management

Unauthorized requests must be rejected before reaching business logic.

---

# 42. Error Handling

The backend implements centralized error handling.

Categories include:

- Validation Errors
- Authentication Errors
- Authorization Errors
- Resource Not Found
- Database Errors
- AI Service Errors
- File Upload Errors
- Internal Server Errors

All errors must follow a standardized response format.

---

# 43. Logging Strategy

Application events should be logged for monitoring and debugging.

Log categories include:

- Authentication Events
- API Requests
- Errors
- Database Operations
- AI Requests
- System Events

Sensitive user information must never be written to logs.

---

# 44. File Management

Educational resources such as PDFs, images, and documents are managed through cloud storage.

Supported resources include:

- Study Notes
- Formula Sheets
- Question Banks
- Reference Images

Metadata is stored in MongoDB while files are stored in cloud storage.

---

# 45. API Response Standards

Every API should return consistent responses.

Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

This standard improves frontend integration and simplifies debugging.

---

# 46. Backend Performance Strategy

Performance optimizations include:

- Database Indexing
- Efficient Aggregation Queries
- Pagination
- Lazy Loading
- API Response Compression
- Caching (Future)
- Connection Pooling

The objective is to minimize latency while supporting future growth.

---

# 47. Security Architecture

The backend enforces security through multiple layers.

Security measures include:

- JWT Authentication
- Password Hashing
- HTTPS
- Input Validation
- Output Sanitization
- Rate Limiting
- Helmet Security Headers
- Secure Environment Variables
- CORS Configuration
- Prompt Injection Protection

Security is treated as a cross-cutting concern across all modules.

---

# 48. External Service Integration

The backend communicates with external services through dedicated service adapters.

External services include:

- Gemini API
- MongoDB Atlas
- Cloudinary
- Email Service
- OAuth Providers

Business logic remains independent of external vendor implementations.

---

# 49. Future Architecture Evolution

The Modular Monolith architecture is designed for future migration to microservices.

Potential future services include:

- Authentication Service
- AI Service
- Assessment Service
- Analytics Service
- Notification Service

Migration can occur incrementally without major architectural changes.

---

## End of Part 4

The next section will cover:

- AI Services Architecture
- Complete RAG Pipeline
- Embedding Workflow
- Prompt Engineering
- Document Processing
- AI Request Lifecycle
```

---

# 50. AI Services Architecture

The AI Services Architecture provides intelligent educational capabilities across the platform while ensuring responses remain accurate, explainable, and grounded in verified educational resources.

The AI layer is designed as an independent service layer that orchestrates multiple AI workflows instead of functioning as a generic chatbot.

The AI layer is responsible for:

- AI Tutor
- Question Generation
- Notes Generation
- Flashcard Generation
- Revision Planner
- Study Recommendations
- Learning Assistance
- Answer Evaluation

The AI layer never accesses educational content directly. Every educational response must pass through the RAG pipeline.

---

# 51. AI Design Principles

The AI architecture follows these principles:

- Grounded Responses
- Explainable AI
- Context-Aware Conversations
- Modular AI Services
- Prompt Isolation
- Provider Independence
- Secure AI Communication

The platform should be capable of replacing the underlying LLM without requiring changes to business logic.

---

# 52. AI Request Lifecycle

Every AI request follows the same execution flow.

```text
Student Request

↓

Authentication

↓

Learning Context Detection

↓

RAG Pipeline

↓

Prompt Construction

↓

Gemini API

↓

AI Response Validation

↓

Response Formatting

↓

Student
```

This workflow ensures every AI response is contextual and grounded.

---

# 53. AI Service Responsibilities

The AI layer consists of multiple logical services.

## AI Tutor

Responsible for:

- Concept Explanation
- Doubt Solving
- Follow-up Questions
- Topic Guidance

---

## AI Question Generator

Responsible for:

- MCQs
- Numerical Questions
- Subjective Questions
- Difficulty Adjustment
- Bloom's Taxonomy Classification

---

## AI Notes Generator

Responsible for:

- Chapter Summaries
- Revision Notes
- Formula Sheets
- Important Points

---

## AI Flashcard Generator

Responsible for:

- Concept Cards
- Formula Cards
- Definition Cards
- Revision Cards

---

## AI Study Planner

Responsible for:

- Daily Plans
- Weekly Plans
- Revision Timetables
- Personalized Targets

---

## AI Performance Coach

Responsible for:

- Weak Topic Identification
- Learning Recommendations
- Readiness Prediction
- Study Suggestions

---

# 54. Prompt Engineering Strategy

Every AI capability uses a dedicated prompt template.

Prompt categories include:

- Tutor Prompt
- Question Generator Prompt
- Notes Prompt
- Flashcard Prompt
- Revision Prompt
- Study Planner Prompt
- Evaluation Prompt

Prompt templates should be version-controlled and managed independently from business logic.

---

# 55. AI Safety

The platform shall implement AI safety measures.

These include:

- Prompt Injection Protection
- Harmful Content Filtering
- Educational Context Enforcement
- Output Validation
- Source Attribution
- Hallucination Reduction

The AI should decline requests unrelated to educational objectives when appropriate.

---

# 56. Retrieval-Augmented Generation (RAG)

ExamNavigator uses Retrieval-Augmented Generation to improve answer quality.

The AI should never generate educational responses solely from its pretrained knowledge.

Every educational response must be grounded using retrieved educational resources.

Primary knowledge sources include:

- Official Syllabus
- Study Notes
- Reference PDFs
- Formula Sheets
- Previous Year Questions
- AI Generated Notes
- Educational Documents

---

# 57. RAG Pipeline

```text
Student Question

↓

Query Processing

↓

Embedding Generation

↓

Vector Search

↓

Relevant Document Retrieval

↓

Context Construction

↓

Prompt Builder

↓

Gemini

↓

Grounded Response

↓

Response Validation

↓

Student
```

---

# 58. Document Processing Pipeline

Uploaded educational resources pass through an ingestion pipeline.

```text
PDF Upload

↓

Document Parsing

↓

Text Extraction

↓

Chunking

↓

Embedding Generation

↓

Vector Storage

↓

Available for Retrieval
```

Only processed documents become searchable by the AI.

---

# 59. Embedding Strategy

Embeddings are generated for:

- Documents
- Notes
- Chapters
- Formula Sheets
- Question Bank
- Flashcards

Embeddings enable semantic retrieval rather than keyword matching.

---

# 60. Context Construction

Before invoking the LLM, the platform constructs a contextual prompt using:

- Student Question
- Retrieved Chunks
- Current Subject
- Current Topic
- Learning History (when applicable)

This provides relevant educational context while minimizing hallucinations.

---

# 61. AI Response Generation

Each AI response should include:

- Answer
- Supporting Context
- Related Topics
- Suggested Follow-up
- Suggested Quiz
- Confidence Indicator (Future)

Responses should be concise, educational, and appropriate for the student's level.

---

# 62. AI Conversation Memory

Conversation history should be maintained for each learning session.

The AI should remember:

- Previous Questions
- Previous Answers
- Current Topic
- Current Chapter

Conversation memory should improve follow-up interactions while remaining scoped to the current session.

---

# 63. Future AI Enhancements

Future versions may include:

- Voice Tutor
- Image-based Doubt Solving
- OCR-based Question Recognition
- Personalized AI Mentor
- Multi-language Support
- Adaptive Learning Models

---

## End of Part 5

The next section covers Deployment Architecture, Scalability, Security, Monitoring, and Future Evolution.

---

# 64. Deployment Architecture

ExamNavigator follows a cloud-native deployment architecture.

The application is divided into independent deployment units.

```text
Users

↓

Frontend (Vercel)

↓

Backend API (Render)

↓

MongoDB Atlas

↓

Vector Search

↓

Gemini API

↓

Cloudinary
```

Communication between all services occurs over secure HTTPS connections.

---

# 65. Deployment Components

The deployed system consists of:

- Frontend Application
- Backend API
- MongoDB Atlas
- MongoDB Atlas Vector Search
- Gemini API
- Cloudinary
- Email Service

Each component is independently replaceable.

---

# 66. Environment Configuration

Sensitive configuration values are stored using environment variables.

Examples include:

- Database URI
- JWT Secret
- Gemini API Key
- Cloudinary Credentials
- OAuth Credentials
- SMTP Credentials

No sensitive information should be committed to version control.

---

# 67. Scalability Strategy

The platform is designed for gradual scaling.

Scalability techniques include:

- Stateless Backend
- Horizontal Scaling
- Efficient Database Indexing
- Lazy Loading
- Pagination
- Modular Architecture

Future enhancements may include:

- Redis Caching
- Load Balancing
- Message Queues
- CDN Integration

---

# 68. Security Strategy

Security is implemented as a multi-layer architecture.

Layers include:

- Authentication
- Authorization
- Input Validation
- Output Sanitization
- Secure API Communication
- Environment Variable Protection
- Rate Limiting
- Prompt Injection Protection

The platform follows the principle of least privilege.

---

# 69. Monitoring & Logging

The platform should continuously monitor:

- API Performance
- Error Rates
- AI Usage
- Database Health
- User Activity
- System Availability

Application logs should support debugging without exposing sensitive information.

---

# 70. Backup & Recovery

The platform should support:

- Automated Database Backups
- Recovery Procedures
- Versioned Document Storage

Data recovery should minimize service disruption.

---

# 71. Fault Tolerance

The application should gracefully handle failures such as:

- Database Connectivity Issues
- AI Service Unavailability
- File Upload Failures
- Network Interruptions

Users should receive meaningful feedback instead of application crashes.

---

# 72. Architecture Decision Records (ADR)

The following architectural decisions are adopted for Version 1.

| Area | Decision |
|------|----------|
| Overall Architecture | Modular Monolith |
| Database | MongoDB Atlas |
| Vector Search | MongoDB Atlas Vector Search |
| AI Provider | Gemini 2.5 Pro |
| Backend | Express.js |
| Frontend | Next.js |
| Authentication | JWT + OAuth |
| Storage | Cloudinary |
| API Style | REST |

Future revisions shall document changes to these decisions.

---

# 73. Future Migration Strategy

The architecture is intentionally designed to support future migration.

Potential standalone services include:

- AI Service
- Assessment Service
- Analytics Service
- Notification Service
- Authentication Service

Migration should occur without changing business functionality.

---

# 74. Conclusion

The architecture of ExamNavigator is designed to provide a scalable, secure, maintainable, and AI-driven educational platform.

The use of modular architecture, Retrieval-Augmented Generation, modern cloud infrastructure, and well-defined engineering principles ensures that the platform can evolve from an MVP into a production-ready educational ecosystem capable of serving a large user base.

---

## End of System Design Document

---

# Part 7 – System Workflows & Data Flow

# 75. End-to-End System Workflow

The platform follows a request-driven architecture where every request passes through a standardized processing pipeline.

```text
User

↓

Frontend

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

Database / AI Services

↓

Response

↓

Frontend
```

---

# 76. Student Learning Workflow

```text
Student Login

↓

Dashboard

↓

Select Subject

↓

Select Chapter

↓

Read Notes

↓

Ask AI Doubts

↓

Practice Quiz

↓

Attempt Mock Test

↓

View Analytics

↓

Receive AI Recommendations
```

---

# 77. AI Tutor Workflow

```text
Student Question

↓

Authentication

↓

Subject Detection

↓

Topic Detection

↓

RAG Retrieval

↓

Prompt Builder

↓

Gemini

↓

Response Validation

↓

Save Chat History

↓

Display Response
```

---

# 78. Mock Test Workflow

```text
Student

↓

Choose Test

↓

Generate Questions

↓

Attempt Test

↓

Auto Save Draft

↓

Submit

↓

Evaluate Answers

↓

Calculate Score

↓

Return Result

↓

Background Analytics

↓

Update Dashboard
```

---

# 79. Document Upload Workflow

```text
Admin Uploads PDF

↓

Cloud Storage

↓

Text Extraction

↓

Chunking

↓

Embedding Generation

↓

Vector Index

↓

Available for AI Retrieval
```

---

# 80. AI Question Generation Workflow

```text
Admin Selects

↓

Subject

↓

Topic

↓

Difficulty

↓

Question Type

↓

Prompt Builder

↓

Gemini

↓

Generated Questions

↓

Admin Review

↓

Approval

↓

Question Bank
```

---

# 81. Learning Analytics Workflow

```text
Student Activity

↓

Progress Tracking

↓

Performance Analysis

↓

Weak Topic Detection

↓

Recommendation Engine

↓

Updated Dashboard
```

---

# 82. Notification Workflow

```text
Scheduled Event

↓

Notification Service

↓

Student

↓

Dashboard Notification

↓

Email (Future)

↓

Push Notification (Future)
```

---

# 83. Error Handling Workflow

```text
Request

↓

Validation

↓

Business Logic

↓

Exception

↓

Central Error Handler

↓

Standard Error Response

↓

Frontend
```

---

# 84. Cross-Cutting Concerns

The following concerns apply across every module.

- Authentication
- Authorization
- Validation
- Logging
- Monitoring
- Error Handling
- Security
- Rate Limiting
- Audit Logging

These concerns are implemented centrally and reused throughout the application.

---

## End of Part 7

The next section contains architectural standards, assumptions, limitations, and final design guidelines.

---

# Part 8 – Architecture Standards & Final Guidelines

# 85. Design Assumptions

The architecture assumes:

- Users have internet connectivity.
- MongoDB Atlas is available.
- Gemini API is available.
- Educational documents are maintained by administrators.
- HTTPS is used in production.

---

# 86. System Constraints

Version 1 constraints include:

- Modular Monolith Architecture
- REST API Communication
- MongoDB Atlas
- Gemini 2.5 Pro
- Cloud Deployment
- Web Platform Only

---

# 87. Design Trade-offs

The following trade-offs were intentionally accepted.

| Decision | Benefit | Trade-off |
|----------|----------|-----------|
| Modular Monolith | Faster development | Single deployment unit |
| MongoDB | Flexible schema | Complex joins |
| REST APIs | Simplicity | More requests than GraphQL |
| Gemini API | High-quality AI | External dependency |
| RAG | Accurate responses | Increased processing time |

---

# 88. Future Improvements

Planned improvements include:

- Mobile Applications
- Voice Tutor
- OCR-based Question Solving
- Live Classes
- Teacher Dashboard
- Institution Dashboard
- Redis Caching
- Message Queue
- Microservice Migration
- AI Personal Mentor

---

# 89. Quality Attributes

The system is designed to satisfy the following quality attributes.

- Scalability
- Availability
- Reliability
- Security
- Performance
- Maintainability
- Extensibility
- Usability
- Accessibility

---

# 90. Engineering Standards

Development shall follow:

- SOLID Principles
- DRY Principle
- KISS Principle
- Clean Architecture
- Repository Pattern
- Service Layer Pattern
- API-First Development
- Secure Coding Practices

---

# 91. Documentation Standards

All future development should maintain:

- Updated Architecture Documentation
- API Documentation
- Database Documentation
- Deployment Documentation
- Release Notes
- Changelog

Documentation must remain synchronized with implementation.

---

# 92. Architecture Validation Checklist

Before implementation, verify that:

- Product Requirements are satisfied.
- Every feature maps to a system module.
- Database supports all business requirements.
- APIs cover all user workflows.
- Security requirements are addressed.
- RAG architecture supports grounded responses.
- Deployment architecture is production-ready.

---

# 93. Versioning Strategy

The project follows semantic versioning.

Examples:

- v1.0.0 – Initial MVP
- v1.1.0 – New Features
- v1.1.1 – Bug Fixes
- v2.0.0 – Major Architectural Changes

---

# 94. Final Architecture Summary

ExamNavigator is designed as a cloud-native, AI-powered education platform based on a Modular Monolith Architecture.

Core characteristics:

- Modern Web Architecture
- AI-Driven Learning
- Retrieval-Augmented Generation
- Modular Design
- Secure Authentication
- Analytics-Driven Personalization
- Scalable Cloud Deployment

The architecture provides a strong foundation for future enhancements while remaining practical for an MVP developed by a small engineering team.

---

# End of System Design Document