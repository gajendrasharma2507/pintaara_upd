import os
import paramiko
import urllib.request
import json

def clean_and_deploy():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.environ['SSH_PASSWORD']
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)
    sftp = client.open_sftp()

    files = [
        ("backend/app/Http/Controllers/Api/ProductApiController.php", 
         f"{remote_base}/app/Http/Controllers/Api/ProductApiController.php"),
        ("backend/app/Http/Controllers/Admin/AdminWebController.php", 
         f"{remote_base}/app/Http/Controllers/Admin/AdminWebController.php"),
    ]

    for local, remote in files:
        print(f"Uploading {local} -> {remote}...")
        sftp.put(local, remote)

    # Clean legacy product_options from DB
    cleanup_script = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$delValues = DB::table('product_option_values')->whereIn('product_option_id', [5,6,7,8])->delete();
$delOpts = DB::table('product_options')->where('product_id', 2)->delete();
echo "Deleted {$delOpts} legacy options and {$delValues} legacy option values.\\n";
"""
    remote_cleanup = f"{remote_base}/cleanup_legacy.php"
    with sftp.open(remote_cleanup, 'w') as f:
        f.write(cleanup_script)
    sftp.close()

    print("Running DB cleanup and clearing caches...")
    stdin, stdout, stderr = client.exec_command(f"php {remote_cleanup} && rm {remote_cleanup} && cd {remote_base} && php artisan route:clear && php artisan cache:clear")
    out = stdout.read().decode('utf-8', errors='replace')
    print("Cleanup & Artisan Output:\n", out)
    client.close()

    print("\nTesting GET https://admin.pintaara.com/api/products/PD-PD-CS-002 ...")
    req = urllib.request.Request(
        'https://admin.pintaara.com/api/products/PD-PD-CS-002',
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        data = json.loads(res.read().decode('utf-8'))
        print("API Status:", data.get('status'))
        prod = data.get('data', {})
        options = prod.get('options', [])
        print("Product ID:", prod.get('id'))
        print("Product Name:", prod.get('name'))
        print("Options Count:", len(options))
        print("Options:", [o.get('name') for o in options])
        print("Base Price Total:", prod.get('base_pricing', {}).get('total_price'))

if __name__ == '__main__':
    clean_and_deploy()
