from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
import secrets

from backend import schemas, models
from backend.repositories.base import BaseRepository
from backend.core import exceptions
from backend import auth as auth_utils # existing utils (hashing/jwt)

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BaseRepository(models.User, db)
        self.otp_repo = BaseRepository(models.OTP, db)

    def register_user(self, user_in: schemas.UserCreate) -> models.User:
        # Check if email exists
        existing_user = self.db.query(models.User).filter(models.User.email == user_in.email).first()
        if existing_user:
            raise exceptions.BadRequestException("Email already registered")

        # Hash Password
        hashed_password = auth_utils.get_password_hash(user_in.password)

        # Prepare data
        user_data = user_in.dict(exclude={"password"})
        user_data["hashed_password"] = hashed_password
        
        # Determine Role (Default to patient if invalid or missing)
        allowed_roles = ["patient", "doctor", "researcher"]
        if not user_data.get("role") or user_data["role"] not in allowed_roles:
            user_data["role"] = "patient"
        
        user_data["is_verified"] = False

        # Create User
        new_user = self.repo.create(user_data)
        
        # Create Profile based on Role
        if new_user.role == "doctor":
            doctor_data = {
                "user_id": new_user.id,
                "specialty": "General Medicine", # Default, can be updated later
                "license_number": "PENDING",
                "years_of_experience": 0,
                "hospital_name": user_in.hospital_name,
                "hospital_state": user_in.hospital_state,
                "hospital_city": user_in.hospital_city,
                "bio": "New doctor account."
            }
            # Use raw SQL or create a repo for Doctor if not exists. 
            # For now, simplistic direct DB add to avoid circular deps if Repo not ready
            # Better: Use generic repo logic if possible or just sql
            # Since I don't have DoctorRepo instantiated here easily without adding it to __init__
            from backend.models import Doctor
            new_doc = Doctor(**doctor_data)
            self.db.add(new_doc)
            self.db.commit()
            
        elif new_user.role == "researcher":
            researcher_data = {
                "user_id": new_user.id,
                "institution": user_in.hospital_name or "Unknown Institution",
                "field_of_study": "General Research"
            }
            from backend.models import Researcher
            new_res = Researcher(**researcher_data)
            self.db.add(new_res)
            self.db.commit()

        # Generate Secure OTP
        otp_code = str(secrets.randbelow(900000) + 100000)
        
        # Save OTP (Deleting old ones manually)
        self.db.query(models.OTP).filter(models.OTP.email == user_in.email).delete()
        
        from datetime import datetime
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        otp_data = {
            "email": user_in.email, 
            "otp_code": otp_code, 
            "expires_at": expires_at
        }
        self.otp_repo.create(otp_data)
        
        # Log (Simulation)
        print(f"OTP for {user_in.email}: {otp_code}")
        
        return new_user

    def authenticate_user(self, email: str, password: str) -> models.User:
        user = self.db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise exceptions.UnauthorizedException("Incorrect username or password")
        if not auth_utils.verify_password(password, user.hashed_password):
            raise exceptions.UnauthorizedException("Incorrect username or password")
        return user

    def verify_otp(self, email: str, otp: str):
        otp_record = self.db.query(models.OTP).filter(models.OTP.email == email).first()
        if not otp_record:
            raise exceptions.BadRequestException("Invalid OTP or OTP expired")
            
        if otp_record.otp_code != otp:
             raise exceptions.BadRequestException("Invalid OTP")
             
        # Verify User
        user = self.db.query(models.User).filter(models.User.email == email).first()
        if user:
            user.is_verified = True
            self.db.commit()
            
        # Delete OTP
        self.db.delete(otp_record)
        self.db.commit()
        return {"message": "Email verified successfully"}
