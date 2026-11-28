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

$groups = \\App\\Models\\ProductOptionGroup::with("values")->orderBy("sort_order")->get();
foreach ($groups as $g) {
    echo "GROUP id=" . $g->id . " name=" . $g->name . " display=" . $g->display_type . " values=" . $g->values->count() . "\n";
    foreach ($g->values as $v) {
        echo "   v: " . $v->value . " (price_delta=" . $v->price_delta . ")\n";
    }
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
