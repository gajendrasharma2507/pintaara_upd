import urllib.request
import json

req = urllib.request.Request('https://api.pintaara.com/api/products/60', headers={'Accept': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print('STATUS:', data.get('status'))
        prod = data.get('data', {})
        print('Product Name:', prod.get('name'))
        print('Product Code:', prod.get('design_code'))
        options = prod.get('options', [])
        for opt in options:
            print('OPTION GROUP:', opt.get('name'))
            for val in opt.get('values', []):
                print(f"  - {val.get('value')}: price_delta = {val.get('price_delta')}")
except Exception as e:
    print('Error:', e)
