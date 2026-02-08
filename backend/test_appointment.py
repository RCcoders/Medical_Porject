from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import uuid
import datetime
from dotenv import load_dotenv
from pathlib import Path
from backend import models, schemas

# Explicitly load .env from the backend directory
env_path = Path("backend/.env").resolve()
load_dotenv(dotenv_path=env_path)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def test_create_appointment():
    try:
        # 1. Get a test patient
        patient = db.query(models.User).filter(models.User.role == 'patient').first()
        if not patient:
            print("No patient user found to book appointment.")
            return

        print(f"Booking for Patient: {patient.email}")

        # 2. Get the new doctor
        doctor_email = "sunitagudia21@gmail.com"
        doctor_user = db.query(models.User).filter(models.User.email == doctor_email).first()
        
        doctor_name_to_use = "Dr. Unknown"
        if doctor_user:
             doctor_name_to_use = doctor_user.full_name
             print(f"Found Doctor: {doctor_name_to_use}")
        else:
             print("Doctor not found, using placeholder.")

        # 3. Create Appointment Payload
        # Mimic what the frontend sends: doctor_name string
        appt_data = schemas.AppointmentCreate(
            user_id=patient.id,
            doctor_name=doctor_name_to_use, 
            specialty="General Medicine",
            hospital_clinic="City Hospital",
            location="Mumbai, Maharashtra",
            appointment_date=datetime.datetime.now() + datetime.timedelta(days=1),
            appointment_type="Routine",
            reason="Test Appointment from Script",
            status="Confirmed",
            notes="Checking if name persists",
            consultation_mode="Offline"
        )

        # 4. Save to DB
        db_appt = models.Appointment(id=str(uuid.uuid4()), **appt_data.dict())
        db.add(db_appt)
        db.commit()
        db.refresh(db_appt)

        print(f"Appointment Created! ID: {db_appt.id}")
        print(f"Saved Doctor Name: '{db_appt.doctor_name}'")

        # 5. Verify Read
        read_appt = db.query(models.Appointment).filter(models.Appointment.id == db_appt.id).first()
        print(f"Read Doctor Name: '{read_appt.doctor_name}'")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_create_appointment()
