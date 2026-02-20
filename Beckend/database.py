from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

try:
    if SQLALCHEMY_DATABASE_URL and "postgresql" in SQLALCHEMY_DATABASE_URL:
        # Check if we can actually connect to Postgres
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        engine.connect()
    else:
        # If no URL or not postgres, use SQLite
        SQLALCHEMY_DATABASE_URL = "sqlite:///./megastroy.db"
        engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
except Exception as e:
    print(f"Baza ulanishida xatolik: {e}. SQLite ishlatilmoqda...")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./megastroy.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
