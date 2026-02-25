from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import logging

from .. import crud, models, schemas
from ..database import get_db

logger = logging.getLogger("medical_backend")
import json
from .video import manager

router = APIRouter(
    prefix="/appointments",
    tags=["appointments"],
)

@router.post("/", response_model=schemas.Appointment, status_code=status.HTTP_201_CREATED)
async def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    db_appointment = crud.create_appointment(db=db, appointment=appointment)
    
    # Notify patient (if created by someone else) or just log it
    notif_data = schemas.NotificationCreate(
        user_id=db_appointment.user_id,
        title="Appointment Scheduled",
        message=f"New appointment with Dr. {db_appointment.doctor_name} scheduled for {db_appointment.appointment_date.strftime('%Y-%m-%d %H:%M')}.",
        type="appointment",
        link="/appointments"
    )
    db_notif = crud.create_notification(db, notif_data)
    
    # Real-time signaling
    await manager.notify_user(str(db_appointment.user_id), json.dumps({
        "type": "GENERAL_NOTIFICATION",
        "notification": {
            "id": str(db_notif.id),
            "title": db_notif.title,
            "message": db_notif.message,
            "type": db_notif.type,
            "is_read": db_notif.is_read,
            "created_at": db_notif.created_at.isoformat(),
            "link": db_notif.link
        }
    }))
    
    return db_appointment


@router.get("/", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    limit = min(limit, 500)
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments
@router.post("/calls", response_model=schemas.Call)
def create_call(call: schemas.CallCreate, db: Session = Depends(get_db)):
    return crud.create_call(db=db, call=call)

@router.patch("/{appointment_id}/status", response_model=schemas.Appointment)
def update_appointment_status(appointment_id: UUID, status: str, db: Session = Depends(get_db)):
    db_appointment = crud.update_appointment_status(db=db, appointment_id=appointment_id, status=status)
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment
