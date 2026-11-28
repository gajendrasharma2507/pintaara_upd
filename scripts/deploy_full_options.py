import paramiko
import os

def deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)
    sftp = client.open_sftp()
    
    remote_base = '/home/u573062443/domains/admin.pintaara.com'
    
    files = [
        ('backend/app/Models/ProductOptionGroup.php', f'{remote_base}/app/Models/ProductOptionGroup.php'),
        ('backend/app/Models/ProductOptionValue.php', f'{remote_base}/app/Models/ProductOptionValue.php'),
        ('backend/app/Models/ProductOptionAssignment.php', f'{remote_base}/app/Models/ProductOptionAssignment.php'),
        ('backend/app/Models/ProductVariant.php', f'{remote_base}/app/Models/ProductVariant.php'),
        ('backend/app/Models/Product.php', f'{remote_base}/app/Models/Product.php'),
        ('backend/app/Http/Controllers/Admin/AdminOptionController.php', f'{remote_base}/app/Http/Controllers/Admin/AdminOptionController.php'),
        ('backend/app/Http/Controllers/Admin/AdminWebController.php', f'{remote_base}/app/Http/Controllers/Admin/AdminWebController.php'),
        ('backend/routes/web.php', f'{remote_base}/routes/web.php'),
        ('backend/resources/views/layouts/admin.blade.php', f'{remote_base}/resources/views/layouts/admin.blade.php'),
        ('backend/resources/views/admin/product-options/index.blade.php', f'{remote_base}/resources/views/admin/product-options/index.blade.php'),
        ('backend/resources/views/admin/products/edit.blade.php', f'{remote_base}/resources/views/admin/products/edit.blade.php'),
        ('backend/resources/views/admin/products/create.blade.php', f'{remote_base}/resources/views/admin/products/create.blade.php'),
    ]
    
    # Ensure remote directory for product-options views exists
    try:
        sftp.mkdir(f'{remote_base}/resources/views/admin/product-options')
    except:
        pass

    for local_path, remote_path in files:
        print(f"Uploading {local_path} -> {remote_path}...")
        sftp.put(local_path, remote_path)
    
    print("Files uploaded. Clearing caches on VPS...")
    cmd = f'cd {remote_base} && php artisan view:clear && php artisan config:clear && php artisan route:clear && php artisan cache:clear'
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Cache clear output:\n", stdout.read().decode())
    
    # Verify Tinker can instantiate and query ProductOptionGroup
    cmd_verify = '''cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make("Illuminate\\\\Contracts\\\\Console\\\\Kernel")->bootstrap();

$groups = \\\\App\\\\Models\\\\ProductOptionGroup::with("values")->get();
echo "SUCCESS: ProductOptionGroup loaded. Count = " . $groups->count() . "\\n";
foreach ($groups as $g) {
    echo "  -> " . $g->name . " [" . $g->code . "] (" . $g->display_type . ") with " . $g->values->count() . " values\\n";
}
'
'''
    stdin, stdout, stderr = client.exec_command(cmd_verify)
    print("Verification Output:\n", stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("Verification Errors:\n", err)

    sftp.close()
    client.close()

if __name__ == '__main__':
    deploy()
