import urllib.request

url = 'https://admin.pintaara.com/api/price/calculate'
headers = {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,accept',
    'User-Agent': 'Mozilla/5.0'
}

req = urllib.request.Request(url, headers=headers, method='OPTIONS')
try:
    with urllib.request.urlopen(req) as resp:
        print("OPTIONS Status:", resp.status)
        print("OPTIONS Headers:", dict(resp.headers))
except urllib.error.HTTPError as e:
    print(f"OPTIONS HTTPError: {e.code} - {e.read().decode()}")
except Exception as e:
    print("OPTIONS Exception:", e)
