from backend.database import SessionLocal, engine
from sqlalchemy import text
from backend import models

def test():
    try:
        db = SessionLocal()
        print("CONN:OK")
        try:
            db.execute(text("CREATE SCHEMA IF NOT EXISTS ml_platform"))
            db.commit()
            print("SCHEMA:OK")
        except Exception as e:
            print(f"SCHEMA:ERR:{str(e)[:50]}")
        
        try:
            models.Base.metadata.create_all(bind=engine)
            print("TABLES:OK")
        except Exception as e:
            print(f"TABLES:ERR:{str(e)[:50]}")

        try:
            users = db.query(models.User).limit(1).all()
            print(f"QUERY:OK:{len(users)}")
        except Exception as e:
            print(f"QUERY:ERR:{str(e)[:50]}")
            
    except Exception as e:
        print(f"CONN:ERR:{str(e)[:50]}")

if __name__ == "__main__":
    test()
