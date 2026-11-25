import os
import paramiko

def deploy():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.getenv('SSH_PASSWORD', 'Prayosha@2026')
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {host}:{port}...")
    client.connect(host, port=port, username=user, password=password, timeout=30)
    print("SSH Connected.")

    sftp = client.open_sftp()

    files = [
        ("backend/database/migrations/2026_11_20_000003_add_silver_pricing_fields_to_products_table.php", 
         f"{remote_base}/database/migrations/2026_11_20_000003_add_silver_pricing_fields_to_products_table.php"),
        ("backend/app/Models/Product.php", 
         f"{remote_base}/app/Models/Product.php"),
        ("backend/app/Http/Controllers/Admin/AdminWebController.php", 
         f"{remote_base}/app/Http/Controllers/Admin/AdminWebController.php"),
        ("backend/app/Http/Controllers/Api/ProductApiController.php", 
         f"{remote_base}/app/Http/Controllers/Api/ProductApiController.php"),
        ("backend/resources/views/admin/products/create.blade.php", 
         f"{remote_base}/resources/views/admin/products/create.blade.php"),
        ("backend/resources/views/admin/products/edit.blade.php", 
         f"{remote_base}/resources/views/admin/products/edit.blade.php"),
    ]

    for local, remote in files:
        print(f"Uploading {local} -> {remote}...")
        sftp.put(local, remote)
        print("  ✓ Uploaded.")

    sftp.close()

    print("Running migration on remote host...")
    stdin, stdout, stderr = client.exec_command(f"cd {remote_base} && php artisan migrate --force")
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print("Migrate Output:", out)
    if err:
        print("Migrate Error:", err)

    print("Clearing cache on remote server...")
    stdin, stdout, stderr = client.exec_command(f"cd {remote_base} && php artisan view:clear && php artisan cache:clear")
    out = stdout.read().decode('utf-8', errors='replace')
    print("Cache Output:", out)

    client.close()
    print("Silver pricing deployment finished successfully!")

if __name__ == '__main__':
    deploy()
