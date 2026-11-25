import os
import paramiko

def check_p33():
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

echo "=== ALL PRODUCTS IN DB ===\\n";
$all = App\\Models\\Product::with(['options', 'optionAssignments.group'])->get();
foreach ($all as $p) {
    echo "Product ID {$p->id} ({$p->design_code}):\\n";
    echo "  Assignments (" . $p->optionAssignments->count() . "):\\n";
    foreach ($p->optionAssignments as $a) {
        echo "    - Group ID {$a->group_id} (" . ($a->group->name ?? 'None') . ")\\n";
    }
    echo "  Legacy Options (" . $p->options->count() . "):\\n";
    foreach ($p->options as $o) {
        echo "    - Option ID {$o->id} ({$o->name})\\n";
    }
}
"""

    remote_file = f"{remote_base}/check_all_p.php"
    sftp = client.open_sftp()
    with sftp.open(remote_file, 'w') as f:
        f.write(php_script)
    sftp.close()

    stdin, stdout, stderr = client.exec_command(f"php {remote_file} && rm {remote_file}")
    print(stdout.read().decode('utf-8', errors='replace'))
    client.close()

if __name__ == '__main__':
    check_p33()
