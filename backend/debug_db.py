from backend.database import SessionLocal, engine
from backend import models
from sqlalchemy import text


def test_connection():
    try:
        db = SessionLocal()
        print("Connection successful!")
        
        # Check schema
        # Try to create schema
        try:
            db.execute(text("CREATE SCHEMA IF NOT EXISTS ml_platform"))
            db.commit()
            print("Schema ml_platform created or exists.")
        except Exception as e:
            print(f"Error creating schema: {e}")

        # Try to create tables
        try:
            print("Attempting to create tables...")
            models.Base.metadata.create_all(bind=engine)
            print("Tables created successfully.")
        except Exception as e:
            print(f"Error creating tables: {e}")

        # Try to query users
        try:
            users = db.query(models.User).limit(5).all()
            print(f"Users found: {len(users)}")
            for user in users:
                print(f"User: {user.full_name}, ID: {user.id} (Type: {type(user.id)})")
        except Exception as e:
            print(f"Error querying users: {e}")

        db.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_connection()
