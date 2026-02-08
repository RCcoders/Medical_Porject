from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from .. import crud, models, schemas
from ..database import get_db
from .auth import get_current_user
import logging

logger = logging.getLogger("medical_backend")

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # clamp limit to prevent abuse
    limit = min(limit, 500)
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: UUID, db: Session = Depends(get_db)):
    # typed user_id prevents accidental string IDs
    db_user = crud.get_user(db, user_id=str(user_id))
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user

# --- Patient Specific Routes (that were previously at /patients/ or /users/) ---
# We can keep /patients routes here or in a separate patients.py. 
# Given the existing structure, let's keep patients management here or in a new file.
# The previous main.py had /patients/. Ideally we should have a `patients.py` router or include it here.
# Let's include it here but with prefix /patients? No, router has fixed prefix.
# We will create a second router or just include the logic. 
# Actually, let's make this file handle BOTH /users and /patients by using two routers or just one router relative to root?
# Best practice: use one router per file/resource.
# Let's Create `backend/routers/users.py` for /users and `backend/routers/patients.py` for /patients if needed. 
# But let's check what main.py had. /users/ and /patients/.
# I will put /users logic here. I will creating `backend/routers/patients.py` as well to be clean.

