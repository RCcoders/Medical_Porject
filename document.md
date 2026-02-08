# Project Audit & Enhancement Plan

## 1. Project Overview
- **Backend**: Python (FastAPI), SQLAlchemy (ORM), PostgreSQL (Database).
- **Frontend**: TypeScript (React, Vite), TailwindCSS.
- **Architecture**: Monolithic backend with REST API, Single Page Application (SPA) frontend.

## 2. Critical Issues (Security & Logic)

### A. Privilege Escalation (Critical)
- **Problem**: The `UserCreate` schema (used in `/auth/register`) includes the `role` field.
- **Impact**: Any user can register as a "doctor" (or potentially "admin") simply by modifying the JSON payload in the API request. This grants unauthorized access to sensitive patient data.
- **Fix**: Remove `role` from the public registration endpoint. Default new registrations to "patient". Doctors and Researchers should be created or promoted by an Admin API or require a separate verification process.

### B. Insecure OTP Generation
- **Problem**: `backend/routers/auth.py` uses `random.randint()` for OTPs.
- **Impact**: This is not cryptographically secure and is predictable.
- **Fix**: Use the `secrets` module (`secrets.randbelow`) for secure random number generation.

### C. Missing Role-Based Access Control (RBAC) System
- **Problem**: Role checks are performed manually inside endpoints (e.g., `if current_user.role != 'doctor':`).
- **Impact**: This is error-prone. If a developer forgets this check in a new endpoint, data is exposed.
- **Fix**: Create reusable dependencies (e.g., `get_current_doctor`, `get_current_researcher`) or a `RoleChecker` class to enforce permissions declaratively on routes.

### D. Hardcoded Configuration
- **Problem**: Frontend `api.ts` has `API_URL = 'http://localhost:8000'`. Backend `CORS` allows all origins (`"*"`) in some configurations.
- **Impact**: deployment will fail or be insecure.
- **Fix**: Use environment variables (`VITE_API_URL`) and properly configure CORS for production domains.

## 3. Code Quality & Architecture Improvements

### A. Backend Structure
- **Routers**: Some CRUD operations (e.g., `/users/`, `/patients/`) are located directly in `main.py`. They should be moved to dedicated routers (e.g., `routers/users.py`).
- **Data Validation**: Input validation is generally good thanks to Pydantic, but business logic (like checking if a patient handles their own data) is scattered.

### B. Frontend Code
- **API Service**: `services/api.ts` contains repetitive error handling (console.log + throw). This can be centralized in an Axios interceptor.
- **Type Safety**: Generally good, utilizing TypeScript interfaces.

### C. Database
- **Migrations**: The project uses `models.Base.metadata.create_all(bind=engine)` which is only good for the initial creation.
- **Improvement**: Set up **Alembic** to handle database migrations (schema changes) properly as the project evolves.

## 4. Suggested Enhancement Steps

We should proceed with the following phases:

1.  **Security Hardening**:
    -   Fix the `role` vulnerability in registration.
    -   Implement secure OTPs.
    -   Centralize RBAC logic.

2.  **Refactoring**:
    -   Move routes from `main.py` to `routers/`.
    -   Clean up `api.ts` in frontend.

3.  **Feature Improvements**:
    -   (User defined) We can then move to specific feature requests.
