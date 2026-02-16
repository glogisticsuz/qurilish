import requests
import json

# Use localhost to test backend execution
url = "http://127.0.0.1:8000/auth/login"
headers = {"Content-Type": "application/json"}
data = {
    "phone": "+998901234567",
    "role": "client"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, headers=headers, json=data, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
