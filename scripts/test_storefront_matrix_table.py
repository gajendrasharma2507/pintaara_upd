import urllib.request
import json

req = urllib.request.Request('https://admin.pintaara.com/api/products/pd-pd-cs-002', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())['data']

matrix = data.get('compatibility_matrix', {})
purities = ['22KT', '18KT', '14KT', '925 SILVER']

header_title = "COMPATIBILITY MASTER TABLE"
print(f"{'ROW':35} | {'22KT':6} | {'18KT':6} | {'14KT':6} | {'925 SILVER':10}")
print('-' * 75)

# 1. Finishes
finishes = [
    {'name': 'Yellow Gold', 'key': 'YG'},
    {'name': 'White Gold', 'key': 'WG'},
    {'name': 'Rose Gold', 'key': 'RG'},
    {'name': 'Black Gold', 'key': 'BLK'}
]
for f in finishes:
    cols = []
    for p in purities:
        pData = matrix.get(p, {})
        is_compat = f['key'] in pData.get('finishes', [])
        cols.append('✓' if is_compat else '—')
    print(f"{f['name']:35} | {cols[0]:6} | {cols[1]:6} | {cols[2]:6} | {cols[3]:10}")

# 2. Option groups
for opt in data.get('options', []):
    print(f"--- {opt['name'].upper()} ---")
    grp_id = str(opt['id'])
    grp_name = opt['name']
    for v in opt['values']:
        val_id = str(v['id'])
        vname = v['value']
        cols = []
        for p in purities:
            pData = matrix.get(p, {})
            allowed_ids = [str(x) for x in pData.get('options', {}).get(grp_id, [])]
            allowed_names = [str(x).strip().lower() for x in pData.get('options_by_name', {}).get(grp_name, [])]
            is_compat = (val_id in allowed_ids) or (vname.strip().lower() in allowed_names)
            cols.append('✓' if is_compat else '—')
        print(f"{vname:35} | {cols[0]:6} | {cols[1]:6} | {cols[2]:6} | {cols[3]:10}")
