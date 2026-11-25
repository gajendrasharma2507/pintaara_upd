import urllib.request
import json

req = urllib.request.Request('https://admin.pintaara.com/api/products')
req.add_header('Accept', 'application/json')
req.add_header('User-Agent', 'Mozilla/5.0')
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode())
product = data['data'][0]
print("ALL KEYS:", list(product.keys()))
for k in ['making_charge_percent', 'making_charge', 'wastage_percent']:
    print(f"{k} in product:", k in product, product.get(k))
