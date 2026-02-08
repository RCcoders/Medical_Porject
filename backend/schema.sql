-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS medical;

-- Users Table
CREATE TABLE IF NOT EXISTS medical.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    role VARCHAR,
    hashed_password VARCHAR,
    date_of_birth DATE,
    phone VARCHAR,
    emergency_contact_name VARCHAR,
    emergency_contact_phone VARCHAR,
    blood_type VARCHAR,
    height_cm FLOAT,
    weight_kg FLOAT,
    
    -- New Fields
    aadhar_card_number VARCHAR UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    hospital_name VARCHAR,
    hospital_state VARCHAR,
    hospital_city VARCHAR,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON medical.users(email);


-- Doctors Table
CREATE TABLE IF NOT EXISTS medical.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    specialty VARCHAR,
    license_number VARCHAR,
    years_of_experience INTEGER,
    hospital_affiliation VARCHAR,
    bio TEXT,
    
    -- Documents
    medical_degree_proof VARCHAR,
    registration_cert VARCHAR,
    identity_proof VARCHAR,
    professional_photo VARCHAR,
    other_certificates VARCHAR,

    -- Hospital Details
    hospital_name VARCHAR,
    hospital_state VARCHAR,
    hospital_city VARCHAR
);


-- Researchers Table
CREATE TABLE IF NOT EXISTS medical.researchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    institution VARCHAR,
    field_of_study VARCHAR,
    publications_count INTEGER DEFAULT 0,
    current_projects TEXT
);


-- Hospital Visits Table
CREATE TABLE IF NOT EXISTS medical.hospital_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    hospital_name VARCHAR,
    hospital_address VARCHAR,
    department VARCHAR,
    admission_date TIMESTAMP WITH TIME ZONE,
    discharge_date TIMESTAMP WITH TIME ZONE,
    visit_type VARCHAR,
    primary_doctor VARCHAR,
    diagnosis TEXT,
    treatment_summary TEXT,
    cost FLOAT,
    insurance_claim_status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Prescriptions Table
CREATE TABLE IF NOT EXISTS medical.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    visit_id UUID REFERENCES medical.hospital_visits(id),
    drug_name VARCHAR,
    dosage VARCHAR,
    frequency VARCHAR,
    start_date DATE,
    end_date DATE,
    refills_remaining INTEGER,
    side_effects TEXT,
    special_instructions TEXT,
    prescribing_doctor VARCHAR,
    pharmacy VARCHAR,
    status VARCHAR,
    document_url VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Allergies Table
CREATE TABLE IF NOT EXISTS medical.allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    allergen_name VARCHAR,
    allergen_type VARCHAR,
    severity VARCHAR,
    reaction_symptoms TEXT,
    treatment_protocol TEXT,
    first_observed DATE,
    last_reaction DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Lab Results Table
CREATE TABLE IF NOT EXISTS medical.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    visit_id UUID REFERENCES medical.hospital_visits(id),
    test_name VARCHAR,
    test_category VARCHAR,
    result_value VARCHAR,
    result_unit VARCHAR,
    reference_range VARCHAR,
    status VARCHAR,
    test_date TIMESTAMP WITH TIME ZONE,
    ordering_doctor VARCHAR,
    lab_facility VARCHAR,
    notes TEXT,
    document_url VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Insurance Policies Table
CREATE TABLE IF NOT EXISTS medical.insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    policy_number VARCHAR,
    insurance_company VARCHAR,
    policy_type VARCHAR,
    coverage_start DATE,
    coverage_end DATE,
    premium_amount FLOAT,
    deductible_amount FLOAT,
    deductible_met FLOAT,
    coverage_details JSONB,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Claims Table
CREATE TABLE IF NOT EXISTS medical.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    policy_id UUID REFERENCES medical.insurance_policies(id),
    visit_id UUID REFERENCES medical.hospital_visits(id),
    claim_number VARCHAR,
    claim_amount FLOAT,
    approved_amount FLOAT,
    status VARCHAR,
    submission_date DATE,
    processed_date DATE,
    reason_for_claim TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Appointments Table
CREATE TABLE IF NOT EXISTS medical.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES medical.users(id),
    doctor_name VARCHAR,
    specialty VARCHAR,
    hospital_clinic VARCHAR,
    location VARCHAR,
    consultation_mode VARCHAR DEFAULT 'Offline',
    appointment_date TIMESTAMP WITH TIME ZONE,
    appointment_type VARCHAR,
    reason TEXT,
    status VARCHAR,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- OTP Table
CREATE TABLE IF NOT EXISTS medical.otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR,
    otp_code VARCHAR,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_otps_email ON medical.otps(email);
