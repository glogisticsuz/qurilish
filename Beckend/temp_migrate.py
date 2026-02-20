import sqlite3
import os

db_path = "hamkorqurilish.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Update portfolio_items table
    cursor.execute("PRAGMA table_info(portfolio_items)")
    portfolio_cols = [row[1] for row in cursor.fetchall()]
    
    if "description" not in portfolio_cols:
        print("Adding column 'description' to 'portfolio_items'...")
        cursor.execute("ALTER TABLE portfolio_items ADD COLUMN description TEXT")
    
    if "item_type" not in portfolio_cols:
        print("Adding column 'item_type' to 'portfolio_items'...")
        cursor.execute("ALTER TABLE portfolio_items ADD COLUMN item_type TEXT DEFAULT 'service'")

    conn.commit()
    conn.close()
    print("Migration finished successfully.")

if __name__ == "__main__":
    migrate()
