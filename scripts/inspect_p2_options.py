import urllib.request
import json

req = urllib.request.Request('https://admin.pintaara.com/api/products/PD-PD-CS-002')
req.add_header('Accept', 'application/json')
req.add_header('User-Agent', 'Mozilla/5.0')
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode())
prod = data['data']
for opt in prod.get('options', []):
    print("Option:", opt.get('name'), "Display:", opt.get('display_type'), "Values count:", len(opt.get('values', [])))
    for v in opt.get('values', []):
        print("  - Value:", v.get('value'), "Delta:", v.get('price_delta'))
