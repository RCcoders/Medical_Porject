# G-ONE Medical — Deployment Guide

## Overview

| Service | What it hosts | Platform |
|---|---|---|
| **Frontend** | React/Vite app | Vercel |
| **Backend** | FastAPI REST API | Render |

---

## Part 1 — Deploy Backend on Render

### 1. Create Web Service
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect GitHub → select `RCcoders/Medical_Porject`
3. Fill in settings:

| Setting | Value |
|---|---|
| **Root Directory** | `backend` ⚠️ *must be set — this is why build fails if missing* |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### 2. Add Environment Variables

| Key | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.yeekjtwgobyvygfaibro:ynVfKmqdnhIEhlTU@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres` |
| `VITE_SUPABASE_URL` | `https://yeekjtwgobyvygfaibro.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(copy from `backend/.env`)* |
| `GOOGLE_API_KEY` | `AIzaSyAPETnDlgXak1F4iw6YEc81JIZKI4cUURg` |
| `GOOGLE_CSE_ID` | `214e6a6cf18cf48a1` |
| `MISTRAL_API_KEY` | `dPpEwb4tzs8Ro2GYwvXmg7lAhCDOFst2` |
| `GOOGLE_GENAI_KEY` | `AIzaSyB-JEgB58B86TpX8osRFZWxrhQWkWgt75I` |
| `ALLOWED_ORIGINS` | *(leave blank — fill after Step 2 is done)* |

> **Skip** `OLLAMA_MODEL` — Ollama doesn't work on cloud servers.

### 3. Deploy
- Click **Create Web Service** → wait 3–5 mins
- Copy the live URL e.g. `https://gone-medical-backend.onrender.com`

---

> ### ⚠️ If build fails with "No such file: requirements.txt"
> Render is not reading the Root Directory correctly.
> Go to your service → **Settings → Build & Deploy → Root Directory** → type `backend` → Save → Manual Deploy.

---

## Part 2 — Deploy Frontend on Vercel

### 1. Create Project
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import `RCcoders/Medical_Porject`
3. Set **Root Directory** → `project`
4. Framework auto-detects as **Vite**

### 2. Add Environment Variables

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://yeekjtwgobyvygfaibro.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(copy from `project/.env`)* |
| `VITE_API_URL` | *(your Render URL from Part 1)* |

### 3. Deploy
- Click **Deploy** → wait ~2 mins
- Copy the Vercel URL e.g. `https://medical-porject.vercel.app`

---

## Part 3 — Connect Frontend ↔ Backend (CORS)

Go back to **Render → Environment** and set:

| Key | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://medical-porject.vercel.app` |

Click **Save** → Render auto-redeploys.

---

## Part 4 — Verify

| Test | Expected |
|---|---|
| Open Vercel URL | Splash → Login page |
| Refresh `/appointments` | No 404 |
| Login as patient | Dashboard + data loads |
| Login as doctor | Doctor dashboard + AI bot |
| Login as researcher | Research portal + AI bot |
| Create appointment | Saves correctly |

---

## Notes
- **Render free tier** sleeps after 15 min idle → first request takes ~30s to wake. Upgrade to $7/mo for always-on.
- **Auto-deploy:** Push to `main` → both Vercel and Render redeploy automatically via GitHub webhook.
