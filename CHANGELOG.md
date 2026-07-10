# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-07-10
### Added
- **AI Writing Assistant Panels**: Created modular views for spelling checks, structural rewriting, and summaries.
- **Structured Coach Suggestions**: Returns character offsets and explanations to act as an educational coach.
- **Decoupled AI Provider Abstraction**: Created `AiProvider` interface with profile-specific beans (`GeminiAiProviderImpl` and `MockAiProviderImpl`).
- **AI Transaction Audit Logging**: Logged all requests to `activity_logs` tracing length and actions.
- **Overload Type Fixes**: Resolved Java compiler bounds issues on `ApiResponse` generic static builders.
- **REST Endpoints**: Created `/api/v1/ai/grammar`, `/api/v1/ai/rewrite`, and `/api/v1/ai/summarize` with input length validations.

---

## [0.2.0] - 2026-07-10
### Added
- **Asynchronous Document Grading**: Integrated Spring `@Async` task executor to analyze, grade (between 68% and 98%), and audit uploaded assignments.
- **REST Document Endpoints**: Created `/api/v1/documents` endpoints supporting upload, details, download streaming, and dashboard summaries.
- **Client Document Service**: Built client API connection layer mapping axios promises.
- **Interactive Drag-and-Drop Dropzone**: Implemented a responsive React dropzone supporting PDF, DOCX, TXT, and Images with live loading indicators.
- **Dashboard Widgets**: Added dynamic KPI indicators for total uploads, average grade, pending analysis, and completed audits.
- **Chart.js Grade Visualizer**: Configured CategoryScale line chart tracking student assignment performance trends.
- **Submissions Audit Table**: Built a status table displaying evaluation progress, metadata, and download triggers.
- **Integration Tests**: Added `DocumentControllerTest.java` verifying secure file routing, scope access boundaries, and metrics calculations.

### Fixed
- **API Overloads**: Added convenient `ApiResponse.success` builder overloads automatically resolving the request tracing UUID from MDC thread context logs.

---

## [0.1.0] - 2026-07-10
### Added
- **Standardized API Payload**: Implemented a generic `ApiResponse<T>` envelope wrapping all REST inputs, validation warnings, and exceptions.
- **Request Trace Identifier**: Configured `RequestIdFilter` generating UUID tracking headers in MDC context logs.
- **Security & JWT Rotation**: Configured BCrypt cryptography, stateless sessions, and single-use rotating Refresh tokens.
- **Authentication Controllers**: Created signup, login, verify email mock, forgot, reset password, refresh, and logout routes.
- **Shared Design System**: Created accessible component libraries (`Button`, `Card`, `Input`, `Modal`, `Table`, `Loader`, `ErrorBoundary`, `Toast`, `Skeleton`).
- **Layout Panels**: Designed grid dashboards frameworks (`Sidebar`, `Navbar`, `Footer`, `DashboardLayout`).
- **OpenAPI / Swagger Integration**: Configured Springdoc OpenAPI endpoints.
- **Actuator Health Checks**: Integrated health actuators.
