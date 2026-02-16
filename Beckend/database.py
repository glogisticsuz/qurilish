from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

try:
    if not SQLALCHEMY_DATABASE_URL or "postgresql" in SQLALCHEMY_DATABASE_URL:
        # Check if we can actually connect to Postgres, otherwise use SQLite
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        engine.connect()
    else:
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
except Exception:
    print("PostgreSQL ulanishda xatolik. SQLite ishlatilmoqda...")
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
