import os
import paramiko
import requests

def run():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.environ['SSH_PASSWORD']
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {host}:{port}...")
    client.connect(host, port=port, username=user, password=password, timeout=30)
    print("SSH Connected.")

    sftp = client.open_sftp()

    # Upload updated files
    files = [
        (r"backend/bootstrap/app.php", f"{remote_base}/bootstrap/app.php"),
        (r"backend/app/Http/Controllers/Admin/AdminWebController.php", f"{remote_base}/app/Http/Controllers/Admin/AdminWebController.php"),
        (r"backend/config/view.php", f"{remote_base}/config/view.php"),
    ]

    for local, remote in files:
        print(f"Uploading {local} -> {remote}...")
        sftp.put(local, remote)
        print("Uploaded.")

    sftp.close()

    # Server-side setup commands
    commands = [
        # 1. Ensure public_html directories exist and copy uploaded images from public to public_html
        f"mkdir -p {remote_base}/public_html/images/uploads",
        f"mkdir -p {remote_base}/public_html/images/products",
        f"mkdir -p {remote_base}/public_html/images/collections",
        f"mkdir -p {remote_base}/public_html/images/design-log",
        f"cp -rf {remote_base}/public/images/uploads/* {remote_base}/public_html/images/uploads/ || true",
        f"chmod -R 777 {remote_base}/public_html/images",
        f"chmod -R 777 {remote_base}/public/images || true",

        # 2. Fix storage directory permissions and framework subdirectories
        f"mkdir -p {remote_base}/storage/framework/views",
        f"mkdir -p {remote_base}/storage/framework/cache/data",
        f"mkdir -p {remote_base}/storage/framework/sessions",
        f"mkdir -p {remote_base}/storage/logs",
        f"mkdir -p {remote_base}/storage/app/public/id_proofs",
        f"mkdir -p {remote_base}/storage/app/public/products/images",
        f"mkdir -p {remote_base}/storage/app/public/collections",
        f"mkdir -p {remote_base}/storage/app/public/masters/gems",
        f"chmod -R 777 {remote_base}/storage",
        f"chmod -R 777 {remote_base}/bootstrap/cache",

        # 3. Fix storage symlink in public_html
        # If public_html/storage is a real directory, copy any files out and remove it
        f"if [ -d {remote_base}/public_html/storage ] && [ ! -L {remote_base}/public_html/storage ]; then cp -rn {remote_base}/public_html/storage/app/public/* {remote_base}/storage/app/public/ 2>/dev/null || true; rm -rf {remote_base}/public_html/storage; fi",
        f"ln -sfn {remote_base}/storage/app/public {remote_base}/public_html/storage",
        f"ls -ld {remote_base}/public_html/storage",

        # 4. Update .htaccess in public_html to ensure CORS for fonts/images/storage
        """cat << 'EOF' > /home/u573062443/domains/admin.pintaara.com/public_html/.htaccess
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE"
    Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-TOKEN"
</IfModule>
EOF
""",

        # 5. Clear caches
        f"cd {remote_base} && php artisan config:clear && php artisan view:clear && php artisan cache:clear",
        f"cd {remote_base} && php -r \"require 'vendor/autoload.php'; \\$app = require_once 'bootstrap/app.php'; echo 'Active public_path: ' . public_path() . PHP_EOL;\"",
    ]

    for cmd in commands:
        print(f"\n--- Executing: {cmd[:60]}... ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        if out:
            print(out.strip())
        if err:
            print("STDERR:", err.strip())

    client.close()
    print("\n--- Testing HTTP access to user uploaded images ---")
    test_urls = [
        "https://admin.pintaara.com/images/uploads/atelier_collection_6afb08d5f4154.jpg",
        "https://admin.pintaara.com/images/uploads/atelier_collection_6afb0a64c365e.jpg",
        "https://admin.pintaara.com/admin/login",
    ]
    for url in test_urls:
        try:
            r = requests.get(url, timeout=10)
            print(f"GET {url} -> HTTP {r.status_code} ({len(r.content)} bytes)")
        except Exception as e:
            print(f"GET {url} -> ERROR: {e}")

if __name__ == '__main__':
    run()
