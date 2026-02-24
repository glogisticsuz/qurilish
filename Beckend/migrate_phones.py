import sqlite3
import re

def migrate():
    conn = sqlite3.connect('megastroy.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, phone FROM users")
    users = cursor.fetchall()
    
    for user_id, phone in users:
        if phone:
            new_phone = "+" + re.sub(r'\D', '', phone)
            if new_phone != phone:
                print(f"Updating user {user_id}: {phone} -> {new_phone}")
                try:
                    cursor.execute("UPDATE users SET phone = ? WHERE id = ?", (new_phone, user_id))
                except sqlite3.IntegrityError:
                    print(f"Conflict: {new_phone} already exists. Skipping or merging might be needed.")
    
    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
