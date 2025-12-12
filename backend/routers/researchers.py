from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db

from .auth import get_current_user
import uuid

router = APIRouter(
    prefix="/researchers",
    tags=["researchers"],
)

@router.get("/", response_model=List[schemas.Researcher])
def read_researchers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    researchers = crud.get_researchers(db, skip=skip, limit=limit)
    return researchers

@router.post("/", response_model=schemas.Researcher)
def create_researcher(researcher: schemas.ResearcherCreate, user_id: str, db: Session = Depends(get_db)):
    return crud.create_researcher(db=db, researcher=researcher, user_id=user_id)

@router.put("/me", response_model=schemas.Researcher)
def update_researcher_profile(
    researcher_update: schemas.ResearcherUpdate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher":
        raise HTTPException(status_code=403, detail="Only researchers can update their profile")
    
    researcher_profile = current_user.researcher_profile
    if not researcher_profile:
        # Create profile if missing
        researcher_profile = models.Researcher(
            id=uuid.uuid4(),
            user_id=current_user.id,
            institution="Unknown",
            field_of_study="General"
        )
        db.add(researcher_profile)
        db.commit()
        db.refresh(researcher_profile)
        
    return crud.update_researcher(db, researcher_profile.id, researcher_update)
