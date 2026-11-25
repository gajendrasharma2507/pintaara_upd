import requests
import re
import os

session = requests.Session()
login_url = "https://admin.pintaara.com/admin/login"
resp = session.get(login_url)
print("GET Login status:", resp.status_code)

csrf_match = re.search(r'name="_token"\s+value="([^"]+)"', resp.text)
if not csrf_match:
    csrf_match = re.search(r'meta name="csrf-token" content="([^"]+)"', resp.text)

if csrf_match:
    token = csrf_match.group(1)
    print("Found CSRF token:", token[:15] + "...")
else:
    print("No CSRF token found in HTML")
    token = session.cookies.get('XSRF-TOKEN')

# Attempt admin login
login_data = {
    '_token': token,
    'email': 'admin@pintaara.com',
    'password': 'Pintaara@2026',
}
resp_post = session.post(login_url, data=login_data, allow_redirects=True)
print("Login post status:", resp_post.status_code)
print("Final URL after login:", resp_post.url)

# Test uploading a new image to /admin/upload-image
upload_url = "https://admin.pintaara.com/admin/upload-image"
csrf_in_dash = re.search(r'meta name="csrf-token" content="([^"]+)"', resp_post.text)
dash_token = csrf_in_dash.group(1) if csrf_in_dash else token

# Create a small dummy png (1x1 pixel)
png_1x1 = (
    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06'
    b'\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe'
    b'\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82'
)

files = {
    'image': ('test_upload_probe.png', png_1x1, 'image/png'),
}
headers = {
    'X-CSRF-TOKEN': dash_token,
    'Accept': 'application/json',
}
data = {
    'folder': 'test_probe'
}

up_resp = session.post(upload_url, files=files, data=data, headers=headers)
print("Upload response status:", up_resp.status_code)
print("Upload response text:", up_resp.text)

if up_resp.status_code == 200:
    res_json = up_resp.json()
    img_url = "https://admin.pintaara.com" + res_json.get('url')
    print("Verifying uploaded image URL at:", img_url)
    get_img = requests.get(img_url)
    print("Image access status:", get_img.status_code, "Size:", len(get_img.content))
    if get_img.status_code == 200:
        print(">>> SUCCESS: IMAGE UPLOAD AND SERVING VERIFIED 100% OPERATIONAL! <<<")
else:
    print(">>> UPLOAD FAILED <<<")
