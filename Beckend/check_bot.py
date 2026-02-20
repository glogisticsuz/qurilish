import httpx
import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("SUPPORT_BOT_TOKEN")
print(f"Checking support bot token: {TOKEN[:10]}...")

try:
    with httpx.Client() as client:
        res = client.post(f"https://api.telegram.org/bot{TOKEN}/getMe")
        print(res.json())
except Exception as e:
    print(f"Error: {e}")
