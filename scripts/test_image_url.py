import urllib.request

url = 'https://admin.pintaara.com/images/uploads/atelier_products_6afd41faba665.png'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('HTTP Status:', resp.status)
        print('Content Length:', len(resp.read()))
except Exception as e:
    print('Error:', e)
