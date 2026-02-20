import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def check_bot(name, token):
    if not token:
        print(f"{name}: Token not found")
        return
    url = f"https://api.telegram.org/bot{token}/getMe"
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                print(f"{name}: @{data['result']['username']} (ID: {data['result']['id']})")
            else:
                print(f"{name}: Error {res.status_code} - {res.text}")
        except Exception as e:
            print(f"{name}: Exception {e}")

async def main():
    await check_bot("MAIN_BOT", os.getenv("TELEGRAM_BOT_TOKEN"))
    await check_bot("SUPPORT_BOT", os.getenv("SUPPORT_BOT_TOKEN"))

if __name__ == "__main__":
    asyncio.run(main())
