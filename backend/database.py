from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Default to a local postgres url if not set. User can change this later.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://raghav:Raghav%40123@localhost:5432/postgres?options=-csearch_path=medical")

print(f"------------ DATABASE CONFIG ------------")
print(f"Connecting to: {SQLALCHEMY_DATABASE_URL.split('@')[-1]}") # Print host only for security
print(f"-----------------------------------------")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
