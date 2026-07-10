# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## [Unreleased]

## [0.1.0] - 2026-07-10

### Added
- **Project Structure**: Created `backend` (Spring Boot) and `frontend` (Vite + React) folders.
- **Backend Setup**:
  - Configured `pom.xml` with security, validation, mysql, actuator, websockets, and testing scopes.
  - Implemented generic `ApiResponse<T>` envelope for standard outputs.
  - Implemented `RequestIdFilter` injecting UUID tracing headers and `MDC` logs.
  - Implemented `GlobalExceptionHandler` mapping field-level validation errors.
  - Configured Spring Security stateless filters and CORS rules.
  - Implemented JWT token utility classes, custom user details mappings, and **JWT Refresh Token rotation**.
  - Programmed database audit logger `ActivityLogService`.
  - Added `schema.sql` database layout design.
- **Frontend Setup**:
  - Initialized React/Vite scaffolding with Tailwind CSS integration.
  - Added React Router, React Hook Form, Framer Motion, Chart.js, React Query, and Lucide icon sets.
  - Coded custom Axios client featuring automatic token refreshes, interceptors, and client-side UUID request tracing headers.
  - Configured `ThemeContext` (dark, light, system sync) and `AuthContext` (JWT session management).
  - Developed beautiful, fully validated pages: `Login`, `Signup`, `ForgotPassword`, `ResetPassword`, `VerifyEmail`.
- **Testing**:
  - Programmed MockMvc Integration tests for all Auth Controllers.
  - Verified compilation build success for both frontend and backend.
