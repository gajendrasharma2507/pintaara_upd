import os
import paramiko
import json

def run():
    host = '145.79.209.237'
    port = 65002
    user = 'u573062443'
    password = os.environ['SSH_PASSWORD']
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting SSH to {host}:{port}...")
    client.connect(host, port=port, username=user, password=password, timeout=30)
    print("SSH Connected.")

    # 1. Run DB Migration / Add custom_sections column directly if not exists
    print("\nEnsuring custom_sections column in products table...")
    sql_check = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Database\\Schema\\Blueprint;

if (!Schema::hasColumn("products", "custom_sections")) {
    Schema::table("products", function (Blueprint $table) {
        $table->json("custom_sections")->nullable()->after("delivery_return");
    });
    echo "CUSTOM_SECTIONS_COLUMN_ADDED\\n";
} else {
    echo "CUSTOM_SECTIONS_COLUMN_ALREADY_EXISTS\\n";
}
'"""
    stdin, stdout, stderr = client.exec_command(sql_check)
    print("DB Result:", stdout.read().decode('utf-8', errors='replace'))
    err = stderr.read().decode('utf-8', errors='replace')
    if err:
        print("DB Error:", err)

    # 2. Upload backend files via SFTP
    sftp = client.open_sftp()
    files = [
        ("backend/app/Models/Product.php", f"{remote_base}/app/Models/Product.php"),
        ("backend/app/Http/Controllers/Admin/AdminWebController.php", f"{remote_base}/app/Http/Controllers/Admin/AdminWebController.php"),
        ("backend/app/Http/Controllers/Api/Admin/AdminProductApiController.php", f"{remote_base}/app/Http/Controllers/Api/Admin/AdminProductApiController.php"),
        ("backend/app/Http/Controllers/Api/ProductApiController.php", f"{remote_base}/app/Http/Controllers/Api/ProductApiController.php"),
        ("backend/resources/views/admin/products/create.blade.php", f"{remote_base}/resources/views/admin/products/create.blade.php"),
        ("backend/resources/views/admin/products/edit.blade.php", f"{remote_base}/resources/views/admin/products/edit.blade.php"),
        ("backend/database/migrations/2026_11_19_000001_add_custom_sections_to_products_table.php", f"{remote_base}/database/migrations/2026_11_19_000001_add_custom_sections_to_products_table.php"),
    ]

    for local, remote in files:
        print(f"Uploading {local} -> {remote}...")
        sftp.put(local, remote)
        print("  ✓ Uploaded.")

    sftp.close()

    # 3. Clear Laravel view, config & application caches
    print("\nClearing Laravel caches...")
    cmd_clear = f"cd {remote_base} && php artisan view:clear && php artisan config:clear && php artisan cache:clear"
    stdin, stdout, stderr = client.exec_command(cmd_clear)
    print("Cache Clear Output:", stdout.read().decode('utf-8', errors='replace'))

    # 4. Test API response
    print("\nTesting /api/products/PD-PD-CS-002...")
    test_cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\\Http\\Request::create("/api/products/PD-PD-CS-002", "GET");
$response = $app->handle($request);
$data = json_decode($response->getContent(), true);
echo "Status: " . ($data["status"] ?? "error") . "\\n";
echo "Description: " . ($data["data"]["description"] ?? "NULL") . "\\n";
echo "Delivery & Return: " . ($data["data"]["delivery_return"] ?? "NULL") . "\\n";
echo "Custom Sections: " . json_encode($data["data"]["custom_sections"] ?? "NULL") . "\\n";
'"""
    stdin, stdout, stderr = client.exec_command(test_cmd)
    print("API Test Output:\n", stdout.read().decode('utf-8', errors='replace'))

    client.close()
    print("Deploy completed successfully!")

if __name__ == '__main__':
    run()
