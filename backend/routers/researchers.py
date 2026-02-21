from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from .. import crud, schemas, models
from ..database import get_db

from .auth import get_current_user
import uuid

UPLOAD_DIR = "static/uploads/researchers"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

@router.put("/me/documents", response_model=schemas.Researcher)
async def upload_documents(
    thesis: Optional[UploadFile] = File(None),
    cv: Optional[UploadFile] = File(None),
    other_docs: Optional[UploadFile] = File(None),
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher" or not current_user.researcher_profile:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    researcher_id = current_user.researcher_profile.id
    docs_to_update = {}
    
    for file_obj, field_name in [(thesis, "thesis_url"), (cv, "cv_url"), (other_docs, "other_docs_url")]:
        if file_obj:
            file_ext = os.path.splitext(file_obj.filename)[1]
            file_name = f"{researcher_id}_{field_name}{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, file_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file_obj.file, buffer)
            
            docs_to_update[field_name] = f"/static/uploads/researchers/{file_name}"

    return crud.update_researcher_documents(db, researcher_id, docs_to_update)

@router.get("/me/dashboard-stats", response_model=schemas.ResearcherDashboardStats)
def get_researcher_stats(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher":
        raise HTTPException(status_code=403, detail="Only researchers can access dashboard stats")
    
    if not current_user.researcher_profile:
        # Return default zeros if no profile exists yet
        return {
            "active_trials": 0,
            "pipeline_assets": 0,
            "rwe_queries": 0,
            "alerts": 0,
            "pipeline_viz": {}
        }
        
    return crud.get_researcher_dashboard_stats(db, current_user.researcher_profile.id)

@router.post("/me/trials", response_model=schemas.ClinicalTrial)
def add_trial(
    trial: schemas.ClinicalTrialCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher" or not current_user.researcher_profile:
         raise HTTPException(status_code=403, detail="Not authorized")
    return crud.create_clinical_trial(db, trial, current_user.researcher_profile.id)

@router.post("/me/projects", response_model=schemas.ResearchProject)
def add_project(
    project: schemas.ResearchProjectCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher" or not current_user.researcher_profile:
         raise HTTPException(status_code=403, detail="Not authorized")
    return crud.create_research_project(db, project, current_user.researcher_profile.id)

@router.get("/me/trials", response_model=List[schemas.ClinicalTrial])
def get_my_trials(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher" or not current_user.researcher_profile:
         raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_researcher_trials(db, current_user.researcher_profile.id)

@router.get("/me/projects", response_model=List[schemas.ResearchProject])
def get_my_projects(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher" or not current_user.researcher_profile:
         raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_researcher_projects(db, current_user.researcher_profile.id)
