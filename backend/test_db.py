import sys
import os
from sqlalchemy import create_engine, text, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SQLALCHEMY_DATABASE_URL

def test_db():
    # Remove options from URL
    base_url = SQLALCHEMY_DATABASE_URL.split("?")[0]
    engine = create_engine(base_url)
    Base = declarative_base()

    class TestTable(Base):
        __tablename__ = "test_table"
        id = Column(Integer, primary_key=True)
        name = Column(String)

    try:
        Base.metadata.create_all(bind=engine)
        print("Successfully created table in default schema.")
        
        # Clean up
        Base.metadata.drop_all(bind=engine)
        print("Successfully dropped table.")
    except Exception as e:
        print(f"Failed to create table: {e}")

if __name__ == "__main__":
    test_db()
