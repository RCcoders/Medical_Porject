from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    print("Error: DATABASE_URL not found")
    exit(1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def promote_user(email: str):
    try:
        # 1. Update User Role
        sql = text("UPDATE medical.users SET role = 'doctor' WHERE email = :email RETURNING id")
        result = db.execute(sql, {"email": email})
        user_row = result.fetchone()
        
        if not user_row:
            print(f"User {email} not found!")
            return

        user_id = user_row[0]
        print(f"User {email} (ID: {user_id}) promoted to 'doctor'.")

        # 2. Assign Doctor Profile if missing
        sql_check = text("SELECT id FROM medical.doctors WHERE user_id = :user_id")
        doc_exists = db.execute(sql_check, {"user_id": user_id}).fetchone()

        if not doc_exists:
            print("Creating Doctor Profile...")
            sql_insert = text("""
                INSERT INTO medical.doctors (id, user_id, specialty, years_of_experience, hospital_name, bio)
                VALUES (uuid_generate_v4(), :user_id, 'General Medicine', 5, 'City Hospital', 'Newly promoted doctor.')
            """)
            db.execute(sql_insert, {"user_id": user_id})
            print("Doctor profile created.")
        else:
            print("Doctor profile already exists.")

        db.commit()
        print("Success!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    email = "sunitagudia21@gmail.com"
    print(f"Promoting {email}...")
    promote_user(email)
