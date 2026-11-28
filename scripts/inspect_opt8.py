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

$p = \\App\\Models\\Product::where("design_code", "PD-PD-CS-002")->first();
$opt8 = $p->options()->where("id", 8)->first();
echo "OPT 8 VALUES COUNT: " . ($opt8 ? $opt8->values->count() : "NULL") . "\n";
if ($opt8) {
    print_r($opt8->values->toArray());
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
