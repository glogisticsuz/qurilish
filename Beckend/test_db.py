import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Testing connection to: {SQLALCHEMY_DATABASE_URL}")

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    conn = engine.connect()
    print("Successfully connected to PostgreSQL!")
    conn.close()
except Exception as e:
    print(f"FAILED to connect to PostgreSQL: {e}")
