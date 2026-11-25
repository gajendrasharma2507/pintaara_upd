import urllib.request
import re

url = 'https://pintaara.com/collection/pd-pd-cs-002'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
chunks = re.findall(r'src="(/_next/static/chunks/[^"]+\.js)"', html)
for c in chunks:
    print(c)
