import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

token = '7418b689f9b4fbf82c9f67588206fecc'
base = 'https://test.sequel247.com'

payload2 = {
    'token': token,
    'location': 'domestic',
    'shipmentType': 'D&J',
    'serviceType': 'valuable',
    'fromStoreCode': 'PINTARA',
    'toAddress': {
        'consignee_name': 'Test Patron',
        'auth_receiver_name': 'Test Patron',
        'auth_receiver_phone': '9876543210',
        'address_line1': '101 Luxury Heights, Alkapuri',
        'address_line2': '',
        'pinCode': '390007',
        'city': 'Vadodara',
        'state': 'Gujarat',
        'country': 'India',
        'contact_number': '9876543210'
    },
    'net_value': '50000',
    'gross_weight': '0.250',
    'net_weight': '0.050',
    'weight_unit': 'kg',
    'no_of_packages': '1',
    'boxes': '1',
    'packages': [
        {
            'box_no': 1,
            'weight': '0.250',
            'length': '12',
            'width': '10',
            'height': '8'
        }
    ],
    'invoice': [
        {
            'invoice_no': 'TEST-INV-001',
            'invoice_date': '2026-11-23',
            'invoice_value': '50000'
        }
    ]
}

url = base + '/api/shipment/create'
data = json.dumps(payload2).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
try:
    res = urllib.request.urlopen(req, context=ctx, timeout=15)
    print("RESPONSE 2:", res.read().decode('utf-8', errors='ignore'))
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR 2 {e.code}:", e.read().decode('utf-8', errors='ignore'))
except Exception as e:
    print("ERROR 2:", e)
