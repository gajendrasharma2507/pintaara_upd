import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$product = \\App\\Models\\Product::where("design_code", "PD-PD-CS-002")->with(["options.values"])->first();
foreach ($product->options as $o) {
    echo "OPTION: " . $o->name . " (id=" . $o->id . ")\n";
    echo "  Raw values count: " . $o->values->count() . "\n";
    $vals = $o->values;
    echo "  Vals count: " . $vals->count() . "\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
