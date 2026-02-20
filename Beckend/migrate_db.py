import sqlite3
import os

db_path = "hamkorqurilish.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Update profiles table
    cursor.execute("PRAGMA table_info(profiles)")
    profiles_cols = [row[1] for row in cursor.fetchall()]
    print(f"Existing columns in 'profiles': {profiles_cols}")

    if "district" not in profiles_cols:
        print("Adding column 'district' to 'profiles'...")
        cursor.execute("ALTER TABLE profiles ADD COLUMN district TEXT")
    
    # 2. Update portfolio_items table
    cursor.execute("PRAGMA table_info(portfolio_items)")
    portfolio_cols = [row[1] for row in cursor.fetchall()]
    print(f"Existing columns in 'portfolio_items': {portfolio_cols}")

    # Add new columns
    new_portfolio_cols = [
        ("image_url1", "TEXT"),
        ("image_url2", "TEXT"),
        ("image_url3", "TEXT"),
        ("image_url4", "TEXT"),
        ("image_url5", "TEXT"),
        ("location", "TEXT")
    ]

    for col_name, col_type in new_portfolio_cols:
        if col_name not in portfolio_cols:
            print(f"Adding column '{col_name}' to 'portfolio_items'...")
            cursor.execute(f"ALTER TABLE portfolio_items ADD COLUMN {col_name} {col_type}")

    # Data migration: image_url -> image_url1
    if "image_url" in portfolio_cols and "image_url1" in [c[0] for c in new_portfolio_cols] + portfolio_cols:
        print("Migrating data from 'image_url' to 'image_url1'...")
        cursor.execute("UPDATE portfolio_items SET image_url1 = image_url WHERE image_url1 IS NULL")

    conn.commit()
    conn.close()
    print("Migration finished.")

if __name__ == "__main__":
    migrate()
