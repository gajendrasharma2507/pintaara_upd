import requests

try:
    resp = requests.get('https://admin.pintaara.com/admin/login', timeout=15)
    print("STATUS:", resp.status_code)
    print("HEADERS:", resp.headers)
    print("BODY (first 300 chars):", resp.text[:300])
except Exception as e:
    print("Request failed:", e)
