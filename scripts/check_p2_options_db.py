import os
import paramiko

def inspect():
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

echo "=== PRODUCT 2 (PD-PD-CS-002) ===\\n";
$p = App\\Models\\Product::with(['options.values', 'optionAssignments.group.values'])->find(2);

echo "Assignments count: " . $p->optionAssignments->count() . "\\n";
foreach ($p->optionAssignments as $a) {
    echo "  Assignment: ID {$a->id}, Group ID {$a->customization_option_group_id}, Group Name: " . ($a->group->name ?? 'NULL') . "\\n";
}

echo "Legacy Options count: " . $p->options->count() . "\\n";
foreach ($p->options as $o) {
    echo "  Legacy Option: ID {$o->id}, Name: {$o->name}, Values count: " . $o->values->count() . "\\n";
}
"""

    remote_file = f"{remote_base}/check_p2_details.php"
    sftp = client.open_sftp()
    with sftp.open(remote_file, 'w') as f:
        f.write(php_script)
    sftp.close()

    stdin, stdout, stderr = client.exec_command(f"php {remote_file} && rm {remote_file}")
    print(stdout.read().decode('utf-8', errors='replace'))
    client.close()

if __name__ == '__main__':
    inspect()
