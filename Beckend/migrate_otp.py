from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def migrate():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    
    try:
        engine = create_engine(db_url)
        engine.connect()
        print("Connected to PostgreSQL")
    except Exception:
        print("PostgreSQL connection failed. Using SQLite fallback...")
        db_url = "sqlite:///./megastroy.db"
        engine = create_engine(db_url)

    with engine.connect() as conn:
        print(f"Adding otp_code to users table in {db_url}...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_code VARCHAR"))
            conn.commit()
            print("otp_code added.")
        except Exception as e:
            print(f"otp_code error (might already exist): {e}")

        print("Adding otp_created_at to users table...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_created_at TIMESTAMP"))
            conn.commit()
            print("otp_created_at added.")
        except Exception as e:
            print(f"otp_created_at error (might already exist): {e}")
        
    print("Migration finished!")

if __name__ == "__main__":
    migrate()
