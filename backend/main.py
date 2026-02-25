# main.py
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pathlib import Path
import logging
import os

from . import crud, models, schemas
from .database import SessionLocal, engine, get_db
from .routers import auth, doctors, researchers, patient_data, agents, users, patients, appointments, video, notifications
from .routers.auth import get_current_user
from .core.middleware import GlobalExceptionHandlerMiddleware

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medical_backend")

# --- Ensure DB metadata created (keep but consider migrations for production) ---
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Medical Project Backend")

# --- Middleware order matters: Starlette is LIFO (last added = outermost = runs first) ---
# GlobalExceptionHandlerMiddleware must be INNER so CORS headers are always attached
app.add_middleware(GlobalExceptionHandlerMiddleware)

# CORSMiddleware MUST be outermost so ALL responses (including errors) get CORS headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://medical-porject-6mxf.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Directories & static mount ---
BASE_DIR = Path(__file__).resolve().parent.parent  # adjust if this file sits at backend/
UPLOAD_DIR = BASE_DIR / "backend" / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Expose uploads at /uploads so frontend can GET http://<host>/uploads/<file>
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Optional: keep older static mount if you have other assets under /static
STATIC_DIR = BASE_DIR / "backend" / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# --- Simple middleware to reject huge requests early (prevents accidental 413) ---
MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25 MB, tune as needed

@app.middleware("http")
async def reject_large_requests(request: Request, call_next):
    # Only check when header is present. Some clients don't send Content-Length for streaming.
    cl = request.headers.get("content-length")
    if cl:
        try:
            if int(cl) > MAX_CONTENT_LENGTH:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={"detail": "Request body too large"},
                )
        except ValueError:
            pass
    return await call_next(request)


# --- Routers ---
app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(researchers.router)
app.include_router(patient_data.router)
app.include_router(agents.router)
app.include_router(users.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(video.router)
app.include_router(notifications.router)


# --- Root ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Project Backend"}


# --- Explicit OPTIONS handler — guarantees 200 on ALL preflight requests ---
@app.options("/{path:path}")
async def options_handler(path: str):
    return {}


# --- Startup hook for extra checks (optional) ---
@app.on_event("startup")
def on_startup():
    # ensure upload dir exists and log startup state
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Uploads are being served from: {UPLOAD_DIR}")


# --- Helpful notes for production (do not remove) ---
# 1. Remove "*" from CORS allow_origins before deploying.
# 2. Use migrations (Alembic) rather than create_all in production.
# 3. Let a reverse-proxy (nginx) handle large uploads & SSL; tune client_max_body_size there.
# 4. Consider moving uploads to S3 or other storage for scalability.
