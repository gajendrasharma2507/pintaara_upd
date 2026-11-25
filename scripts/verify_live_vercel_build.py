import urllib.request
import re

req = urllib.request.Request('https://pintaara.com/collection/pd-pd-cs-002', headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print('Page HTML length:', len(html))
        scripts = re.findall(r'src="([^"]+\.js)"', html)
        print('Found scripts count:', len(scripts))
        for s in scripts:
            if 'collection' in s or 'app' in s or 'page' in s or 'chunk' in s:
                # check content of script
                script_url = s if s.startswith('http') else 'https://pintaara.com' + s
                try:
                    s_req = urllib.request.Request(script_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(s_req) as s_resp:
                        code = s_resp.read().decode('utf-8', errors='ignore')
                        if 'isOptionValueCompatible' in code or 'compatMatrix' in code:
                            print(f'Found compatMatrix in {script_url} (len {len(code)})')
                except Exception as ex:
                    pass
except Exception as e:
    print('Error:', e)
