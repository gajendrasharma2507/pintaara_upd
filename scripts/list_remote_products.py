import os
import paramiko

def check_products():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.getenv('SSH_PASSWORD', 'Prayosha@2026')
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)

    php_script = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

echo "=== PRODUCTS LIST ===\\n";
$prods = DB::table('products')->select('id', 'name', 'design_code', 'collection_master_id', 'status')->get();
foreach ($prods as $p) {
    echo "ID: {$p->id} | Code: [{$p->design_code}] | Name: [{$p->name}] | Col: {$p->collection_master_id} | Status: [{$p->status}]\\n";
}
"""

    remote_file = f"{remote_base}/list_all_prods.php"
    sftp = client.open_sftp()
    with sftp.open(remote_file, 'w') as f:
        f.write(php_script)
    sftp.close()

    stdin, stdout, stderr = client.exec_command(f"php {remote_file} && rm {remote_file}")
    print(stdout.read().decode('utf-8', errors='replace'))
    client.close()

if __name__ == '__main__':
    check_products()
