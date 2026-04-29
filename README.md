# Skyres - Smart Tourism Platform

Project stack:
- Backend: Spring Boot (Java 17, Maven)
- Frontend: React + Vite
- Database: MySQL

## 1) Prerequisites

- Java 17
- Maven 3.9+
- Node.js 18+ and npm
- MySQL 8+

## 2) Clone and Install

From project root:

```bash
# frontend dependencies
cd front
npm install
```

## 3) Database Setup (MySQL)

Create database:

```sql
CREATE DATABASE IF NOT EXISTS skyres_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Backend DB config is in:
- `back/src/main/resources/application.properties`

Important keys:
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`

Update username/password to match your local MySQL credentials.

## 4) Run Backend

```bash
cd back
mvn spring-boot:run
```

Backend default URL:
- `http://localhost:8080`

Swagger:
- `http://localhost:8080/swagger-ui.html`

## 5) Run Frontend

In a new terminal:

```bash
cd front
npm run dev
```

Frontend URL (usually):
- `http://localhost:5173`
- or `http://localhost:5174` if 5173 is already used

## 6) Quick Health Checks

- Frontend: open the Vite URL in browser
- Backend API docs: `http://localhost:8080/api-docs`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 7) Person 4 APIs (Guides / Activities / Intelligence)

Base URL:
- `http://localhost:8080/api`

Main endpoints:
- `GET/POST/PUT/DELETE /guides`
- `GET/POST/PUT/DELETE /activities`
- `GET/POST /guides/{id}/reviews`
- `POST /intelligence/recommendations`
- `POST /intelligence/travel-plan`
- `POST /intelligence/chatbot`

## 8) Common Issues

- `mvn not recognized`:
  - install Maven and reopen terminal.
- `Communications link failure`:
  - MySQL is not running or credentials are wrong in `application.properties`.
- `Port 5173 is in use`:
  - Vite auto-switches to another port (check terminal output).

## 9) Team Workflow Note

For team members implementing specific modules, keep changes inside your feature scope (entities, service, controller, DTOs) and avoid changing unrelated modules to reduce merge conflicts.

