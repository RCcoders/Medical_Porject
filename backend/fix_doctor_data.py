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

def fix_doctor_data():
    try:
        # Check for doctors with NULL license_number
        sql_check = text("SELECT id, user_id FROM medical.doctors WHERE license_number IS NULL")
        results = db.execute(sql_check).fetchall()
        
        if not results:
            print("No doctors found with missing license numbers.")
            return

        print(f"Found {len(results)} doctors with missing license numbers. Updating...")

        # Update them to 'PENDING'
        sql_update = text("UPDATE medical.doctors SET license_number = 'PENDING' WHERE license_number IS NULL")
        db.execute(sql_update)
        db.commit()
        
        print("Successfully updated missing license numbers to 'PENDING'.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_doctor_data()
