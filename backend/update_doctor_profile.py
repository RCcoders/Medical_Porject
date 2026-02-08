from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def fix_profile():
    email = "sunitagudia21@gmail.com"
    try:
        # 1. Get User ID
        sql_user = text("SELECT id, full_name, hospital_name, hospital_state, hospital_city FROM medical.users WHERE email = :email")
        user = db.execute(sql_user, {"email": email}).fetchone()
        
        if not user:
            print(f"User {email} not found.")
            return

        user_id = user[0]
        print(f"User Found: {user.full_name} (ID: {user_id})")
        print(f"Current User Details: Hospital={user.hospital_name}, State={user.hospital_state}, City={user.hospital_city}")

        # 2. Update User Details (to match Doctor details, ensuring consistency)
        sql_update_user = text("""
            UPDATE medical.users 
            SET hospital_name = 'Aakash Eye Hospital', 
                hospital_state = 'Gujarat', 
                hospital_city = 'Mehsana'
            WHERE id = :id
        """)
        db.execute(sql_update_user, {"id": user_id})
        print("Updated User location details.")

        # 3. Update Doctor Profile
        sql_update_doc = text("""
            UPDATE medical.doctors 
            SET hospital_name = 'Aakash Eye Hospital', 
                hospital_state = 'Gujarat', 
                hospital_city = 'Mehsana',
                specialty = 'Ophthalmologist' -- Inferring from 'Eye Hospital' but keeping safe, user said 'General Medicine' in screenshot but 'Eye Hospital' implies otherwise. checking user request again.
            WHERE user_id = :user_id
        """)
        # User didn't explicitly say specialty change, but "Eye Hospital" suggests Ophthalmology. 
        # However, in screenshot it says "General Medicine". 
        # I will update location first. I'll stick to 'General Medicine' unless I have better info, OR I will just update location.
        # Actually user said "added state gujarat and city mehsana and hospital aakash eye hospital".
        # Let's update just those.
        
        sql_update_doc_safely = text("""
            UPDATE medical.doctors 
            SET hospital_name = 'Aakash Eye Hospital', 
                hospital_state = 'Gujarat', 
                hospital_city = 'Mehsana'
            WHERE user_id = :user_id
        """)
        
        db.execute(sql_update_doc_safely, {"user_id": user_id})
        print("Updated Doctor Profile details.")

        db.commit()
        print("Success! Data corrected.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_profile()
