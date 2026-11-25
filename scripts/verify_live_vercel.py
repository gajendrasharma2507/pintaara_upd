import urllib.request
import re

url = "https://pintaara.com/collection/pd-pd-cs-002"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

scripts = re.findall(r'src="(/_next/static/chunks/[^"]+)"', html)
print(f"Total script chunks found: {len(scripts)}")

found_compat = False
for s in scripts:
    js_url = "https://pintaara.com" + s
    try:
        js = urllib.request.urlopen(urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')
        if 'COMPATIBILITY MASTER' in js or 'isOptionValueCompatible' in js or 'isFinishCompatible' in js:
            print(f"Matched live feature in chunk: {s}")
            found_compat = True
            break
    except Exception as e:
        pass

print(f"Live Vercel verification result: {found_compat}")
