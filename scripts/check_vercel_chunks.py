import urllib.request
import re
import time

for attempt in range(6):
    url = 'https://pintaara.com/collection/pd-pd-cs-002?t=' + str(int(time.time()))
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache'})
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    
    chunks = re.findall(r'"(/_next/static/chunks/[^"]+\.js)"', html)
    print(f"Attempt {attempt+1}: found {len(chunks)} chunks in HTML")
    
    found = False
    for c in set(chunks):
        c_url = 'https://pintaara.com' + c
        try:
            txt = urllib.request.urlopen(urllib.request.Request(c_url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')
            if 'COMPATIBILITY MASTER' in txt:
                print(f"SUCCESS: Found COMPATIBILITY MASTER in {c}!")
                found = True
                break
        except Exception:
            pass
            
    if found:
        print("Vercel deployment is LIVE with Compatibility Master!")
        break
    else:
        print("Vercel build still propagating, waiting 15s...")
        time.sleep(15)
