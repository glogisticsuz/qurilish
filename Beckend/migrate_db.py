import sqlite3
import os

db_path = 'megastroy.db'

def migrate():
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(portfolio_items)")
        columns = [c[1] for c in cursor.fetchall()]
        
        if 'views_count' not in columns:
            print("Adding views_count column...")
            cursor.execute("ALTER TABLE portfolio_items ADD COLUMN views_count INTEGER DEFAULT 0")
            conn.commit()
            print("Migration successful!")
        else:
            print("Column views_count already exists.")
            
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
