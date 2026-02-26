# Deployment Guide - Render

Follow these steps to deploy the Medical Project to Render.

## 1. Backend Deployment (Web Service)

1. **New Web Service**: In Render dashboard, click **New +** -> **Web Service**.
2. **Connect Repo**: Select your GitHub repository.
3. **Configuration**:
   - **Name**: `medical-backend` (or your choice)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**: Click **Advanced** -> **Add Environment Variable**:
   - `DATABASE_URL`: Your PostgreSQL/Supabase connection string.
   - `MISTRAL_API_KEY`: Your Mistral AI key.
   - `GOOGLE_API_KEY`: Your Google AI key.
   - `GOOGLE_CSE_ID`: Your Google Search Engine ID.
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `PYTHON_VERSION`: `3.11.9`

---

## 2. Frontend Deployment (Static Site)

1. **New Static Site**: In Render dashboard, click **New +** -> **Static Site**.
2. **Connect Repo**: Select your GitHub repository.
3. **Configuration**:
   - **Name**: `medical-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `project/dist`
4. **Environment Variables**:
   - `VITE_API_URL`: Use the URL of your **Backend Web Service** (e.g., `https://medical-backend.onrender.com`).
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

---

## 3. Post-Deployment Checks
- Ensure the **Backend** is fully deployed before the **Frontend** starts its build, as the frontend needs the backend URL.
- If you see CORS errors, ensure the frontend URL is added to the backend's allowed origins (already configured for `*.onrender.com`).
