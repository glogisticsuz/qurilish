import requests
import json

url = "http://localhost:8000/admin/login"
headers = {"Content-Type": "application/json"}
data = {
    "username": "Megastroy+998916006046",
    "password": "hamkorqurilish_2026_6046"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
