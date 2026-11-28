import os
import paramiko
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def run():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.environ['SSH_PASSWORD']
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    print(f"Connecting to {host}:{port} via SSH...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)
    print("SSH Connected.")

    sftp = client.open_sftp()

    files = [
        ("backend/database/migrations/2026_11_18_000002_add_finish_key_to_product_images_table.php",
         f"{remote_base}/database/migrations/2026_11_18_000002_add_finish_key_to_product_images_table.php"),
        ("backend/database/migrations/2026_11_18_000003_add_available_finishes_to_products_table.php",
         f"{remote_base}/database/migrations/2026_11_18_000003_add_available_finishes_to_products_table.php"),
        ("backend/app/Models/ProductImage.php",
         f"{remote_base}/app/Models/ProductImage.php"),
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
        if os.path.exists(local):
            print(f"Uploading {local} -> {remote}...")
            sftp.put(local, remote)
            print("  Uploaded.")
        else:
            print(f"  Local file not found: {local}")

    sftp.close()

    # Run artisan migrate and clear cache
    print("\nRunning php artisan migrate --force...")
    stdin, stdout, stderr = client.exec_command(f"cd {remote_base} && php artisan migrate --force")
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print("MIGRATE OUTPUT:\n", out)
    if err:
        print("MIGRATE ERROR:\n", err)

    print("\nUpdating existing product images with finish_key null or default to YG...")
    update_cmd = f"cd {remote_base} && php -r 'require \"vendor/autoload.php\"; $app = require_once \"bootstrap/app.php\"; $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class); $kernel->bootstrap(); \\Illuminate\\Support\\Facades\\DB::table(\"product_images\")->whereNull(\"finish_key\")->orWhere(\"finish_key\", \"default\")->update([\"finish_key\" => \"YG\", \"finish_id\" => 1]); echo \"Updated.\n\";'"
    stdin, stdout, stderr = client.exec_command(update_cmd)
    print(stdout.read().decode('utf-8', errors='replace'))

    print("\nClearing view and application cache...")
    stdin, stdout, stderr = client.exec_command(f"cd {remote_base} && php artisan view:clear && php artisan cache:clear && php artisan config:clear")
    print(stdout.read().decode('utf-8', errors='replace'))

    print("\nChecking product_images table columns...")
    check_cmd = f"cd {remote_base} && php -r 'require \"vendor/autoload.php\"; $app = require_once \"bootstrap/app.php\"; $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class); $kernel->bootstrap(); print_r(\\Illuminate\\Support\\Facades\\Schema::getColumnListing(\"product_images\"));'"
    stdin, stdout, stderr = client.exec_command(check_cmd)
    print(stdout.read().decode('utf-8', errors='replace'))

    client.close()
    print("Deployment completed successfully.")

if __name__ == '__main__':
    run()
