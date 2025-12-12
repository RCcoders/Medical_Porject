export interface DoctorProfile {
  id: string
  user_id: string
  specialty?: string
  license_number?: string
  years_of_experience?: number
  hospital_affiliation?: string
  bio?: string
  medical_degree_proof?: string
  registration_cert?: string
  identity_proof?: string
  professional_photo?: string
  other_certificates?: string
  hospital_name?: string
  hospital_state?: string
  hospital_city?: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'patient' | 'doctor' | 'researcher'
  date_of_birth?: string
  phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  blood_type?: string
  height_cm?: number
  weight_kg?: number
  created_at: string
  updated_at: string
  doctor_profile?: DoctorProfile
}

export interface HospitalVisit {
  id: string
  user_id: string
  hospital_name: string
  hospital_address?: string
  department?: string
  admission_date: string
  discharge_date?: string
  visit_type: 'Emergency' | 'Scheduled' | 'Follow-up' | 'Surgery' | 'Consultation'
  primary_doctor: string
  diagnosis: string
  treatment_summary?: string
  cost?: number
  insurance_claim_status: 'Pending' | 'Submitted' | 'Approved' | 'Rejected' | 'Partial'
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  user_id: string
  visit_id?: string
  drug_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date?: string
  refills_remaining: number
  side_effects?: string
  special_instructions?: string
  prescribing_doctor: string
  pharmacy?: string
  status: 'Active' | 'Completed' | 'Discontinued' | 'Needs_Refill'
  created_at: string
  updated_at: string
}

export interface Allergy {
  id: string
  user_id: string
  allergen_name: string
  allergen_type: 'Food' | 'Drug' | 'Environmental' | 'Contact' | 'Other'
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening'
  reaction_symptoms: string
  treatment_protocol?: string
  first_observed: string
  last_reaction?: string
  created_at: string
  updated_at: string
}

export interface LabResult {
  id: string
  user_id: string
  visit_id?: string
  test_name: string
  test_category: 'Blood' | 'Urine' | 'Imaging' | 'Cardiac' | 'Pulmonary' | 'Other'
  result_value: string
  result_unit?: string
  reference_range?: string
  status: 'Normal' | 'Abnormal' | 'Critical' | 'Pending'
  test_date: string
  ordering_doctor: string
  lab_facility?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface InsurancePolicy {
  id: string
  user_id: string
  policy_number: string
  insurance_company: string
  policy_type: 'Health' | 'Dental' | 'Vision' | 'Life' | 'Disability'
  coverage_start: string
  coverage_end: string
  premium_amount: number
  deductible_amount: number
  deductible_met: number
  coverage_details?: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  user_id: string
  policy_id: string
  visit_id?: string
  claim_number: string
  claim_amount: number
  approved_amount?: number
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Pending Additional Info'
  submission_date: string
  processed_date?: string
  reason_for_claim: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  doctor_name: string
  specialty?: string
  hospital_clinic: string
  appointment_date: string
  appointment_type: 'Routine' | 'Follow-up' | 'Consultation' | 'Procedure' | 'Emergency'
  reason: string
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled'
  consultation_mode?: 'Online' | 'Offline'
  location?: string
  notes?: string
  created_at: string
  updated_at: string
}