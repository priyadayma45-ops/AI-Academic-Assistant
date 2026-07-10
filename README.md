# AI Academic Assistant

A production-ready, resume-worthy Full-Stack Web Application built with clean architecture, SOLID principles, and enterprise-grade security. This tool automates grammar checking, formatting compliance reviews against templates, document score predictions, and exports reports.

---

## Technical Stack

- **Backend**: Java 21, Spring Boot 3.3.4, Spring Security, JWT Auth, Spring Data JPA, Hibernate, Maven Wrapper.
- **Frontend**: Vite + React 19, Tailwind CSS 3.4.1, React Router, Axios, React Hook Form, Framer Motion, TanStack React Query.
- **Database**: MySQL.
- **AI Integration**: Gemini 1.5 Flash (Modular AI Provider).

---

## Architectural & Security Blueprint (Phase 1)

1. **API Response Standardization**:
   All endpoints return a uniform envelope payload:
   ```json
   {
     "success": true,
     "message": "Operation successful",
     "data": { ... },
     "requestId": "uuid-tracing-id",
     "timestamp": "2026-07-10T16:13:53Z"
   }
   ```
2. **Request Tracing ID**:
   Every HTTP call gets assigned a unique `X-Request-ID` header. It is logged using SLF4J Mapped Diagnostic Context (MDC) for clear trace indexing in multi-threaded runtime logs.
3. **JWT Token Rotation & Hashing**:
   Stateful JWT Access tokens expire in 1 hour. Refresh tokens are single-use (fully rotated and re-issued on validation) and expire in 7 days. Passwords are saved encrypted with `BCrypt`.
4. **Shared Component Library**:
   We built a reusable design system in `frontend/src/components/` incorporating ARIA labels, responsive views, and keyboard highlights:
   - `Button`: Accessibility-friendly variants (primary, secondary, danger, outline) and loading locks.
   - `Card`: Grid cell containers with glassmorphic backdrop filters.
   - `Input`: Forward-referenced inputs integrating with React Hook Form.
   - `Modal`: spring-animated overlays capturing Esc key events.
   - `Table`: Responsive tabular list mappings.
   - `Loader`: Page-blocking glass overlay spinners.
   - `ErrorBoundary`: Crash recovery wrapper page.
   - `Toast`: Contextual sliding alert notifications.
   - `Skeleton`: Content pulse-loading layout placeholders.

---

## Workspace Layout

```
AI Academic Assistant/
├── backend/
│   ├── pom.xml
│   ├── mvnw.cmd (Maven Wrapper)
│   ├── src/
│   │   ├── main/java/com/academicassistant/
│   │   │   ├── config/ (Request filters, OpenAPI rules)
│   │   │   ├── controller/ (Rest entry points)
│   │   │   ├── dto/ (Input validators and Response envelopes)
│   │   │   ├── entity/ (User, Teacher, RefreshToken, ActivityLog)
│   │   │   ├── repository/ (JPA mapping interfaces)
│   │   │   ├── security/ (JWT filters, Config blocks, UserDetails)
│   │   │   └── service/ (Auth, Audits)
│   │   └── resources/
│   │       ├── application.properties (MySQL configs)
│   │       └── schema.sql (Database layouts)
│   └── src/test/ (MockMvc Auth Integration tests)
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx (Router configurations)
        ├── components/ (Accessible shared library)
        ├── context/ (Auth and Theme systems)
        ├── features/ (Auth pages and Dashboards)
        ├── layouts/ (Navbar, Sidebar, Footer layout elements)
        └── services/ (Axios configurations and API routing)
```

---

## Setup & Running Guide

### 1. Prerequisite Environments
- **Java**: JDK 21 installed. Set `JAVA_HOME` pointing to it.
- **Node.js**: v20+ and npm installed.
- **MySQL**: MySQL instance running locally.

### 2. Backend Setup
1. Create a MySQL schema named `academic_assistant` or let the properties auto-create it:
   ```sql
   CREATE DATABASE academic_assistant;
   ```
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Update connection parameters (Username and Password) in `src/main/resources/application.properties` if they differ from standard:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=root
   ```
4. Run compilation and integration tests using the Maven wrapper:
   ```bash
   .\mvnw.cmd clean test
   ```
   *(On H2 databases, tests run fully out-of-the-box.)*
5. Boot up the server:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```
   The backend will listen on port `8080`.

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The application UI will render at `http://localhost:5173`.

---

## Key Diagnostic Endpoints

### Actuator Monitoring
- Health check status: `http://localhost:8080/actuator/health`

### Swagger API Documentation
- OpenAPI swagger console: `http://localhost:8080/swagger-ui/index.html`
- JSON Schema details: `http://localhost:8080/v3/api-docs`

---

## Project Roadmap

- [x] **Phase 1: Project Setup + Authentication + Database**
  - Project scaffolding, response mapping, logging filters, database layouts, JWT rotation, and shared component system.
- [ ] **Phase 2: Dashboard + File Upload**
  - Drag-and-drop uploads, progress feedback, local filesystem storage, OCR text parsing, and statistics dashboards.
- [ ] **Phase 3: AI Grammar, Rewrite, Summary**
  - Gemini AI core checker, coaching explanations, Viva questions, revision generators.
- [ ] **Phase 4: Formatting Checker + Assignment Score**
  - Font face, margin, alignment, page number compliance checks.
- [ ] **Phase 5: College Template Validator**
  - Expected vs. found styling rules comparison tables.
- [ ] **Phase 6: Teacher/Admin Panels**
  - Analytical grids, user toggles, limits tracker.
- [ ] **Phase 7: Reports, Notifications, AI Chat**
  - PDF/DOCX exporters, STOMP Websocket channels, context assistants.
- [ ] **Phase 8: Testing, Docker, Deployment, Documentation**
  - Integrated testing suites, Multi-stage Dockerfiles, compose maps, GitHub Actions pipelines.
