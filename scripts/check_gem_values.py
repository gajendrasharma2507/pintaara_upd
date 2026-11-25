import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();
foreach (\\App\\Models\\ProductOptionGroup::all() as $g) {
    echo "GROUP: {$g->name} ({$g->code})\n";
    foreach ($g->values as $v) {
        echo "  - {$v->value} (code: {$v->code})\n";
    }
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode())
client.close()
