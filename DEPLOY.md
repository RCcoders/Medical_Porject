# G-ONE Medical — Deployment Guide

## Overview

| Service | Platform | What it hosts |
|---|---|---|
| **Backend** | Render | FastAPI REST API |
| **Frontend** | Vercel | React/Vite app |

---

## Part 1 — Deploy Backend on Render

### 1. Create Web Service
1. [render.com](https://render.com) → **New → Web Service**
2. Connect GitHub → select `RCcoders/Medical_Porject`
3. Set these fields:

| Setting | Value |
|---|---|
| **Root Directory** | *(leave empty — repo root)* |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |

### 2. Add Environment Variables

| Key | Value |
|---|---|
| `PYTHON_VERSION` | `3.11.9` ⚠️ *required — prevents Python 3.14 build failures* |
| `DATABASE_URL` | `postgresql://postgres.yeekjtwgobyvygfaibro:ynVfKmqdnhIEhlTU@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres` |
| `VITE_SUPABASE_URL` | `https://yeekjtwgobyvygfaibro.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(copy from `backend/.env`)* |
| `GOOGLE_API_KEY` | `AIzaSyAPETnDlgXak1F4iw6YEc81JIZKI4cUURg` |
| `GOOGLE_CSE_ID` | `214e6a6cf18cf48a1` |
| `MISTRAL_API_KEY` | `dPpEwb4tzs8Ro2GYwvXmg7lAhCDOFst2` |
| `GOOGLE_GENAI_KEY` | `AIzaSyB-JEgB58B86TpX8osRFZWxrhQWkWgt75I` |
| `ALLOWED_ORIGINS` | *(leave blank — fill after Vercel deploy)* |

> ⚠️ **Skip** `OLLAMA_MODEL` — Ollama doesn't work on cloud servers.

### 3. Deploy & Copy URL
- Click **Create Web Service** → wait ~3 mins
- Copy live URL e.g. `https://gone-medical-backend.onrender.com`

---

## Part 2 — Deploy Frontend on Vercel

### 1. Create Project
1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import `RCcoders/Medical_Porject`
3. Set **Root Directory** → `project`

### 2. Add Environment Variables

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://yeekjtwgobyvygfaibro.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(copy from `project/.env`)* |
| `VITE_API_URL` | *(your Render URL from Part 1)* |

### 3. Deploy & Copy URL
- Click **Deploy** → wait ~2 mins
- Copy live URL e.g. `https://medical-porject.vercel.app`

---

## Part 3 — Connect CORS

Render → **Environment** → update:

| Key | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://medical-porject.vercel.app` |

Save → Render auto-redeploys.

---

## Part 4 — Verify

| Test | Expected |
|---|---|
| Open Vercel URL | Splash screen → Login |
| Refresh `/appointments` | No 404 |
| Login as patient | Dashboard + appointments work |
| Login as doctor | Doctor dashboard + AI bot |
| Login as researcher | Research portal + AI bot |

---

## Notes

- **Render free tier** sleeps after 15 min idle → first request takes ~30s. Upgrade to $7/mo for always-on.
- **Auto-deploy:** Any push to `main` triggers redeploy on both Render and Vercel.
- **Render build failures checklist:**
  - `pydantic-core` Rust error → `PYTHON_VERSION=3.11.9` not set
  - `requirements.txt not found` → Root Directory must be *empty* (not `backend`)
  - `Exited with status 1` → Start Command must be `uvicorn backend.main:app ...` (not `uvicorn main:app`)
