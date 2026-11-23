import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

token = '7418b689f9b4fbf82c9f67588206fecc'
base = 'https://test.sequel247.com'

endpoints = [
    ('/api/shipment/create', {'token': token}),
    ('/api/createShipment', {'token': token}),
    ('/api/address/createAddress', {'token': token}),
    ('/api/createAddress', {'token': token}),
    ('/api/track', {'token': token, 'docket': '123456'}),
    ('/api/shipment/track', {'token': token, 'docket': '123456'}),
]

for ep, payload in endpoints:
    url = base + ep
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req, context=ctx, timeout=10)
        body = res.read().decode('utf-8', errors='ignore')
        print(f"SUCCESS {ep}: {body[:400]}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore')
        print(f"HTTP {e.code} {ep}: {err_body[:400]}")
    except Exception as e:
        print(f"ERROR {ep}: {e}")
