import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

token = '7418b689f9b4fbf82c9f67588206fecc'
base = 'https://test.sequel247.com'

endpoints = [
    ('/api/checkServiceability', {'token': token, 'pin_code': '390001'}),
    ('/api/checkServiceability', {'token': token, 'pincode': '390001'}),
    ('/api/shipment/calculateEDD', {'token': token, 'origin_pincode': '390001', 'destination_pincode': '400001', 'pickup_date': '2026-11-25'}),
    ('/api/address/list', {'token': token}),
    ('/api/address/get', {'token': token, 'store_code': 'PINTARA'}),
    ('/api/address/create', {'token': token}),
]

for ep, payload in endpoints:
    url = base + ep
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req, context=ctx, timeout=10)
        body = res.read().decode('utf-8', errors='ignore')
        print(f"SUCCESS {ep}: {body[:300]}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore')
        print(f"HTTP {e.code} {ep}: {err_body[:300]}")
    except Exception as e:
        print(f"ERROR {ep}: {e}")
