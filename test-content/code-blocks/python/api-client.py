import requests
import json

def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return None

# Example usage
data = fetch_data('https://api.example.com/data')
if data:
    print(json.dumps(data, indent=2))
else:
    print('Failed to fetch data')