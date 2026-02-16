import requests
import json

# Use the specific IP to test network connectivity
url = "http://192.168.1.18:8000/auth/login"
headers = {"Content-Type": "application/json"}
data = {
    "phone": "+998901234567",
    "role": "customer"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, headers=headers, json=data, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
