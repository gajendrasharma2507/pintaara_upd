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

$product = \\App\\Models\\Product::where("design_code", "PD-PD-CS-002")->with(["options.values"])->first();
$opt8 = $product->options->firstWhere("id", 8);
echo "OPT8 values count: " . $opt8->values->count() . "\n";

$isGem = str_contains(strtolower($opt8->name), "gem");
echo "isGem: " . ($isGem ? "YES" : "NO") . "\n";
echo "Vals count before map: " . count($opt8->values) . "\n";

foreach ($opt8->values as $v) {
    echo "VAL: " . $v->value . "\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
