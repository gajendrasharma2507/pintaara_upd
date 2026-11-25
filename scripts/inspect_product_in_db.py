import os
import paramiko

def check_db():
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

echo "=== COLLECTIONS ===\\n";
$cols = DB::table('collections_master')->get();
foreach ($cols as $c) {
    echo "ID: {$c->id}, Name: {$c->name}, Slug: {$c->slug}\\n";
}

echo "\\n=== PRODUCT PD-PD-CS-002 ===\\n";
$p = DB::table('products')->where('design_code', 'LIKE', '%PD-PD-CS-002%')->orWhere('slug', 'LIKE', '%PD-PD-CS-002%')->first();
if ($p) {
    echo "Product ID: {$p->id}, Name: {$p->name}, Design Code: {$p->design_code}, Slug: {$p->slug}, Status: {$p->status}, Col ID: {$p->collection_master_id}\\n";
} else {
    echo "Product PD-PD-CS-002 NOT FOUND by design_code or slug.\\n";
    $any = DB::table('products')->where('design_code', 'LIKE', '%CS-002%')->orWhere('name', 'LIKE', '%002%')->get();
    foreach ($any as $a) {
        echo "Found similar: ID: {$a->id}, Code: {$a->design_code}, Name: {$a->name}, Slug: {$a->slug}, Status: {$a->status}\\n";
    }
}
"""

    remote_file = f"{remote_base}/inspect_p.php"
    sftp = client.open_sftp()
    with sftp.open(remote_file, 'w') as f:
        f.write(php_script)
    sftp.close()

    stdin, stdout, stderr = client.exec_command(f"php {remote_file} && rm {remote_file}")
    print(stdout.read().decode('utf-8', errors='replace'))
    client.close()

if __name__ == '__main__':
    check_db()
