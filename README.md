# TaskFlow

## 1. Overview
TaskFlow is a full-stack task management application built for the take-home assignment.

It supports:
- User registration and login with JWT authentication
- Project creation and management
- Task creation, assignment, update, filtering, and deletion
- Role-aware authorization (owner/creator checks)

Tech stack:
- Backend: Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Liquibase, PostgreSQL
- Frontend: React + TypeScript + Vite + Material UI + React Query + React Router
- Infrastructure: Docker Compose (PostgreSQL + API + Frontend)

## 2. Architecture Decisions
- Monorepo structure with separate frontend and backend folders for clear ownership boundaries.
- Layered backend architecture: controller -> service -> repository -> entity.
- Stateless JWT auth with a custom filter and strict 401/403 separation.
- Liquibase for migration lifecycle with explicit rollback blocks to satisfy up/down migration expectations.
- JPA is used for maintainability and speed, while schema evolution is strictly migration-driven (`ddl-auto=validate`).
- React Query is used for server state and optimistic task status/edit updates.

Tradeoffs and intentional omissions:
- Full integration test suite was not added due to assignment timebox, but the code is structured for easy test additions.
- No role model beyond user ownership constraints since it was out of scope.
- User list endpoint (`GET /users`) was added to support assigning tasks to other users in UI.

## 3. Running Locally
Prerequisites:
- Docker and Docker Compose installed

Commands:
```bash
git clone https://github.com/your-name/taskflow-your-name
cd taskflow-your-name
cp .env.example .env
docker compose up --build
```

URLs:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432

## 4. Running Migrations
Migrations run automatically when backend starts via Liquibase.

If you need to re-run from scratch:
```bash
docker compose down -v
docker compose up --build
```

## 5. Test Credentials
Seeded credentials:

- Email: test@example.com
- Password: password123

## 6. API Reference
All endpoints return `application/json` except `204 No Content` delete responses.

### Auth
- `POST /auth/register`
  - Request:
    ```json
    { "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
    ```
  - Response `201`:
    ```json
    { "token": "...", "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } }
    ```

- `POST /auth/login`
  - Request:
    ```json
    { "email": "jane@example.com", "password": "secret123" }
    ```
  - Response `200`: same as register

### Projects
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id` -> `204`
- `GET /projects/:id/stats` (bonus)

### Tasks
- `GET /projects/:id/tasks?status=todo&assignee=<uuid>`
- `POST /projects/:id/tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id` -> `204`

### Users
- `GET /users` (authenticated helper endpoint for assignee selection)

### Error format examples
- Validation error `400`:
  ```json
  { "error": "validation failed", "fields": { "email": "must not be blank" } }
  ```
- Unauthenticated `401`:
  ```json
  { "error": "unauthorized" }
  ```
- Forbidden `403`:
  ```json
  { "error": "forbidden" }
  ```
- Not found `404`:
  ```json
  { "error": "not found" }
  ```

## 7. What I'd Do With More Time
- Add integration tests for auth, project authorization, and task lifecycle.
- Add pagination (`page`, `limit`) to project/task listing endpoints.
- Add drag-and-drop Kanban board and dark mode toggle in frontend.
- Add API rate-limiting and refresh token strategy for production hardening.
- Add OpenAPI docs and request-id tracing for observability.

## Project Structure
```text
.
├── backend
│   ├── src/main/java/com/taskflow
│   └── src/main/resources/db/changelog
├── frontend
│   └── src
├── docker-compose.yml
├── .env.example
└── README.md
```

## Component Library Choice
Frontend uses Material UI (MUI) for consistent and responsive professional UI.
