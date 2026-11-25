import urllib.request
import re

def check():
    url = 'https://www.pintaara.com/'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    html = res.read().decode('utf-8')
    print("Homepage HTTP:", res.status)

    pwd_url = 'https://www.pintaara.com/password'
    pwd_res = urllib.request.urlopen(urllib.request.Request(pwd_url, headers={'User-Agent': 'Mozilla/5.0'}))
    print("Password page HTTP:", pwd_res.status)

    # Check api endpoint
    api_url = 'https://admin.pintaara.com/api/products/PD-PD-CS-002'
    api_res = urllib.request.urlopen(urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'}))
    print("API products endpoint HTTP:", api_res.status)

    # Check verify-passcode endpoint
    import json
    post_data = json.dumps({'passcode': 'Pintaara@2026'}).encode('utf-8')
    p_req = urllib.request.Request('https://admin.pintaara.com/api/storefront/verify-passcode', data=post_data, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        p_res = urllib.request.urlopen(p_req)
        print("Passcode test result:", p_res.read().decode('utf-8'))
    except Exception as e:
        print("Passcode test error:", e)

if __name__ == '__main__':
    check()
