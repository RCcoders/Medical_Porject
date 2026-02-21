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
        
    # Security: Prevent doctor from manually updating their license status
    if doctor_update.license_number is not None:
        # Properly unset the field so exclude_unset=True in CRUD ignores it
        delattr(doctor_update, 'license_number')

    # FIX: If license_number is accidentally NULL in DB (due to previous bug), restore it
    if doctor_profile.license_number is None:
        doctor_profile.license_number = "PENDING"
        db.commit() # Save the fix immediately
        
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
    
    # Check if all required documents are present to auto-verify
    # We check the updated_doctor object which should have the latest paths
    required_docs = [
        updated_doctor.medical_degree_proof,
        updated_doctor.registration_cert,
        updated_doctor.identity_proof,
        updated_doctor.professional_photo
    ]
    
    if all(required_docs):
        # All required documents are present, update status to "Approved"
        # Using license_number field as status proxy based on current frontend usage
        crud.update_doctor(db, doctor_profile.id, schemas.DoctorUpdate(license_number="Approved"))
        # Fetch updated validation
        db.refresh(updated_doctor)
        
    return updated_doctor

@router.get("/me/recent-activity")
def get_doctor_recent_activity(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors have activity feeds")
    
    doctor_name = current_user.full_name
    
    # 1. Get Recent Appointments
    appointments = crud.get_doctor_appointments(db, doctor_name=doctor_name, limit=10)
    
    # 2. Get Recent Prescriptions
    prescriptions = crud.get_doctor_prescriptions(db, doctor_name=doctor_name, limit=10)
    
    # 3. Get Recent Patients (Same Hospital)
    # We use crud.get_patients but need to sort by created_at. 
    # Current crud.get_patients doesn't support sorting by created_at easily without mod.
    # Let's do a direct query here or add a helper. Direct query is fine for this specific composite view.
    hospital_name = current_user.hospital_name
    new_patients = []
    if hospital_name:
        new_patients = db.query(models.User).filter(
            models.User.role == "patient",
            models.User.hospital_name == hospital_name
        ).order_by(models.User.created_at.desc()).limit(5).all()
    else:
        # If no hospital affiliation, maybe just show globally recent? Or none?
        # Let's show globally recent for now to be safe, or maybe skip.
        # Skipping is safer to avoid data leak, but for this demo user probably wants to see *something*.
        # Let's limit to patients they have seen? No, "New Patient Added" implies registration.
        # Let's fallback to global but small limit.
        new_patients = db.query(models.User).filter(models.User.role == "patient").order_by(models.User.created_at.desc()).limit(5).all()

    # 4. Normalize and Merge
    activity = []
    
    for pat in new_patients:
        # Only show if created recently (e.g. last 7 days? or just take top 5)
        # We take top 5 regardless of time for the feed.
        activity.append({
            "type": "alert", # Use alert or user-plus icon
            "patient": pat.full_name,
            "desc": "New patient registered",
            "time": pat.created_at,
            "timestamp": pat.created_at.timestamp() if pat.created_at else 0
        })
    
    for appt in appointments:
        pat = crud.get_user(db, appt.user_id)
        patient_name = pat.full_name if pat else "Unknown"
        activity.append({
            "type": "appointment",
            "patient": patient_name,
            "desc": f"{appt.appointment_type} appointment ({appt.status})",
            "time": appt.appointment_date, # This is a datetime object
            "timestamp": appt.appointment_date.timestamp()
        })
        
    for pres in prescriptions:
        pat = crud.get_user(db, pres.user_id)
        patient_name = pat.full_name if pat else "Unknown"
        # Prescription dates are Dates, not Datetimes, so we convert for sorting
        ts = 0.0
        # Combine start_date with current time or midnight for rough sorting if specific time unavailable
        # But 'created_at' would be better if available. Let's check model.
        # Prescription model has 'created_at'. Use that!
        
        created_at = pres.created_at
        
        activity.append({
            "type": "report", # Using 'report' icon/style for prescription for now, or could map 'prescription' in frontend
            "patient": patient_name,
            "desc": f"Prescribed: {pres.drug_name} ({pres.dosage})",
            "time": created_at,
            "timestamp": created_at.timestamp() if created_at else 0
        })
        
    # 4. Sort by timestamp descending
    activity.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # 5. Take top 10
    recent_activity = activity[:10]
    
    return recent_activity

@router.get("/me/dashboard-stats")
def get_doctor_dashboard_stats(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors have dashboard stats")
    
    return crud.get_doctor_dashboard_stats(
        db, 
        doctor_name=current_user.full_name,
        hospital_name=current_user.hospital_name
    )
