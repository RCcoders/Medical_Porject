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
    
    user = relationship("User", back_populates="researcher_profile")


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


class OTP(Base):
    __tablename__ = "otps"
    __table_args__ = {"schema": "medical"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, index=True)
    otp_code = Column(String)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())