-- ============================================================
-- Supabase SQL  –  Run this in your Supabase SQL Editor
-- Schema: medical
-- Table : patient_profiles
-- ============================================================

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: patient_profiles
-- One row per patient user (1-to-1 with medical.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical.patient_profiles (
    -- Primary Key
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to auth user
    user_id       UUID NOT NULL UNIQUE REFERENCES medical.users(id) ON DELETE CASCADE,

    -- ── Personal Details ─────────────────────────────────────
    date_of_birth   DATE,
    gender          VARCHAR(20),                -- Male / Female / Other / Prefer not to say
    marital_status  VARCHAR(30),                -- Single / Married / Divorced / Widowed
    occupation      VARCHAR(100),
    nationality     VARCHAR(80),
    languages       TEXT,                       -- comma-separated, e.g. "Hindi, English"
    profile_photo   TEXT,                       -- URL / path to uploaded photo

    -- ── Contact Details ──────────────────────────────────────
    phone           VARCHAR(20),
    alternate_phone VARCHAR(20),
    address_line1   TEXT,
    address_line2   TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    pincode         VARCHAR(10),
    country         VARCHAR(80) DEFAULT 'India',

    -- ── Guardian / Emergency Contact ─────────────────────────
    guardian_name           VARCHAR(150),
    guardian_relationship   VARCHAR(60),        -- Father / Mother / Spouse / Sibling / Other
    guardian_phone          VARCHAR(20),
    guardian_email          VARCHAR(150),
    guardian_address        TEXT,

    emergency_contact_name  VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    emergency_relationship  VARCHAR(60),

    -- ── Health Information ───────────────────────────────────
    blood_type          VARCHAR(5),             -- A+, A-, B+, B-, AB+, AB-, O+, O-
    height_cm           NUMERIC(5,1),
    weight_kg           NUMERIC(5,1),
    bmi                 NUMERIC(4,1)
        GENERATED ALWAYS AS (
            CASE
                WHEN height_cm IS NOT NULL AND height_cm > 0
                 AND weight_kg IS NOT NULL
                THEN ROUND(
                    (weight_kg / ((height_cm / 100.0) * (height_cm / 100.0)))::NUMERIC,
                    1
                )
            END
        ) STORED,

    known_conditions    TEXT,                   -- comma-separated chronic conditions
    known_allergies     TEXT,                   -- quick summary; full detail in allergies table
    current_medications TEXT,                   -- quick summary
    smoking_status      VARCHAR(30),            -- Never / Former / Current
    alcohol_use         VARCHAR(30),            -- None / Occasional / Moderate / Heavy
    exercise_frequency  VARCHAR(30),            -- None / Light / Moderate / Active

    -- ── Insurance / Identity ─────────────────────────────────
    aadhar_card_number  VARCHAR(12),
    pan_number          VARCHAR(10),
    insurance_provider  VARCHAR(150),
    insurance_policy_no VARCHAR(80),

    -- ── Metadata ─────────────────────────────────────────────
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Auto-update updated_at on every row change ──────────────
CREATE OR REPLACE FUNCTION medical.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_patient_profiles_updated_at ON medical.patient_profiles;
CREATE TRIGGER trg_patient_profiles_updated_at
    BEFORE UPDATE ON medical.patient_profiles
    FOR EACH ROW EXECUTE FUNCTION medical.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE medical.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Patients can read & write only their own row
CREATE POLICY "patient_profiles_self_access"
    ON medical.patient_profiles
    FOR ALL
    USING (
        user_id = (
            SELECT id FROM medical.users WHERE email = current_user
        )
    );

-- ── Index for fast lookups by user_id ───────────────────────
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id
    ON medical.patient_profiles (user_id);

-- ── Helpful view joining users + patient_profiles ───────────
CREATE OR REPLACE VIEW medical.patient_detail_view AS
SELECT
    u.id,
    u.full_name,
    u.email,
    u.role,
    u.created_at AS registered_at,
    p.date_of_birth,
    p.gender,
    p.marital_status,
    p.occupation,
    p.nationality,
    p.phone,
    p.alternate_phone,
    p.address_line1,
    p.address_line2,
    p.city,
    p.state,
    p.pincode,
    p.country,
    p.guardian_name,
    p.guardian_relationship,
    p.guardian_phone,
    p.guardian_email,
    p.emergency_contact_name,
    p.emergency_contact_phone,
    p.emergency_relationship,
    p.blood_type,
    p.height_cm,
    p.weight_kg,
    p.bmi,
    p.known_conditions,
    p.known_allergies,
    p.current_medications,
    p.smoking_status,
    p.alcohol_use,
    p.exercise_frequency,
    p.aadhar_card_number,
    p.insurance_provider,
    p.insurance_policy_no,
    p.updated_at AS profile_updated_at
FROM medical.users u
LEFT JOIN medical.patient_profiles p ON p.user_id = u.id
WHERE u.role = 'patient';
