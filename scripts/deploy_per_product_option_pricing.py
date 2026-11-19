import os
import paramiko

def deploy():
    files_to_upload = [
        ('backend/app/Models/ProductOptionAssignment.php', '/home/u573062443/domains/admin.pintaara.com/app/Models/ProductOptionAssignment.php'),
        ('backend/app/Models/Product.php', '/home/u573062443/domains/admin.pintaara.com/app/Models/Product.php'),
        ('backend/app/Http/Controllers/Admin/AdminWebController.php', '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Admin/AdminWebController.php'),
        ('backend/app/Http/Controllers/Api/ProductApiController.php', '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Api/ProductApiController.php'),
        ('backend/resources/views/admin/products/edit.blade.php', '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/products/edit.blade.php'),
        ('backend/resources/views/admin/products/create.blade.php', '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/products/create.blade.php'),
        ('backend/database/migrations/2026_11_20_000001_add_value_prices_to_product_option_assignments.php', '/home/u573062443/domains/admin.pintaara.com/database/migrations/2026_11_20_000001_add_value_prices_to_product_option_assignments.php'),
    ]

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to Hostinger VPS...")
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=30)

    sftp = client.open_sftp()
    for local_path, remote_path in files_to_upload:
        print(f"Uploading {local_path} -> {remote_path}...")
        sftp.put(local_path, remote_path)
    sftp.close()

    print("Running migrations and clearing view & cache...")
    cmd = 'cd /home/u573062443/domains/admin.pintaara.com && php artisan migrate --force && php artisan view:clear && php artisan cache:clear'
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Artisan output:\n" + stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("Artisan stderr:\n" + err)

    print("Verifying admin edit view...")
    test_cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$user = App\\Models\\User::first();
auth()->login($user);
$request = Illuminate\\Http\\Request::create("/admin/products/2/edit", "GET");
$request->setUserResolver(fn() => $user);
$response = $app->handle($request);
echo "HTTP Status: " . $response->getStatusCode() . "\\n";
$content = $response->getContent();
echo "Has opt-val-price: " . (strpos($content, "opt-val-price-") !== false ? "YES" : "NO") . "\\n";
echo "Has Product Options & Variants: " . (strpos($content, "Product Options &amp; Variants") !== false ? "YES" : "NO") . "\\n";
'"""
    stdin, stdout, stderr = client.exec_command(test_cmd)
    print("VERIFICATION OUTPUT:\n" + stdout.read().decode())
    print("VERIFICATION ERRORS:\n" + stderr.read().decode())

    client.close()

if __name__ == '__main__':
    deploy()
