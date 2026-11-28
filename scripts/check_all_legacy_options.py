import os
import paramiko

def check_legacy_options():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.environ['SSH_PASSWORD']
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)

    php_script = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

echo "=== ALL PRODUCT_OPTIONS ROWS ===\\n";
$rows = DB::table('product_options')->get();
foreach ($rows as $r) {
    echo "ID: {$r->id}, Product ID: {$r->product_id}, Name: {$r->name}\\n";
}
"""

    remote_file = f"{remote_base}/check_all_legacy_opts.php"
    sftp = client.open_sftp()
    with sftp.open(remote_file, 'w') as f:
        f.write(php_script)
    sftp.close()

    stdin, stdout, stderr = client.exec_command(f"php {remote_file} && rm {remote_file}")
    print(stdout.read().decode('utf-8', errors='replace'))
    client.close()

if __name__ == '__main__':
    check_legacy_options()
