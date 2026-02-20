import sqlite3
import os

db_path = "hamkorqurilish.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE messages ADD COLUMN image_url VARCHAR")
        print("image_url column added to messages table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("image_url column already exists.")
        else:
            print(f"Error: {e}")
    conn.commit()
    conn.close()
else:
    print(f"Database {db_path} not found.")
