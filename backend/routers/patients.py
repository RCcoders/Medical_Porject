from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import logging

from .. import crud, models, schemas
from ..database import get_db
from .auth import get_current_user

logger = logging.getLogger("medical_backend")

router = APIRouter(
    prefix="/patients",
    tags=["patients"],
)

@router.get("/", response_model=List[schemas.User])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user),
):
    doctor_name_filter: Optional[str] = None
    
    if current_user.role == "doctor":
        doctor_name_filter = current_user.full_name
        # Also keep hospital filter if needed, but appointment link is stronger
        try:
             dp = getattr(current_user, "doctor_profile", None)
             if dp and getattr(dp, "hospital_name", None):
                 hospital_filter = dp.hospital_name
        except Exception:
             pass

    limit = min(limit, 500)
    patients = crud.get_patients(db, skip=skip, limit=limit, hospital_name=hospital_filter, doctor_name=doctor_name_filter)
    return patients


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete patients")
    
    deleted_patient = crud.delete_patient(db, patient_id=patient_id)
    if deleted_patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return None


# ─── Patient Profile Endpoints ───────────────────────────────────────────────

@router.get("/profile/me", response_model=schemas.PatientProfileResponse)
def get_my_patient_profile(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user),
):
    """Return the current patient's extended profile. Creates an empty one on first call."""
    profile = (
        db.query(models.PatientProfile)
        .filter(models.PatientProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        # Auto-create an empty profile row
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.patch("/profile/me", response_model=schemas.PatientProfileResponse)
def update_my_patient_profile(
    profile_data: schemas.PatientProfileUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user),
):
    """Upsert the current patient's extended profile."""
    profile = (
        db.query(models.PatientProfile)
        .filter(models.PatientProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        profile = models.PatientProfile(user_id=current_user.id)
        db.add(profile)

    update_dict = profile_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{patient_id}/profile", response_model=schemas.PatientProfileResponse)
def get_patient_profile_by_id(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user),
):
    """Doctors can view a specific patient's extended profile."""
    if current_user.role not in ("doctor", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    profile = (
        db.query(models.PatientProfile)
        .filter(models.PatientProfile.user_id == patient_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile
