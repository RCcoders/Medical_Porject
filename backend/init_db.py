import sys
import os
from sqlalchemy import create_engine, text

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SQLALCHEMY_DATABASE_URL
from backend import models

def init_db():
    # Remove options from URL to connect to default schema for schema creation
    base_url = SQLALCHEMY_DATABASE_URL.split("?")[0]
    engine = create_engine(base_url)
    
    with engine.connect() as connection:
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS medical"))
        connection.commit()
        print("Schema 'medical' created or verified.")
    
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
