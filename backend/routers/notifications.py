from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
)

@router.get("/{user_id}", response_model=List[schemas.Notification])
def get_notifications(user_id: UUID, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_user_notifications(db, user_id=user_id, skip=skip, limit=limit)

@router.patch("/{notification_id}/read", response_model=schemas.Notification)
def mark_read(notification_id: UUID, db: Session = Depends(get_db)):
    db_notification = crud.mark_notification_as_read(db, notification_id=notification_id)
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification

@router.patch("/read-all/{user_id}")
def mark_all_read(user_id: UUID, db: Session = Depends(get_db)):
    crud.mark_all_unread_as_read(db, user_id=user_id)
    return {"message": "All notifications marked as read"}
