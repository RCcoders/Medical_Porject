# G-ONE Medical Project — Deployment Guide

## Overview

| Service | What it hosts | Platform |
|---|---|---|
| **Frontend** | React/Vite app | Vercel |
| **Backend** | FastAPI REST API | Render |

---

## Step 1 — Deploy Backend on Render

### 1.1 Create the service
1. Go to [render.com](https://render.com) → Sign in
2. **New → Web Service**
3. Connect GitHub → select `RCcoders/Medical_Porject`
4. Configure:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### 1.2 Add Environment Variables
In Render → **Environment** tab, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.yeekjtwgobyvygfaibro:ynVfKmqdnhIEhlTU@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres` |
| `VITE_SUPABASE_URL` | `https://yeekjtwgobyvygfaibro.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(your full anon key from `backend/.env`)* |
| `GOOGLE_API_KEY` | `AIzaSyAPETnDlgXak1F4iw6YEc81JIZKI4cUURg` |
| `GOOGLE_CSE_ID` | `214e6a6cf18cf48a1` |
| `MISTRAL_API_KEY` | `dPpEwb4tzs8Ro2GYwvXmg7lAhCDOFst2` |
| `GOOGLE_GENAI_KEY` | `AIzaSyB-JEgB58B86TpX8osRFZWxrhQWkWgt75I` |
| `ALLOWED_ORIGINS` | *(leave blank for now — fill in after Step 2)* |

### 1.3 Deploy
- Click **Create Web Service** → wait 3–5 minutes
- Once live, copy your Render URL → e.g. `https://medical-porject.onrender.com`

---

## Step 2 — Deploy Frontend on Vercel

### 2.1 Create the project
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import `RCcoders/Medical_Porject` from GitHub
3. Set **Root Directory** → `project`
4. Framework will auto-detect as **Vite**

### 2.2 Add Environment Variables

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://yeekjtwgobyvygfaibro.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(your full anon key from `project/.env`)* |
| `VITE_API_URL` | *(your Render URL from Step 1)* |

### 2.3 Deploy
- Click **Deploy** → wait ~2 minutes
- Once live, copy your Vercel URL → e.g. `https://medical-porject.vercel.app`

---

## Step 3 — Connect Frontend ↔ Backend (CORS)

Go back to **Render → Environment** and add/update:

| Key | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://medical-porject.vercel.app` |

Click **Save** → Render will auto-redeploy.

---

## Step 4 — Verify Everything Works

| Test | Expected Result |
|---|---|
| Open Vercel URL | Splash screen → Login page |
| Refresh any page (e.g. `/appointments`) | No 404 error |
| Log in as patient | Dashboard loads, appointments work |
| Log in as doctor | Doctor dashboard + AI chat widget visible |
| Log in as researcher | Researcher portal + AI chat widget visible |
| Create an appointment | Saved and listed correctly |

---

## Notes

> **Render Free Tier** spins down after 15 mins of inactivity — first API call after idle takes ~30s.
> Upgrade to paid ($7/mo) to keep it always-on.

> **Ollama** (`OLLAMA_MODEL=llama3`) does not run on Render — skip that env var. The app falls back to Gemini/Mistral automatically.

> **Re-deploy after changes:** Push to `main` → Vercel and Render auto-deploy via GitHub webhook.
