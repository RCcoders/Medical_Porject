-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text check (role in ('patient', 'doctor', 'researcher')) default 'patient',
  date_of_birth date,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  blood_type text,
  height_cm numeric,
  weight_kg numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Doctors can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- HOSPITAL VISITS
create table public.hospital_visits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  hospital_name text not null,
  hospital_address text,
  department text,
  admission_date timestamptz not null,
  discharge_date timestamptz,
  visit_type text check (visit_type in ('Emergency', 'Scheduled', 'Follow-up', 'Surgery', 'Consultation')),
  primary_doctor text,
  diagnosis text,
  treatment_summary text,
  cost numeric,
  insurance_claim_status text check (insurance_claim_status in ('Pending', 'Submitted', 'Approved', 'Rejected', 'Partial')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.hospital_visits enable row level security;

create policy "Users can view own visits" on public.hospital_visits
  for select using (auth.uid() = user_id);

create policy "Doctors can view all visits" on public.hospital_visits
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- PRESCRIPTIONS
create table public.prescriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  visit_id uuid references public.hospital_visits(id),
  drug_name text not null,
  dosage text,
  frequency text,
  start_date date not null,
  end_date date,
  refills_remaining integer default 0,
  side_effects text,
  special_instructions text,
  prescribing_doctor text,
  pharmacy text,
  status text check (status in ('Active', 'Completed', 'Discontinued', 'Needs_Refill')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.prescriptions enable row level security;

create policy "Users can view own prescriptions" on public.prescriptions
  for select using (auth.uid() = user_id);

create policy "Doctors can view all prescriptions" on public.prescriptions
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- ALLERGIES
create table public.allergies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  allergen_name text not null,
  allergen_type text check (allergen_type in ('Food', 'Drug', 'Environmental', 'Contact', 'Other')),
  severity text check (severity in ('Mild', 'Moderate', 'Severe', 'Life-threatening')),
  reaction_symptoms text,
  treatment_protocol text,
  first_observed date,
  last_reaction date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.allergies enable row level security;

create policy "Users can view own allergies" on public.allergies
  for select using (auth.uid() = user_id);

create policy "Doctors can view all allergies" on public.allergies
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- LAB RESULTS
create table public.lab_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  visit_id uuid references public.hospital_visits(id),
  test_name text not null,
  test_category text check (test_category in ('Blood', 'Urine', 'Imaging', 'Cardiac', 'Pulmonary', 'Other')),
  result_value text,
  result_unit text,
  reference_range text,
  status text check (status in ('Normal', 'Abnormal', 'Critical', 'Pending')),
  test_date timestamptz not null,
  ordering_doctor text,
  lab_facility text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.lab_results enable row level security;

create policy "Users can view own lab results" on public.lab_results
  for select using (auth.uid() = user_id);

create policy "Doctors can view all lab results" on public.lab_results
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- INSURANCE POLICIES
create table public.insurance_policies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  policy_number text not null,
  insurance_company text not null,
  policy_type text check (policy_type in ('Health', 'Dental', 'Vision', 'Life', 'Disability')),
  coverage_start date not null,
  coverage_end date not null,
  premium_amount numeric,
  deductible_amount numeric,
  deductible_met numeric,
  coverage_details jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.insurance_policies enable row level security;

create policy "Users can view own insurance policies" on public.insurance_policies
  for select using (auth.uid() = user_id);

-- CLAIMS
create table public.claims (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  policy_id uuid references public.insurance_policies(id) on delete cascade not null,
  visit_id uuid references public.hospital_visits(id),
  claim_number text not null,
  claim_amount numeric,
  approved_amount numeric,
  status text check (status in ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Pending Additional Info')),
  submission_date date not null,
  processed_date date,
  reason_for_claim text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.claims enable row level security;

create policy "Users can view own claims" on public.claims
  for select using (auth.uid() = user_id);

-- APPOINTMENTS
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  doctor_name text not null,
  specialty text,
  hospital_clinic text,
  appointment_date timestamptz not null,
  appointment_type text check (appointment_type in ('Routine', 'Follow-up', 'Consultation', 'Procedure', 'Emergency')),
  reason text,
  status text check (status in ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.appointments enable row level security;

create policy "Users can view own appointments" on public.appointments
  for select using (auth.uid() = user_id);

create policy "Doctors can view all appointments" on public.appointments
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- RESEARCHER ACCESS (Anonymized Views would be better, but for direct table access if needed)
-- For now, we restrict researchers from seeing raw data in these tables via RLS.
-- They should access via specific views or functions which we can define later.
