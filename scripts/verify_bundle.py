import urllib.request
import re

url = 'https://www.pintaara.com/collection/PD-PD-CS-002'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

scripts = re.findall(r'src="(/_next/[^"]+\.js)"', html)
print(f"Total Next.js script bundles: {len(scripts)}")

found_sections = False
found_desc = False
for s in scripts:
    s_url = 'https://www.pintaara.com' + s
    content = urllib.request.urlopen(urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')
    if 'atelier-info-sections' in content:
        found_sections = True
    if 'DELIVERY & RETURN' in content or 'DELIVERY &amp; RETURN' in content:
        found_desc = True

print(f"Found 'atelier-info-sections' in JS bundle: {found_sections}")
print(f"Found 'DELIVERY & RETURN' in JS bundle: {found_desc}")
