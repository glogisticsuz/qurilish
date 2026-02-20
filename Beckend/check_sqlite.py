import sqlite3

def check_db(db_path):
    print(f"Checking {db_path}...")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Tables: {tables}")
        
        if ('users',) in tables:
            cursor.execute("SELECT count(*) FROM users")
            count = cursor.fetchone()[0]
            print(f"User count: {count}")
            cursor.execute("SELECT phone, role FROM users LIMIT 5")
            print(f"Sample users: {cursor.fetchall()}")
        
        conn.close()
    except Exception as e:
        print(f"Error checking {db_path}: {e}")

check_db('megastroy.db')
print("-" * 20)
check_db('hamkorqurilish.db')
