from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import User, Doctor, Prescription, Appointment
from backend.database import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("--- USERS (Doctors) ---")
doctors = db.query(User).filter(User.role == "doctor").all()
for d in doctors:
    print(f"ID: {d.id}, Name: '{d.full_name}', Hospital: '{d.hospital_name}'")

print("\n--- PRESCRIPTIONS ---")
prescriptions = db.query(Prescription).order_by(Prescription.created_at.desc()).limit(5).all()
for p in prescriptions:
    print(f"ID: {p.id}, Prescribing Doctor: '{p.prescribing_doctor}', Patient ID: {p.user_id}, Created: {p.created_at}")

print("\n--- RECENT PATIENTS ---")
patients = db.query(User).filter(User.role == "patient").order_by(User.created_at.desc()).limit(5).all()
for p in patients:
    print(f"ID: {p.id}, Name: '{p.full_name}', Created: {p.created_at}, Hospital: '{p.hospital_name}'")

print("\n--- APPOINTMENTS ---")
appointments = db.query(Appointment).order_by(Appointment.created_at.desc()).limit(5).all()
for a in appointments:
    print(f"ID: {a.id}, Doctor Name: '{a.doctor_name}', Patient ID: {a.user_id}, Created: {a.created_at}")
