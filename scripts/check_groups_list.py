import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

foreach (\\App\\Models\\ProductOptionGroup::with("values")->get() as $g) {
    echo "GROUP id={$g->id} name={$g->name} code={$g->code} display_type={$g->display_type} values_count=" . $g->values->count() . "\n";
    foreach ($g->values as $v) {
        echo "   -> val id={$v->id} value={$v->value} code={$v->code}\n";
    }
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
