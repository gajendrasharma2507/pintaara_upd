import requests
import re

session = requests.Session()
login_url = "https://admin.pintaara.com/admin/login"
resp = session.get(login_url)

csrf_match = re.search(r'name="_token"\s+value="([^"]+)"', resp.text)
token = csrf_match.group(1) if csrf_match else session.cookies.get('XSRF-TOKEN')

session.post(login_url, data={
    '_token': token,
    'email': 'admin@pintaara.com',
    'password': 'Pintaara@2026',
})

routes = [
    "/admin",
    "/admin/design-logs",
    "/admin/products",
    "/admin/collections",
    "/admin/orders",
    "/admin/gold-rates",
    "/admin/settings",
    "/admin/customers",
    "/admin/masters",
]

for r in routes:
    url = f"https://admin.pintaara.com{r}"
    res = session.get(url)
    print(f"GET {r} -> HTTP {res.status_code}")
