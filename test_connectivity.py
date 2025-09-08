import requests

# This simple script tests if the server is reachable
try:
    response = requests.head('http://localhost:5000/reports', timeout=3)
    print(f"Server is reachable! Status code: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"Server is NOT reachable: {e}")
