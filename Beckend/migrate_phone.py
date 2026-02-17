import sqlite3
import os

db_path = "megastroy.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Update portfolio_items table
    cursor.execute("PRAGMA table_info(portfolio_items)")
    portfolio_cols = [row[1] for row in cursor.fetchall()]
    
    if "phone" not in portfolio_cols:
        print("Adding column 'phone' to 'portfolio_items'...")
        cursor.execute("ALTER TABLE portfolio_items ADD COLUMN phone TEXT")

    conn.commit()
    conn.close()
    print("Migration finished successfully.")

if __name__ == "__main__":
    migrate()
