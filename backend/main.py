# main.py
from fastapi import FastAPI, Depends, HTTPException, Request, status
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
from .routers import auth, doctors, researchers, patient_data, agents
from .routers.auth import get_current_user

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medical_backend")

# --- Ensure DB metadata created (keep but consider migrations for production) ---
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Medical Project Backend")

# --- CORS config ---
# For development allow localhost ports. REMOVE "*" in production and replace with explicit origins.
dev_origins = [
    "http://localhost:5173",  # Vite
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=dev_origins + ["*"],  # temporarily allow "*" for dev — remove "*" before production
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
                return fastapi.responses.JSONResponse(
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


# --- Root ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Project Backend"}


# --- Users CRUD endpoints (examples) ---
@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # clamp limit to prevent abuse
    limit = min(limit, 500)
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: UUID, db: Session = Depends(get_db)):
    # typed user_id prevents accidental string IDs
    db_user = crud.get_user(db, user_id=str(user_id))
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user


@app.get("/patients/", response_model=List[schemas.User])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user),
):
    # If current_user is doctor and has hospital info, filter patients by hospital
    hospital_filter: Optional[str] = None
    # current_user is a Pydantic model, ensure it contains doctor_profile if loaded by router
    try:
        if getattr(current_user, "role", None) == "doctor":
            dp = getattr(current_user, "doctor_profile", None)
            if dp and getattr(dp, "hospital_name", None):
                hospital_filter = dp.hospital_name
    except Exception:
        # be conservative if current_user shape is unexpected
        logger.debug("current_user missing expected attributes", exc_info=True)

    limit = min(limit, 500)
    patients = crud.get_patients(db, skip=skip, limit=limit, hospital_name=hospital_filter)
    return patients


@app.post("/appointments/", response_model=schemas.Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    return crud.create_appointment(db=db, appointment=appointment)


@app.get("/appointments/", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    limit = min(limit, 500)
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments


# --- Startup hook for extra checks (optional) ---
@app.on_event("startup")
def on_startup():
    # ensure upload dir exists and log startup state
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Uploads are being served from: {UPLOAD_DIR}")
    # Optionally ensure DB schema exists if you're using a custom schema name "medical"
    # If you use schema-qualified tables, ensure the schema exists or create it here (postgres).
    # Example (raw SQL): engine.execute("CREATE SCHEMA IF NOT EXISTS medical;")  # use with caution


# --- Helpful notes for production (do not remove) ---
# 1. Remove "*" from CORS allow_origins before deploying.
# 2. Use migrations (Alembic) rather than create_all in production.
# 3. Let a reverse-proxy (nginx) handle large uploads & SSL; tune client_max_body_size there.
# 4. Consider moving uploads to S3 or other storage for scalability.
