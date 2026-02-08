from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import logging

from .. import crud, models, schemas
from ..database import get_db

logger = logging.getLogger("medical_backend")

router = APIRouter(
    prefix="/appointments",
    tags=["appointments"],
)

@router.post("/", response_model=schemas.Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    return crud.create_appointment(db=db, appointment=appointment)


@router.get("/", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    limit = min(limit, 500)
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments
