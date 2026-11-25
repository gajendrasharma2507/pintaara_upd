import urllib.request
import json

res = urllib.request.urlopen('https://admin.pintaara.com/api/products/PD-PD-CS-002')
data = json.loads(res.read())
opts = data['data']['options']
print(f"Total Options: {len(opts)}")
for o in opts:
    vals = [v['value'] for v in o['values']]
    print(f"  {o['name']} ({o.get('display_type')}): {vals}")
