import uuid
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Float, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(String)
    date_of_birth = Column(Date, nullable=True)
    phone = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    blood_type = Column(String, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    hashed_password = Column(String)

    # New Fields
    aadhar_card_number = Column(String, unique=True, nullable=True)
    is_verified = Column(Boolean, default=False)
    hospital_name = Column(String, nullable=True)
    hospital_state = Column(String, nullable=True)
    hospital_city = Column(String, nullable=True)

    visits = relationship("HospitalVisit", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    allergies = relationship("Allergy", back_populates="patient")
    lab_results = relationship("LabResult", back_populates="patient")
    insurance_policies = relationship("InsurancePolicy", back_populates="patient")
    claims = relationship("Claim", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    researcher_profile = relationship("Researcher", back_populates="user", uselist=False)
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)



class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"), unique=True, nullable=False)

    # Personal Details
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    marital_status = Column(String(30), nullable=True)
    occupation = Column(String(100), nullable=True)
    nationality = Column(String(80), nullable=True)
    languages = Column(Text, nullable=True)          # comma-separated
    profile_photo = Column(Text, nullable=True)      # URL / path

    # Contact Details
    phone = Column(String(20), nullable=True)
    alternate_phone = Column(String(20), nullable=True)
    address_line1 = Column(Text, nullable=True)
    address_line2 = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    country = Column(String(80), nullable=True, default="India")

    # Guardian / Emergency Contact
    guardian_name = Column(String(150), nullable=True)
    guardian_relationship = Column(String(60), nullable=True)
    guardian_phone = Column(String(20), nullable=True)
    guardian_email = Column(String(150), nullable=True)
    guardian_address = Column(Text, nullable=True)

    emergency_contact_name = Column(String(150), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    emergency_relationship = Column(String(60), nullable=True)

    # Health Information
    blood_type = Column(String(5), nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    known_conditions = Column(Text, nullable=True)   # comma-separated
    known_allergies = Column(Text, nullable=True)    # quick summary
    current_medications = Column(Text, nullable=True)
    smoking_status = Column(String(30), nullable=True)
    alcohol_use = Column(String(30), nullable=True)
    exercise_frequency = Column(String(30), nullable=True)

    # Identity / Insurance
    aadhar_card_number = Column(String(12), nullable=True)
    pan_number = Column(String(10), nullable=True)
    insurance_provider = Column(String(150), nullable=True)
    insurance_policy_no = Column(String(80), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="patient_profile")


class Doctor(Base):
    __tablename__ = "doctors"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    specialty = Column(String)
    license_number = Column(String)
    years_of_experience = Column(Integer)
    hospital_affiliation = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

    # Document Paths
    medical_degree_proof = Column(String, nullable=True)
    registration_cert = Column(String, nullable=True)
    identity_proof = Column(String, nullable=True)
    professional_photo = Column(String, nullable=True)
    other_certificates = Column(String, nullable=True)

    # Hospital Details (for Doctor)
    hospital_name = Column(String, nullable=True)
    hospital_state = Column(String, nullable=True)
    hospital_city = Column(String, nullable=True)
    
    user = relationship("User", back_populates="doctor_profile")

    @property
    def full_name(self):
        return self.user.full_name if self.user else None


class Researcher(Base):
    __tablename__ = "researchers"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    institution = Column(String)
    field_of_study = Column(String)
    publications_count = Column(Integer, default=0)
    current_projects = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    
    # Core Identity & Location
    professional_title = Column(String, nullable=True) # e.g. Lead Scientist
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    
    # Academic Background
    highest_qualification = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    university = Column(String, nullable=True)
    completion_year = Column(Integer, nullable=True)
    
    # Research Expertise (Stored as semicolon-separated strings or JSON)
    research_areas = Column(Text, nullable=True) 
    techniques = Column(Text, nullable=True)
    therapeutic_domains = Column(Text, nullable=True)
    
    # Experience
    total_experience_years = Column(Integer, default=0)
    research_type = Column(String, nullable=True) # Academic, Industrial, Clinical
    
    # Verification & Social
    orcid_id = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    google_scholar_url = Column(String, nullable=True)
    
    # Collaboration
    collaboration_interests = Column(Text, nullable=True)
    is_mentorship_available = Column(Boolean, default=False)
    
    # Document Paths
    thesis_url = Column(String, nullable=True)
    cv_url = Column(String, nullable=True)
    other_docs_url = Column(String, nullable=True)
    
    user = relationship("User", back_populates="researcher_profile")
    trials = relationship("ClinicalTrial", back_populates="researcher")
    projects = relationship("ResearchProject", back_populates="researcher")


class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    researcher_id = Column(UUID(as_uuid=True), ForeignKey("medical.researchers.id"))
    title = Column(String)
    phase = Column(String)  # Phase I, II, III, IV
    status = Column(String)  # Recruitment, Active, Completed, Terminated
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    researcher = relationship("Researcher", back_populates="trials")


class ResearchProject(Base):
    __tablename__ = "research_projects"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    researcher_id = Column(UUID(as_uuid=True), ForeignKey("medical.researchers.id"))
    title = Column(String)
    description = Column(Text)
    status = Column(String)
    area = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    researcher = relationship("Researcher", back_populates="projects")


class HospitalVisit(Base):
    __tablename__ = "hospital_visits"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    hospital_name = Column(String)
    hospital_address = Column(String, nullable=True)
    department = Column(String, nullable=True)
    admission_date = Column(DateTime(timezone=True))
    discharge_date = Column(DateTime(timezone=True), nullable=True)
    visit_type = Column(String)
    primary_doctor = Column(String)
    diagnosis = Column(Text)
    treatment_summary = Column(Text, nullable=True)
    cost = Column(Float, nullable=True)
    insurance_claim_status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", back_populates="visits")


class Prescription(Base):
    __tablename__ = "prescriptions"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    visit_id = Column(UUID(as_uuid=True), ForeignKey("medical.hospital_visits.id"), nullable=True)
    drug_name = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)
    refills_remaining = Column(Integer)
    side_effects = Column(Text, nullable=True)
    special_instructions = Column(Text, nullable=True)
    prescribing_doctor = Column(String)
    pharmacy = Column(String, nullable=True)
    status = Column(String)
    document_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", back_populates="prescriptions")


class Allergy(Base):
    __tablename__ = "allergies"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    allergen_name = Column(String)
    allergen_type = Column(String)
    severity = Column(String)
    reaction_symptoms = Column(Text)
    treatment_protocol = Column(Text, nullable=True)
    first_observed = Column(Date)
    last_reaction = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", back_populates="allergies")


class LabResult(Base):
    __tablename__ = "lab_results"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    visit_id = Column(UUID(as_uuid=True), ForeignKey("medical.hospital_visits.id"), nullable=True)
    test_name = Column(String)
    test_category = Column(String)
    result_value = Column(String)
    result_unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
    status = Column(String)
    test_date = Column(DateTime(timezone=True))
    ordering_doctor = Column(String)
    lab_facility = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    document_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", back_populates="lab_results")


class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    policy_number = Column(String)
    insurance_company = Column(String)
    policy_type = Column(String)
    coverage_start = Column(Date)
    coverage_end = Column(Date)
    premium_amount = Column(Float)
    deductible_amount = Column(Float)
    deductible_met = Column(Float)
    coverage_details = Column(JSON, nullable=True)
    is_active = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", back_populates="insurance_policies")


class Claim(Base):
    __tablename__ = "claims"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    policy_id = Column(UUID(as_uuid=True), ForeignKey("medical.insurance_policies.id"))
    visit_id = Column(UUID(as_uuid=True), ForeignKey("medical.hospital_visits.id"), nullable=True)
    claim_number = Column(String)
    claim_amount = Column(Float)
    approved_amount = Column(Float, nullable=True)
    status = Column(String)
    submission_date = Column(Date)
    processed_date = Column(Date, nullable=True)
    reason_for_claim = Column(Text)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", back_populates="claims")


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    doctor_name = Column(String)
    specialty = Column(String, nullable=True)
    hospital_clinic = Column(String)
    location = Column(String, nullable=True)
    consultation_mode = Column(String, default="Offline")
    appointment_date = Column(DateTime(timezone=True))
    appointment_type = Column(String)
    reason = Column(Text)
    status = Column(String)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", back_populates="appointments")
    calls = relationship("Call", back_populates="appointment")


class Call(Base):
    __tablename__ = "calls"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("medical.appointments.id"))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    ended_by = Column(String, nullable=True) # 'doctor', 'patient', 'system'
    call_status = Column(String) # 'ringing', 'ongoing', 'ended'
    
    appointment = relationship("Appointment", back_populates="calls")


class OTP(Base):
    __tablename__ = "otps"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, index=True)
    otp_code = Column(String)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("medical.users.id"))
    title = Column(String)
    message = Column(Text)
    type = Column(String) # 'appointment', 'prescription', 'general'
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
