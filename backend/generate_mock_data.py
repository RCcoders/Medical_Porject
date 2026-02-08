import uuid
import random
from datetime import datetime, timedelta

# Names provided
names = [
    "Aarav", "Kavya", "Rohan", "Meera", "Vivaan", "Ananya", "Ishaan", "Sanya", 
    "Dhruv", "Nisha", "Arjun", "Pooja", "Krish", "Tanya", "Laksh", "Riya", 
    "Yash", "Sneha", "Aditya", "Simran"
]

# Generate fixed UUIDs
users = []
for name in names:
    users.append({
        "id": str(uuid.uuid4()),
        "name": name,
        "email": f"{name.lower()}@example.com",
        "role": "patient" # default
    })

# Assign Roles
# Doctors: Aarav (0), Kavya (1)
users[0]["role"] = "doctor"
users[1]["role"] = "doctor"

# Researchers: Rohan (2), Meera (3)
users[2]["role"] = "researcher"
users[3]["role"] = "researcher"

# Rest are patients (4-19)
patients = users[4:]
doctors = users[:2]

sql_statements = []

# 1. USERS
sql_statements.append("-- 1. INSERT USERS")
password_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW" # "secret"
for u in users:
    sql_statements.append(
        f"INSERT INTO medical.users (id, email, full_name, role, hashed_password, is_verified) "
        f"VALUES ('{u['id']}', '{u['email']}', '{u['name']}', '{u['role']}', '{password_hash}', true);"
    )

# 2. DOCTORS
sql_statements.append("\n-- 2. INSERT DOCTORS")
specialties = ["Cardiology", "Neurology", "General Medicine"]
for i, d in enumerate(doctors):
    sql_statements.append(
        f"INSERT INTO medical.doctors (id, user_id, specialty, years_of_experience, hospital_name) "
        f"VALUES ('{str(uuid.uuid4())}', '{d['id']}', '{specialties[i]}', {10+i}, 'City Hospital');"
    )

# 3. RESEARCHERS
sql_statements.append("\n-- 3. INSERT RESEARCHERS")
for i, r in enumerate(users[2:4]):
    sql_statements.append(
        f"INSERT INTO medical.researchers (id, user_id, institution, field_of_study) "
        f"VALUES ('{str(uuid.uuid4())}', '{r['id']}', 'Medical Research Inst', 'Epidemiology');"
    )

# 4. HOSPITAL VISITS (10 rows)
sql_statements.append("\n-- 4. INSERT HOSPITAL VISITS")
visit_ids = []
for i in range(10):
    p = random.choice(patients)
    v_id = str(uuid.uuid4())
    visit_ids.append(v_id)
    doc = random.choice(doctors)
    sql_statements.append(
        f"INSERT INTO medical.hospital_visits (id, user_id, hospital_name, diagnosis, primary_doctor, admission_date, visit_type) "
        f"VALUES ('{v_id}', '{p['id']}', 'City Hospital', 'Viral Fever', '{doc['name']}', NOW() - INTERVAL '{random.randint(1,30)} days', 'OPD');"
    )

# 5. APPOINTMENTS (10 rows)
sql_statements.append("\n-- 5. INSERT APPOINTMENTS")
for i in range(10):
    p = random.choice(patients)
    doc = random.choice(doctors)
    sql_statements.append(
        f"INSERT INTO medical.appointments (id, user_id, doctor_name, specialty, appointment_date, status, hospital_clinic) "
        f"VALUES ('{str(uuid.uuid4())}', '{p['id']}', '{doc['name']}', 'General', NOW() + INTERVAL '{random.randint(1,7)} days', 'Scheduled', 'City Hospital');"
    )

# 6. ALLERGIES (10 rows)
sql_statements.append("\n-- 6. INSERT ALLERGIES")
allergens = ["Peanuts", "Dust", "Pollen", "Penicillin"]
for i in range(10):
    p = random.choice(patients)
    sql_statements.append(
        f"INSERT INTO medical.allergies (id, user_id, allergen_name, reaction_symptoms, severity, allergen_type, first_observed) "
        f"VALUES ('{str(uuid.uuid4())}', '{p['id']}', '{random.choice(allergens)}', 'Rashes', 'Moderate', 'Food', '2020-01-01');"
    )

# 7. PRESCRIPTIONS (10 rows)
sql_statements.append("\n-- 7. INSERT PRESCRIPTIONS")
drugs = ["Paracetamol", "Amoxicillin", "Cetirizine"]
for i in range(10):
    v_id = visit_ids[i] # Link to visits created above
    # Find patient for this visit? (Not strictly needed for SQL but good for consistency, 
    # actually prescription table has user_id. We need to match valid user_id to visit_id)
    # To keep it simple, I'll just pick a random patient again, distinct from visit might be inconsistent but OK for mock.
    # WAIT: Foreign key constraint might not exist between visit.user_id and prescription.user_id but logic should hold.
    # Let's just pick a random patient for now, assuming loose coupling in this mock script.
    # BETTER: Retrieve user_id from visit... can't easily in this script without tracking.
    # I'll update the visits loop to track (visit_id, patient_id)
    pass 

# RE-DO Visits Loop to track relationships
visit_data = [] # (id, user_id)
sql_statements_visits = ["\n-- 4. INSERT HOSPITAL VISITS"]
for i in range(10):
    p = random.choice(patients)
    v_id = str(uuid.uuid4())
    visit_data.append((v_id, p['id']))
    doc = random.choice(doctors)
    sql_statements_visits.append(
        f"INSERT INTO medical.hospital_visits (id, user_id, hospital_name, diagnosis, primary_doctor, admission_date, visit_type) "
        f"VALUES ('{v_id}', '{p['id']}', 'City Hospital', 'Viral Fever', '{doc['name']}', NOW() - INTERVAL '{random.randint(1,30)} days', 'OPD');"
    )
# Replace the placeholder list
sql_statements[3] = "\n".join(sql_statements_visits) # Hacky replace of index logic, simpler to just rebuild list.

# Let's just rebuild the full list cleanly.
final_sql = []
final_sql.append("-- GENERATED MOCK DATA")
final_sql.extend(sql_statements[0:3]) # Users, Docs, Researchers already good strings list? No, they were appends.
# My logic above was appending to `sql_statements`.
# I will clear `sql_statements` and re-populate cleanly.

final_sql = []

# 1. USERS
final_sql.append("-- 1. INSERT USERS")
for u in users:
    final_sql.append(
        f"INSERT INTO medical.users (id, email, full_name, role, hashed_password, is_verified) "
        f"VALUES ('{u['id']}', '{u['email']}', '{u['name']}', '{u['role']}', '{password_hash}', true);"
    )

# 2. DOCTORS
final_sql.append("\n-- 2. INSERT DOCTORS")
for i, d in enumerate(doctors):
    final_sql.append(
        f"INSERT INTO medical.doctors (id, user_id, specialty, years_of_experience, hospital_name) "
        f"VALUES ('{str(uuid.uuid4())}', '{d['id']}', '{specialties[i]}', {10+i}, 'City Hospital');"
    )

# 3. RESEARCHERS
final_sql.append("\n-- 3. INSERT RESEARCHERS")
for i, r in enumerate(users[2:4]):
    final_sql.append(
        f"INSERT INTO medical.researchers (id, user_id, institution, field_of_study) "
        f"VALUES ('{str(uuid.uuid4())}', '{r['id']}', 'Medical Research Inst', 'Epidemiology');"
    )

# 4. HOSPITAL VISITS
final_sql.append("\n-- 4. INSERT HOSPITAL VISITS")
visit_data = []
for i in range(10):
    p = random.choice(patients)
    v_id = str(uuid.uuid4())
    visit_data.append({'id': v_id, 'user_id': p['id']})
    doc = random.choice(doctors)
    final_sql.append(
        f"INSERT INTO medical.hospital_visits (id, user_id, hospital_name, diagnosis, primary_doctor, admission_date, visit_type) "
        f"VALUES ('{v_id}', '{p['id']}', 'City Hospital', 'Viral Fever', '{doc['name']}', NOW() - INTERVAL '{random.randint(1,30)} days', 'OPD');"
    )

# 5. APPOINTMENTS
final_sql.append("\n-- 5. INSERT APPOINTMENTS")
for i in range(10):
    p = random.choice(patients)
    doc = random.choice(doctors)
    final_sql.append(
        f"INSERT INTO medical.appointments (id, user_id, doctor_name, specialty, appointment_date, status, hospital_clinic) "
        f"VALUES ('{str(uuid.uuid4())}', '{p['id']}', '{doc['name']}', 'General', NOW() + INTERVAL '{random.randint(1,7)} days', 'Scheduled', 'City Hospital');"
    )

# 6. ALLERGIES
final_sql.append("\n-- 6. INSERT ALLERGIES")
for i in range(10):
    p = random.choice(patients)
    final_sql.append(
        f"INSERT INTO medical.allergies (id, user_id, allergen_name, reaction_symptoms, severity, allergen_type, first_observed) "
        f"VALUES ('{str(uuid.uuid4())}', '{p['id']}', '{random.choice(allergens)}', 'Rashes', 'Moderate', 'Food', '2020-01-01');"
    )

# 7. PRESCRIPTIONS (Linked to Visits 1:1 for simplicity)
final_sql.append("\n-- 7. INSERT PRESCRIPTIONS")
for i in range(10):
    v = visit_data[i]
    final_sql.append(
        f"INSERT INTO medical.prescriptions (id, user_id, visit_id, drug_name, dosage, frequency, start_date, refills_remaining, status, prescribing_doctor) "
        f"VALUES ('{str(uuid.uuid4())}', '{v['user_id']}', '{v['id']}', '{random.choice(drugs)}', '500mg', 'Twice Daily', NOW()::date, 2, 'Active', 'Dr. {doctors[0]['name']}');"
    )

# 8. LAB RESULTS
final_sql.append("\n-- 8. INSERT LAB RESULTS")
tests = ["Blood Test", "X-Ray", "MRI"]
for i in range(10):
    v = visit_data[i]
    final_sql.append(
        f"INSERT INTO medical.lab_results (id, user_id, visit_id, test_name, test_category, result_value, status, test_date, ordering_doctor) "
        f"VALUES ('{str(uuid.uuid4())}', '{v['user_id']}', '{v['id']}', '{random.choice(tests)}', 'Pathology', 'Normal', 'Completed', NOW(), 'Dr. {doctors[0]['name']}');"
    )

# Output
file_path = "backend/mock_data.sql"
with open(file_path, "w") as f:
    f.write("\n".join(final_sql))

print(f"Generated {file_path}")
