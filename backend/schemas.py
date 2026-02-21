# schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID

# -------------------------
# USER SCHEMAS
# -------------------------

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    aadhar_card_number: Optional[str] = None
    hospital_name: Optional[str] = None
    hospital_state: Optional[str] = None
    hospital_city: Optional[str] = None

class UserCreate(UserBase):
    password: str  # Added password field
    role: Optional[str] = None # Hide role from public API, handled in backend defaulting to 'patient'




class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# -------------------------
# DOCTOR SCHEMAS
# -------------------------

class DoctorBase(BaseModel):
    specialty: str
    license_number: str
    years_of_experience: int
    hospital_affiliation: Optional[str] = None
    bio: Optional[str] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    specialty: Optional[str] = None
    license_number: Optional[str] = None
    years_of_experience: Optional[int] = None
    hospital_affiliation: Optional[str] = None
    bio: Optional[str] = None
    hospital_name: Optional[str] = None
    hospital_state: Optional[str] = None
    hospital_city: Optional[str] = None

class Doctor(DoctorBase):
    id: UUID
    user_id: UUID
    medical_degree_proof: Optional[str] = None
    registration_cert: Optional[str] = None
    identity_proof: Optional[str] = None
    professional_photo: Optional[str] = None
    other_certificates: Optional[str] = None
    hospital_name: Optional[str] = None
    hospital_state: Optional[str] = None
    hospital_city: Optional[str] = None
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

# -------------------------
# RESEARCHER SCHEMAS
# -------------------------

class ResearcherBase(BaseModel):
    institution: str
    field_of_study: str
    publications_count: int = 0
    current_projects: Optional[str] = None
    bio: Optional[str] = None
    professional_title: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    highest_qualification: Optional[str] = None
    specialization: Optional[str] = None
    university: Optional[str] = None
    completion_year: Optional[int] = None
    research_areas: Optional[str] = None
    techniques: Optional[str] = None
    therapeutic_domains: Optional[str] = None
    total_experience_years: Optional[int] = 0
    research_type: Optional[str] = None
    orcid_id: Optional[str] = None
    linkedin_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    collaboration_interests: Optional[str] = None
    is_mentorship_available: Optional[bool] = False

class ResearcherCreate(ResearcherBase):
    pass

class ResearcherUpdate(BaseModel):
    institution: Optional[str] = None
    field_of_study: Optional[str] = None
    publications_count: Optional[int] = None
    current_projects: Optional[str] = None
    bio: Optional[str] = None
    professional_title: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    highest_qualification: Optional[str] = None
    specialization: Optional[str] = None
    university: Optional[str] = None
    completion_year: Optional[int] = None
    research_areas: Optional[str] = None
    techniques: Optional[str] = None
    therapeutic_domains: Optional[str] = None
    total_experience_years: Optional[int] = None
    research_type: Optional[str] = None
    orcid_id: Optional[str] = None
    linkedin_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    collaboration_interests: Optional[str] = None
    is_mentorship_available: Optional[bool] = None

class Researcher(ResearcherBase):
    id: UUID
    user_id: UUID
    thesis_url: Optional[str] = None
    cv_url: Optional[str] = None
    other_docs_url: Optional[str] = None

    class Config:
        from_attributes = True

# -------------------------
# NEW RESEARCHER SCHEMAS
# -------------------------

class ClinicalTrialBase(BaseModel):
    title: str
    phase: str
    status: str
    start_date: date
    end_date: Optional[date] = None

class ClinicalTrialCreate(ClinicalTrialBase):
    pass

class ClinicalTrial(ClinicalTrialBase):
    id: UUID
    researcher_id: UUID

    class Config:
        from_attributes = True

class ResearchProjectBase(BaseModel):
    title: str
    description: str
    status: str
    area: str

class ResearchProjectCreate(ResearchProjectBase):
    pass

class ResearchProject(ResearchProjectBase):
    id: UUID
    researcher_id: UUID

    class Config:
        from_attributes = True

class ResearcherDashboardStats(BaseModel):
    active_trials: int
    pipeline_assets: int
    rwe_queries: int
    alerts: int
    pipeline_viz: dict # { "Phase I": 20, ... }

# -------------------------
# USER RESPONSE SCHEMA (Moved here to resolve forward references)
# -------------------------

class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    doctor_profile: Optional[Doctor] = None
    researcher_profile: Optional[Researcher] = None

    class Config:
        from_attributes = True
# -------------------------

class HospitalVisitBase(BaseModel):
    hospital_name: str
    hospital_address: Optional[str] = None
    department: Optional[str] = None
    admission_date: datetime
    discharge_date: Optional[datetime] = None
    visit_type: str
    primary_doctor: str
    diagnosis: str
    treatment_summary: Optional[str] = None
    cost: Optional[float] = None
    insurance_claim_status: str

class HospitalVisitCreate(HospitalVisitBase):
    user_id: UUID

class HospitalVisit(HospitalVisitBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -------------------------
# APPOINTMENT SCHEMAS
# -------------------------

class AppointmentBase(BaseModel):
    doctor_name: str
    specialty: Optional[str] = None
    hospital_clinic: str
    location: Optional[str] = None
    appointment_date: datetime
    appointment_type: str
    reason: str
    status: str
    consultation_mode: Optional[str] = 'Offline'
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    user_id: UUID

class Appointment(AppointmentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -------------------------
# PRESCRIPTION SCHEMAS
# -------------------------

class PrescriptionBase(BaseModel):
    drug_name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    refills_remaining: int
    side_effects: Optional[str] = None
    special_instructions: Optional[str] = None
    prescribing_doctor: str
    pharmacy: Optional[str] = None
    status: str
    document_url: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    user_id: UUID
    visit_id: Optional[UUID] = None

class Prescription(PrescriptionBase):
    id: UUID
    user_id: UUID
    visit_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -------------------------
# ALLERGY SCHEMAS
# -------------------------

class AllergyBase(BaseModel):
    allergen_name: str
    allergen_type: str
    severity: str
    reaction_symptoms: str
    treatment_protocol: Optional[str] = None
    first_observed: date
    last_reaction: Optional[date] = None

class AllergyCreate(AllergyBase):
    user_id: UUID

class Allergy(AllergyBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -------------------------
# LAB RESULT SCHEMAS
# -------------------------

class LabResultBase(BaseModel):
    test_name: str
    test_category: str
    result_value: str
    result_unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: str
    test_date: datetime
    ordering_doctor: str
    lab_facility: Optional[str] = None
    notes: Optional[str] = None
    document_url: Optional[str] = None

class LabResultCreate(LabResultBase):
    user_id: UUID
    visit_id: Optional[UUID] = None

class LabResult(LabResultBase):
    id: UUID
    user_id: UUID
    visit_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -------------------------
# INSURANCE SCHEMAS
# -------------------------

class InsurancePolicyBase(BaseModel):
    policy_number: str
    insurance_company: str
    policy_type: str
    coverage_start: date
    coverage_end: date
    premium_amount: float
    deductible_amount: float
    deductible_met: float
    coverage_details: Optional[dict] = None
    is_active: bool

class InsurancePolicyCreate(InsurancePolicyBase):
    user_id: UUID

class InsurancePolicy(InsurancePolicyBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -------------------------
# CLAIM SCHEMAS
# -------------------------

class ClaimBase(BaseModel):
    claim_number: str
    claim_amount: float
    approved_amount: Optional[float] = None
    status: str
    submission_date: date
    processed_date: Optional[date] = None
    reason_for_claim: str
    notes: Optional[str] = None

class ClaimCreate(ClaimBase):
    user_id: UUID
    policy_id: UUID
    visit_id: Optional[UUID] = None

class Claim(ClaimBase):
    id: UUID
    user_id: UUID
    policy_id: UUID
    visit_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -------------------------
# OTP VERIFY
# -------------------------

class OTPVerify(BaseModel):
    email: str
    otp: str
