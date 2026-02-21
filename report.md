# Medical Project Report

## 1. Executive Summary

The **Medical Project** is a comprehensive full-stack application designed to facilitate medical interactions, patient management, and advanced pharmaceutical analysis using AI agents. It features a modern Single Page Application (SPA) frontend built with React and a robust backend powered by FastAPI.

A key differentiator of this project is its integration of specialized AI agents for tasks such as **market analysis** and **drug activity prediction (QSAR)**, leveraging Large Language Models (LLMs) like Llama 3 and Mistral, as well as Google's Gemini models.

## 2. Technical Architecture

The project follows a modular microservices-inspired monolithic architecture:

### 2.1 Backend (`/backend`)
-   **Framework**: FastAPI (Python) offers high performance and automatic API documentation.
-   **Database**: PostgreSQL with SQLAlchemy ORM for data persistence.
-   **Authentication**: JWT-based auth with role management (Patients, Doctors, Researchers, Admins).
-   **AI Integration**: Direct integration with LangChain and local/cloud LLMs.

### 2.2 Frontend (`/project`)
-   **Framework**: React (Vite) with TypeScript for type safety.
-   **Styling**: TailwindCSS for rapid, responsive UI development.
-   **State Management**: React Hooks and Context API.
-   **Routing**: React Router for SPA navigation.

### 2.3 AI Agents (`/agents_ai`)
The project houses specialized autonomous agents:
-   **Market Analysis Agent**: Uses the ReAct pattern (Reasoning + Acting) to analyze pharmaceutical market trends, competitor landscape, and viability.
-   **QSAR Model**: A Random Forest Classifier for predicting Quantitative Structure-Activity Relationships in drug discovery.
-   **Orchestration**: `heuristic_orchestrator.py` manages agent interactions.

## 3. Directory Structure Overview

```
/
├── backend/                # Main API Server
│   ├── main.py             # App entry point & configuration
│   ├── models.py           # SQLAlchemy database models
│   ├── schemas.py          # Pydantic data validation schemas
│   ├── routers/            # API endpoints (auth, doctors, agents...)
│   └── crud.py             # Database operations
│
├── project/                # Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API client (Axios)
│   │   ├── App.tsx         # Main component & routing
│   │   ├── main.tsx        # Entry point
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Build configuration
│
├── agents_ai/              # AI Agent Implementations
│   ├── market_analysis_agent/  # Commercial viability analysis
│   ├── qsar_model/             # Drug activity prediction
│   └── orchestrator.py         # Agent coordination logic
│
└── USAGE.md, run.md        # Project documentation
```

## 4. Key Features

-   **User Management**: Registration and login for Patients, Doctors, and Researchers.
-   **Medical Records**: Secure storage and retrieval of patient data.
-   **Appointment System**: Scheduling and management of doctor appointments.
-   **AI Consultation**: Chat interface for medical queries powered by LLMs.
-   **Drug Discovery support**: Tools for researchers to analyze market viability and predict drug efficacy.

## 5. Security & Stability Audit

Based on the internal audit (`document.md`), several critical areas require attention:

1.  **Privilege Escalation Risk**: The current registration endpoint exposes the `role` field, allowing any user to register as a Doctor or Admin. *Immediate remediation is required.*
2.  **Insecure OTPs**: The system currently uses `random.randint()`, which is not cryptographically secure.
3.  **Hardcoded Credentials**: Some frontend and backend configurations rely on local URLs and lack environment variable enforcement for production.

## 6. Setup & Installation Summary

**Prerequisites**: Python 3.10+, Node.js 18+, PostgreSQL.

1.  **Database**: Ensure PostgreSQL is running and `DATABASE_URL` is set in `.env`.
2.  **Backend**:
    ```bash
    pip install -r backend/requirements.txt
    uvicorn backend.main:app --reload
    ```
3.  **Frontend**:
    ```bash
    cd project
    npm install
    npm run dev
    ```
4.  **AI Services**: Ensure Ollama is running (`ollama serve`) for local agent capabilities.

## 7. Roadmap & Recommendations

-   **Phase 1 (Security)**: Patch the role escalation vulnerability and implement secure random number generation.
-   **Phase 2 (Scalability)**: Migrate from `create_all()` to Alembic for database migrations. Dockerize the application for consistent deployment.
-   **Phase 3 (Features)**: Enhance the AI orchestrator to handle more complex multi-agent workflows.
