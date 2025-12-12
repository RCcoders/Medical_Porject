from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
from .auth import get_current_user
import shutil
import os
import uuid

router = APIRouter(
    prefix="/doctors",
    tags=["doctors"],
)

# Construct absolute path to backend/static/uploads/doctors
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "backend", "static", "uploads", "doctors")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=list[schemas.Doctor])
def read_doctors(skip: int = 0, limit: int = 100, hospital_name: str = None, db: Session = Depends(get_db)):
    doctors = crud.get_doctors(db, skip=skip, limit=limit, hospital_name=hospital_name)
    return doctors

@router.put("/me", response_model=schemas.Doctor)
def update_doctor_profile(
    doctor_update: schemas.DoctorUpdate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can update their profile")
    
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        # Create profile if missing (Lazy creation)
        doctor_profile = models.Doctor(
            id=uuid.uuid4(),
            user_id=current_user.id,
            specialty="General",
            license_number="PENDING",
            years_of_experience=0,
            hospital_name=current_user.hospital_name,
            hospital_state=current_user.hospital_state,
            hospital_city=current_user.hospital_city
        )
        db.add(doctor_profile)
        db.commit()
        db.refresh(doctor_profile)
        
    return crud.update_doctor(db, doctor_profile.id, doctor_update)

@router.put("/me/documents", response_model=schemas.Doctor)
async def update_doctor_documents(
    medical_degree_proof: UploadFile = File(None),
    registration_cert: UploadFile = File(None),
    identity_proof: UploadFile = File(None),
    professional_photo: UploadFile = File(None),
    other_certificates: UploadFile = File(None),
    hospital_name: str = Form(None),
    hospital_state: str = Form(None),
    hospital_city: str = Form(None),
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can update documents")
    
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        # Create profile if missing (Lazy creation)
        doctor_profile = models.Doctor(
            id=uuid.uuid4(),
            user_id=current_user.id,
            specialty="General",
            license_number="PENDING",
            years_of_experience=0,
            hospital_name=hospital_name,
            hospital_state=hospital_state,
            hospital_city=hospital_city
        )
        db.add(doctor_profile)
        db.commit()
        db.refresh(doctor_profile)
        
    documents = {}
    
    async def save_file(file: UploadFile, prefix: str):
        if file:
            file_extension = file.filename.split(".")[-1]
            file_name = f"{prefix}_{doctor_profile.id}_{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, file_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            return f"/uploads/doctors/{file_name}"
        return None

    if medical_degree_proof:
        documents["medical_degree_proof"] = await save_file(medical_degree_proof, "degree")
    if registration_cert:
        documents["registration_cert"] = await save_file(registration_cert, "reg_cert")
    if identity_proof:
        documents["identity_proof"] = await save_file(identity_proof, "id_proof")
    if professional_photo:
        documents["professional_photo"] = await save_file(professional_photo, "photo")
    if other_certificates:
        documents["other_certificates"] = await save_file(other_certificates, "other")
        
    hospital_details = {}
    if hospital_name:
        hospital_details["hospital_name"] = hospital_name
    if hospital_state:
        hospital_details["hospital_state"] = hospital_state
    if hospital_city:
        hospital_details["hospital_city"] = hospital_city
        
    updated_doctor = crud.update_doctor_documents(db, doctor_profile.id, documents, hospital_details)
    return updated_doctor
