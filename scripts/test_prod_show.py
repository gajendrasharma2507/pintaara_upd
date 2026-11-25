import urllib.request
import json

req = urllib.request.Request('https://admin.pintaara.com/api/products/PD-PD-CS-002')
req.add_header('Accept', 'application/json')
req.add_header('User-Agent', 'Mozilla/5.0')
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode())
prod = data['data']
print("Product show fields:")
print("base_weight_grams:", prod.get('base_weight_grams'))
print("silver_weight_grams:", prod.get('silver_weight_grams'))
print("making_charge_percent:", prod.get('making_charge_percent'))
print("silver_making_charge_percent:", prod.get('silver_making_charge_percent'))
print("brand_markup_percent:", prod.get('brand_markup_percent'))
print("silver_brand_markup_percent:", prod.get('silver_brand_markup_percent'))
print("other_charges:", prod.get('other_charges'))
print("silver_other_charges:", prod.get('silver_other_charges'))

# Now let's test calculate with these exact fields:
payload = {
    'weight_grams': prod.get('base_weight_grams'),
    'purity': '22KT',
    'purity_fraction': 0.916,
    'metal_type': 'gold',
    'making_charge_flat': 0,
    'making_charge_percent': prod.get('making_charge_percent'),
    'brand_markup_percent': prod.get('brand_markup_percent'),
    'other_charges': prod.get('other_charges') + 1000,
    'wastage_percent': 0
}
print("Testing calculate payload:", payload)

req2 = urllib.request.Request('https://admin.pintaara.com/api/price/calculate',
                              data=json.dumps(payload).encode('utf-8'),
                              headers={'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'},
                              method='POST')
try:
    with urllib.request.urlopen(req2) as res2:
        print("Calculate result:", res2.status, res2.read().decode()[:200])
except urllib.error.HTTPError as e:
    print("Calculate error:", e.code, e.read().decode())
