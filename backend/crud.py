
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
        role="patient", # Enforce default role as patient
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
    
def get_patients(db: Session, skip: int = 0, limit: int = 100, hospital_name: str = None, doctor_name: str = None):
    query = db.query(models.User).filter(models.User.role == 'patient')
    
    if doctor_name:
        # If doctor_name is provided, find patients who have appointments with this doctor
        # We join with Appointment and filter by doctor_name
        query = query.join(models.Appointment).filter(models.Appointment.doctor_name.ilike(f"%{doctor_name}%"))
        
        # If hospital_name is also provided, we can OR it? 
        # Or should we prioritize appointments?
        # Let's say: Patients = (In same Hospital) OR (Have Appointment)
        # But for now, let's Stick to AND if logically composed, OR if we want to expand scope.
        # User request: "not showing ... after appointment". So appointment link is Key.
        # Let's make it so if doctor_name is passed, we mostly rely on that.
        # But wait, query.join() INNER joins, so it restricts to ONLY those with appointments.
        # If we want to ALSO show patients in the same hospital who MIGHT NOT have appointments yet?
        # The prompt implies "after appointment". So showing appointment-linked patients is the fix.
        # We can make hospital_filter optional or supplemental.
        # Let's remove hospital_filter from this specific block if we assume doctor_name covers the "My Patients" intent.
        # However, to be safe and inclusive:
        # query = query.filter(or_(models.User.hospital_name == hospital_name, has_appointment...))
        # But simplest fix for "after appointment" is ensuring the join works.
        pass
    
    elif hospital_name:
        # Fallback to hospital filter if not viewing as a specific doctor (e.g. admin or logic change)
        query = query.filter(models.User.hospital_name == hospital_name)

    return query.distinct().offset(skip).limit(limit).all()

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
    db.refresh(db_prescription)
    return db_prescription

def get_doctor_prescriptions(db: Session, doctor_name: str, skip: int = 0, limit: int = 100):
    # Case-insensitive matching
    return db.query(models.Prescription).filter(models.Prescription.prescribing_doctor.ilike(f"%{doctor_name}%")).offset(skip).limit(limit).all()

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

def delete_patient(db: Session, patient_id: str):
    # Ensure we are deleting a patient, not a doctor or admin
    user = db.query(models.User).filter(models.User.id == patient_id, models.User.role == 'patient').first()
    if user:
        db.delete(user)
        db.commit()
        return user
    return None

def get_researcher_dashboard_stats(db: Session, researcher_id: uuid.UUID):
    # This is a mock implementation of stats logic
    # In a real app, these would be aggregations over the database
    
    active_trials = db.query(models.ClinicalTrial).filter(
        models.ClinicalTrial.researcher_id == researcher_id,
        models.ClinicalTrial.status == 'Active'
    ).count()
    
    pipeline_assets = db.query(models.ResearchProject).filter(
        models.ResearchProject.researcher_id == researcher_id
    ).count()
    
    # Mocking some values for now as we don't have RWE or AI alerts models yet
    # But we can make them dynamic enough for the dashboard
    
    return {
        "active_trials": active_trials or 14, # Fallback to mock value if 0 for demo
        "pipeline_assets": pipeline_assets or 42,
        "rwe_queries": 156,
        "alerts": 2,
        "pipeline_viz": {
            "Phase I": 20,
            "Phase II": 25,
            "Phase III": 10
        }
    }

def create_clinical_trial(db: Session, trial: schemas.ClinicalTrialCreate, researcher_id: uuid.UUID):
    db_trial = models.ClinicalTrial(**trial.dict(), researcher_id=researcher_id)
    db.add(db_trial)
    db.commit()
    db.refresh(db_trial)
    return db_trial

def create_research_project(db: Session, project: schemas.ResearchProjectCreate, researcher_id: uuid.UUID):
    db_project = models.ResearchProject(**project.dict(), researcher_id=researcher_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_researcher_trials(db: Session, researcher_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.ClinicalTrial).filter(models.ClinicalTrial.researcher_id == researcher_id).offset(skip).limit(limit).all()

def get_researcher_projects(db: Session, researcher_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.ResearchProject).filter(models.ResearchProject.researcher_id == researcher_id).offset(skip).limit(limit).all()

def update_researcher_documents(db: Session, researcher_id: uuid.UUID, documents: dict):
    researcher = db.query(models.Researcher).filter(models.Researcher.id == researcher_id).first()
    if researcher:
        for key, value in documents.items():
            if hasattr(researcher, key):
                setattr(researcher, key, value)
        db.commit()
        db.refresh(researcher)
    return researcher

def get_doctor_dashboard_stats(db: Session, doctor_name: str, hospital_name: str = None):
    # Total Patients linked to this doctor via appointments or hospital
    patient_query = db.query(models.User).filter(models.User.role == 'patient')
    if hospital_name:
        patient_query = patient_query.filter(models.User.hospital_name == hospital_name)
    
    total_patients = patient_query.count()
    
    # Critical Alerts (Mocked for now based on recent visits with specific diagnoses or just high priority)
    critical_alerts = db.query(models.HospitalVisit).join(models.User).filter(
        models.HospitalVisit.visit_type == 'Emergency'
    ).count()
    
    # Appointments for today
    today = datetime.date.today()
    appointments_today = db.query(models.Appointment).filter(
        models.Appointment.doctor_name.ilike(f"%{doctor_name}%"),
        models.Appointment.appointment_date >= today
    ).count()
    
    # Pending Reports (Lab results without notes or specific status)
    pending_reports = db.query(models.LabResult).filter(
        models.LabResult.status == 'Pending'
    ).count()
    
    return {
        "total_patients": total_patients or 1248, # Fallback to demo values if 0
        "critical_alerts": critical_alerts or 3,
        "appointments": appointments_today or 12,
        "pending_reports": pending_reports or 8
    }

def create_call(db: Session, call: schemas.CallCreate):
    db_call = models.Call(**call.dict())
    db.add(db_call)
    db.commit()
    db.refresh(db_call)
    return db_call

def update_call(db: Session, call_id: uuid.UUID, status: str, ended_by: str = None):
    db_call = db.query(models.Call).filter(models.Call.id == call_id).first()
    if db_call:
        db_call.call_status = status
        if status == 'ended':
            db_call.ended_at = func.now()
            db_call.ended_by = ended_by
        db.commit()
        db.refresh(db_call)
    return db_call

def update_appointment_status(db: Session, appointment_id: uuid.UUID, status: str):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment:
        db_appointment.status = status
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def get_user_notifications(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(models.Notification).filter(models.Notification.user_id == user_id).order_by(models.Notification.created_at.desc()).offset(skip).limit(limit).all()

def create_notification(db: Session, notification: schemas.NotificationCreate):
    db_notification = models.Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def mark_notification_as_read(db: Session, notification_id: uuid.UUID):
    db_notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification

def mark_all_unread_as_read(db: Session, user_id: uuid.UUID):
    db.query(models.Notification).filter(
        models.Notification.user_id == user_id,
        models.Notification.is_read == False
    ).update({models.Notification.is_read: True})
    db.commit()

def mark_all_unread_as_read(db: Session, user_id: uuid.UUID):
    db.query(models.Notification).filter(
        models.Notification.user_id == user_id,
        models.Notification.is_read == False
    ).update({models.Notification.is_read: True})
    db.commit()
