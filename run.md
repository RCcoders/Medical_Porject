# How to Run the Medical Project

This project consists of a **FastAPI Backend** and a **React/Vite Frontend**.

## Prerequisites
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) (Ensure it is running and you have a database created)

## 1. Backend Setup

1.  **Navigate to the root directory**:
    ```bash
    cd c:\Users\ROHAN\Medical
    ```

2.  **Create and Activate Virtual Environment** (Recommended):
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    # source venv/bin/activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```

4.  **Environment Variables**:
    -   Ensure you have a `.env` file in `backend/` or set `DATABASE_URL`.
    -   Example `.env`:
        ```
        DATABASE_URL=postgresql://user:password@localhost:5432/medical_db
        ```

5.  **Run the Backend Server**:
    ```bash
    python -m venv venv
    ```
    -   The API will be available at `http://localhost:8000`.
    -   Swagger docs: `http://localhost:8000/docs`.

## 2. Frontend Setup

1.  **Navigate to the project directory**:
    ```bash
    cd project
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    -   The app will typically run at `http://localhost:5173`.

## 3. Verification

To verify the system is working and secure:

1.  **Run Security Checks**:
    ```bash
    # From root directory
    python backend/verify_security.py
    ```

2.  **Access the App**:
    -   Open your browser to the local frontend URL (e.g., `http://localhost:5173`).
    -   Try to sign up. You should be created as a "patient" by default.

## Troubleshooting
-   **Database Errors**: Ensure PostgreSQL is running and the credentials in `DATABASE_URL` are correct.
-   **CORS Errors**: If the frontend cannot call the backend, check `backend/main.py` to ensure `http://localhost:5173` is in `dev_origins`.
