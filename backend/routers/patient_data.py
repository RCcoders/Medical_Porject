from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..routers.auth import get_current_user
import shutil
import os
import uuid
import json
from .video import manager

router = APIRouter(
    prefix="/patient-data",
    tags=["patient-data"],
)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    try:
        # Create a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = f"backend/static/uploads/{unique_filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the URL (relative to the server root)
        return {"url": f"/static/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

# -------------------------
# HOSPITAL VISITS
# -------------------------

@router.get("/visits", response_model=List[schemas.HospitalVisit])
def read_visits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_hospital_visits(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/visits", response_model=schemas.HospitalVisit)
def create_visit(visit: schemas.HospitalVisitCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if visit.user_id != current_user.id and current_user.role != 'doctor':
         raise HTTPException(status_code=403, detail="Not authorized to create visit for this user")
    return crud.create_hospital_visit(db=db, visit=visit)

# -------------------------
# PRESCRIPTIONS
# -------------------------

@router.get("/prescriptions", response_model=List[schemas.Prescription])
def read_prescriptions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_prescriptions(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/prescriptions", response_model=schemas.Prescription)
async def create_prescription(prescription: schemas.PrescriptionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Auto-fill prescribing doctor if user is a doctor
    if current_user.role == 'doctor':
        prescription.prescribing_doctor = current_user.full_name
        
    db_prescription = crud.create_prescription(db=db, prescription=prescription)
    
    # Notify patient
    notif_data = schemas.NotificationCreate(
        user_id=db_prescription.user_id,
        title="New Prescription",
        message=f"Dr. {db_prescription.prescribing_doctor} has issued a new prescription for {db_prescription.drug_name}.",
        type="prescription",
        link="/prescriptions"
    )
    db_notif = crud.create_notification(db, notif_data)
    
    # Real-time signaling
    await manager.notify_user(str(db_prescription.user_id), json.dumps({
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
    
    return db_prescription

# -------------------------
# ALLERGIES
# -------------------------

@router.get("/allergies", response_model=List[schemas.Allergy])
def read_allergies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_allergies(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/allergies", response_model=schemas.Allergy)
def create_allergy(allergy: schemas.AllergyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_allergy(db=db, allergy=allergy)

# -------------------------
# LAB RESULTS
# -------------------------

@router.get("/lab-results", response_model=List[schemas.LabResult])
def read_lab_results(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_lab_results(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/lab-results", response_model=schemas.LabResult)
def create_lab_result(result: schemas.LabResultCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_lab_result(db=db, result=result)

# -------------------------
# INSURANCE
# -------------------------

@router.get("/insurance", response_model=List[schemas.InsurancePolicy])
def read_insurance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_insurance_policies(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/insurance", response_model=schemas.InsurancePolicy)
def create_insurance(policy: schemas.InsurancePolicyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_insurance_policy(db=db, policy=policy)

@router.get("/claims", response_model=List[schemas.Claim])
def read_claims(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_claims(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/claims", response_model=schemas.Claim)
def create_claim(claim: schemas.ClaimCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_claim(db=db, claim=claim)

# -------------------------
# APPOINTMENTS
# -------------------------

@router.get("/appointments", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role == 'doctor':
        hospital_name = None
        if current_user.doctor_profile:
            hospital_name = current_user.doctor_profile.hospital_name
        return crud.get_doctor_appointments(db, doctor_name=current_user.full_name, hospital_name=hospital_name, skip=skip, limit=limit)
    return crud.get_user_appointments(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/appointments", response_model=schemas.Appointment)
async def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_appointment = crud.create_appointment(db=db, appointment=appointment)
    
    # Notify patient
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
@router.delete("/appointments/{id}")
def delete_appointment(id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    appointment = crud.delete_appointment(db, appointment_id=id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}

@router.put("/appointments/{id}", response_model=schemas.Appointment)
def update_appointment(id: str, appointment: schemas.AppointmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    updated_appointment = crud.update_appointment(db, appointment_id=id, appointment_data=appointment)
    if not updated_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated_appointment

class AppointmentStatusUpdate(schemas.BaseModel):
    status: str

@router.put("/appointments/{id}/status", response_model=schemas.Appointment)
@router.patch("/appointments/{id}/status", response_model=schemas.Appointment)
async def update_appointment_status(
    id: str,
    status: Optional[str] = None,
    status_update: Optional[AppointmentStatusUpdate] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Accept status from query param OR request body
    final_status = status or (status_update.status if status_update else None)
    if not final_status:
        raise HTTPException(status_code=422, detail="status is required")
    
    appointment = crud.update_appointment_status(db, appointment_id=id, status=final_status)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Automate Hospital Visit Creation on Completion
    if final_status == "Completed":
        visit_data = schemas.HospitalVisitCreate(
            user_id=appointment.user_id,
            hospital_name=appointment.hospital_clinic,
            admission_date=appointment.appointment_date,
            visit_type=appointment.appointment_type,
            primary_doctor=appointment.doctor_name,
            diagnosis=appointment.reason,
            treatment_summary=appointment.notes,
            insurance_claim_status="Pending"
        )
        crud.create_hospital_visit(db=db, visit=visit_data)
        
        notif_data = schemas.NotificationCreate(
            user_id=appointment.user_id,
            title="Appointment Completed",
            message=f"Your appointment with Dr. {appointment.doctor_name} at {appointment.hospital_clinic} has been marked as completed.",
            type="appointment",
            link="/history"
        )
        db_notif = crud.create_notification(db, notif_data)
        await manager.notify_user(str(appointment.user_id), json.dumps({
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
        
    return appointment

        
    return appointment

# -------------------------
# DOCTOR ACCESS TO PATIENT DATA
# -------------------------

@router.get("/{patient_id}/lab-results", response_model=List[schemas.LabResult])
def read_patient_lab_results(patient_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor':
        raise HTTPException(status_code=403, detail="Not authorized to view patient data")
    return crud.get_lab_results(db, user_id=patient_id, skip=skip, limit=limit)

@router.get("/{patient_id}/prescriptions", response_model=List[schemas.Prescription])
def read_patient_prescriptions(patient_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor':
        raise HTTPException(status_code=403, detail="Not authorized to view patient data")
    return crud.get_prescriptions(db, user_id=patient_id, skip=skip, limit=limit)

@router.get("/{patient_id}/visits", response_model=List[schemas.HospitalVisit])
def read_patient_visits(patient_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor':
        raise HTTPException(status_code=403, detail="Not authorized to view patient data")
    return crud.get_hospital_visits(db, user_id=patient_id, skip=skip, limit=limit)

@router.get("/{patient_id}/allergies", response_model=List[schemas.Allergy])
def read_patient_allergies(patient_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor':
        raise HTTPException(status_code=403, detail="Not authorized to view patient data")
    return crud.get_allergies(db, user_id=patient_id, skip=skip, limit=limit)

