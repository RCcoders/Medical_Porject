
from sqlalchemy.orm import Session
from . import models, schemas, auth
import uuid
import datetime

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        hashed_password=hashed_password,
        # Add other fields
        phone=user.phone,
        date_of_birth=user.date_of_birth,
        aadhar_card_number=user.aadhar_card_number,
        hospital_name=user.hospital_name,
        hospital_state=user.hospital_state,
        hospital_city=user.hospital_city,
        is_verified=False # Default to False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Auto-create profile based on role
    if db_user.role == "doctor":
        doctor_profile = models.Doctor(
            id=uuid.uuid4(),
            user_id=db_user.id,
            specialty="General",
            license_number="PENDING",
            years_of_experience=0,
            hospital_name=user.hospital_name,
            hospital_state=user.hospital_state,
            hospital_city=user.hospital_city
        )
        db.add(doctor_profile)
        db.commit()
    elif db_user.role == "researcher":
        researcher_profile = models.Researcher(
            id=uuid.uuid4(),
            user_id=db_user.id,
            institution="Unknown",
            field_of_study="General"
        )
        db.add(researcher_profile)
        db.commit()

    return db_user

def create_doctor(db: Session, doctor: schemas.DoctorCreate, user_id: uuid.UUID):
    db_doctor = models.Doctor(**doctor.dict(), user_id=user_id)
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def create_researcher(db: Session, researcher: schemas.ResearcherCreate, user_id: uuid.UUID):
    db_researcher = models.Researcher(**researcher.dict(), user_id=user_id)
    db.add(db_researcher)
    db.commit()
    db.refresh(db_researcher)
    return db_researcher

def get_doctors(db: Session, skip: int = 0, limit: int = 100, hospital_name: str = None):
    query = db.query(models.Doctor)
    if hospital_name:
        query = query.filter(models.Doctor.hospital_name == hospital_name)
    return query.offset(skip).limit(limit).all()

def get_researchers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Researcher).offset(skip).limit(limit).all()

def update_doctor(db: Session, doctor_id: uuid.UUID, doctor_update: schemas.DoctorUpdate):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if doctor:
        update_data = doctor_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(doctor, key, value)
        db.commit()
        db.refresh(doctor)
    return doctor

def update_researcher(db: Session, researcher_id: uuid.UUID, researcher_update: schemas.ResearcherUpdate):
    researcher = db.query(models.Researcher).filter(models.Researcher.id == researcher_id).first()
    if researcher:
        update_data = researcher_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(researcher, key, value)
        db.commit()
        db.refresh(researcher)
    return researcher

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    db_appointment = models.Appointment(id=str(uuid.uuid4()), **appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: str):
    # We filter by ID. SQLAlchemy handles the String -> UUID conversion automatically.
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if appointment:
        db.delete(appointment)
        db.commit()
        return appointment
    return None

def update_appointment_status(db: Session, appointment_id: str, status: str):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if appointment:
        appointment.status = status
        db.commit()
        db.refresh(appointment)
    return appointment

def update_appointment(db: Session, appointment_id: str, appointment_data: schemas.AppointmentCreate):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if appointment:
        for key, value in appointment_data.dict().items():
            setattr(appointment, key, value)
        db.commit()
        db.refresh(appointment)
    return appointment
    
def get_patients(db: Session, skip: int = 0, limit: int = 100, hospital_name: str = None):
    query = db.query(models.User).filter(models.User.role == 'patient')
    if hospital_name:
        query = query.filter(models.User.hospital_name == hospital_name)
    return query.offset(skip).limit(limit).all()

# -------------------------
# PATIENT DATA CRUD
# -------------------------

def get_hospital_visits(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.HospitalVisit).filter(models.HospitalVisit.user_id == user_id).offset(skip).limit(limit).all()

def create_hospital_visit(db: Session, visit: schemas.HospitalVisitCreate):
    db_visit = models.HospitalVisit(id=str(uuid.uuid4()), **visit.dict())
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

def get_prescriptions(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.Prescription).filter(models.Prescription.user_id == user_id).offset(skip).limit(limit).all()

def create_prescription(db: Session, prescription: schemas.PrescriptionCreate):
    db_prescription = models.Prescription(id=str(uuid.uuid4()), **prescription.dict())
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

def get_allergies(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.Allergy).filter(models.Allergy.user_id == user_id).offset(skip).limit(limit).all()

def create_allergy(db: Session, allergy: schemas.AllergyCreate):
    db_allergy = models.Allergy(id=str(uuid.uuid4()), **allergy.dict())
    db.add(db_allergy)
    db.commit()
    db.refresh(db_allergy)
    return db_allergy

def get_lab_results(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.LabResult).filter(models.LabResult.user_id == user_id).offset(skip).limit(limit).all()

def create_lab_result(db: Session, result: schemas.LabResultCreate):
    db_result = models.LabResult(id=str(uuid.uuid4()), **result.dict())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

def get_insurance_policies(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.InsurancePolicy).filter(models.InsurancePolicy.user_id == user_id).offset(skip).limit(limit).all()

def create_insurance_policy(db: Session, policy: schemas.InsurancePolicyCreate):
    db_policy = models.InsurancePolicy(id=str(uuid.uuid4()), **policy.dict())
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

def get_claims(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.Claim).filter(models.Claim.user_id == user_id).offset(skip).limit(limit).all()

def create_claim(db: Session, claim: schemas.ClaimCreate):
    db_claim = models.Claim(id=str(uuid.uuid4()), **claim.dict())
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

def get_user_appointments(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).filter(models.Appointment.user_id == user_id).offset(skip).limit(limit).all()

def get_doctor_appointments(db: Session, doctor_name: str, hospital_name: str = None, skip: int = 0, limit: int = 100):
    # Case-insensitive matching for better UX
    query = db.query(models.Appointment).filter(models.Appointment.doctor_name.ilike(f"%{doctor_name}%"))
    
    if hospital_name:
        query = query.filter(models.Appointment.hospital_clinic == hospital_name)
        
    return query.offset(skip).limit(limit).all()


# -------------------------
# OTP CRUD
# -------------------------

def create_otp(db: Session, email: str, otp_code: str):
    # Delete existing OTPs for this email
    db.query(models.OTP).filter(models.OTP.email == email).delete()
    
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    db_otp = models.OTP(email=email, otp_code=otp_code, expires_at=expires_at)
    db.add(db_otp)
    db.commit()
    db.refresh(db_otp)
    return db_otp

def get_otp(db: Session, email: str):
    return db.query(models.OTP).filter(models.OTP.email == email).first()

def delete_otp(db: Session, email: str):
    db.query(models.OTP).filter(models.OTP.email == email).delete()
    db.commit()

# -------------------------
# DOCTOR DOCUMENTS CRUD
# -------------------------

def update_doctor_documents(db: Session, doctor_id: uuid.UUID, documents: dict, hospital_details: dict = None):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if doctor:
        for key, value in documents.items():
            if hasattr(doctor, key):
                setattr(doctor, key, value)
        
        if hospital_details:
            for key, value in hospital_details.items():
                if hasattr(doctor, key):
                    setattr(doctor, key, value)
                    
        db.commit()
        db.refresh(doctor)
    return doctor
