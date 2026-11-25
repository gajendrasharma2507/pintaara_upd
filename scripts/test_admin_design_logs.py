import requests
import re

session = requests.Session()
login_url = "https://admin.pintaara.com/admin/login"
resp = session.get(login_url)

csrf_match = re.search(r'name="_token"\s+value="([^"]+)"', resp.text)
if not csrf_match:
    csrf_match = re.search(r'meta name="csrf-token" content="([^"]+)"', resp.text)

token = csrf_match.group(1) if csrf_match else session.cookies.get('XSRF-TOKEN')

# Log in
login_data = {
    '_token': token,
    'email': 'admin@pintaara.com',
    'password': 'Pintaara@2026',
}
resp_post = session.post(login_url, data=login_data, allow_redirects=True)
print("Login status:", resp_post.status_code)

# Now request /admin/design-logs
dl_url = "https://admin.pintaara.com/admin/design-logs"
dl_resp = session.get(dl_url)
print("GET /admin/design-logs status:", dl_resp.status_code)
if dl_resp.status_code == 200:
    print("Page title/first 300 chars:", dl_resp.text[:300])
    if "Design Specifications" in dl_resp.text or "design-logs" in dl_resp.text or "BR-SG-OR-001" in dl_resp.text:
        print(">>> SUCCESS: /admin/design-logs LOADED BEAUTIFULLY WITH HTTP 200! <<<")
else:
    print("Failed with status:", dl_resp.status_code)
    print("Body snippet:", dl_resp.text[:500])
