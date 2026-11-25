import os
import paramiko
import sys

# Ensure UTF-8 output
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def run():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.getenv('SSH_PASSWORD', 'Prayosha@2026')
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    print(f"Connecting to {host}:{port} via SSH...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)
    print("SSH Connected.")

    sftp = client.open_sftp()

    # Upload migration & updated files
    files = [
        ("backend/database/migrations/2026_11_18_000001_add_limited_edition_fields_to_products_table.php",
         f"{remote_base}/database/migrations/2026_11_18_000001_add_limited_edition_fields_to_products_table.php"),
        ("backend/app/Models/Product.php",
         f"{remote_base}/app/Models/Product.php"),
        ("backend/app/Http/Controllers/Api/ProductApiController.php",
         f"{remote_base}/app/Http/Controllers/Api/ProductApiController.php"),
        ("backend/app/Http/Controllers/Api/OrderApiController.php",
         f"{remote_base}/app/Http/Controllers/Api/OrderApiController.php"),
        ("backend/app/Http/Controllers/Api/RazorpayApiController.php",
         f"{remote_base}/app/Http/Controllers/Api/RazorpayApiController.php"),
        ("backend/app/Http/Controllers/Admin/AdminWebController.php",
         f"{remote_base}/app/Http/Controllers/Admin/AdminWebController.php"),
        ("backend/app/Http/Controllers/Api/Admin/AdminProductApiController.php",
         f"{remote_base}/app/Http/Controllers/Api/Admin/AdminProductApiController.php"),
        ("backend/resources/views/admin/products/create.blade.php",
         f"{remote_base}/resources/views/admin/products/create.blade.php"),
        ("backend/resources/views/admin/products/edit.blade.php",
         f"{remote_base}/resources/views/admin/products/edit.blade.php"),
    ]

    for local, remote in files:
        if os.path.exists(local):
            print(f"Uploading {local} -> {remote}...")
            sftp.put(local, remote)
            print("  Uploaded.")
        else:
            print(f"  Local file not found: {local}")

    sftp.close()

    # Run artisan migrate and clear cache
    print("\nRunning php artisan migrate on remote server...")
    stdin, stdout, stderr = client.exec_command(f"cd {remote_base} && php artisan migrate --force")
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print("MIGRATE OUTPUT:\n" + out)
    if err:
        print("MIGRATE STDERR:\n" + err)

    print("\nClearing view, config, and route caches on remote server...")
    stdin, stdout, stderr = client.exec_command(f"cd {remote_base} && php artisan view:clear && php artisan config:clear && php artisan route:clear")
    print(stdout.read().decode('utf-8', errors='replace'))

    client.close()
    print("Done!")

if __name__ == '__main__':
    run()
