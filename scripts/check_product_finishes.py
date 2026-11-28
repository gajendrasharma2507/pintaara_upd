import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

php_script = """
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$products = \\App\\Models\\Product::with("images")->get();
foreach ($products as $p) {
    $grouped = $p->images->groupBy("finish_key");
    if ($p->images->count() > 2 || count($grouped) > 1) {
        echo "Product ID: " . $p->id . " Code: " . $p->design_code . " Name: " . $p->name . " Total images: " . $p->images->count() . "\\n";
        foreach ($grouped as $k => $imgs) {
            echo "  Finish " . ($k ?: "NULL") . ": " . count($imgs) . " images\\n";
        }
    }
}
"""

cmd = f"cd /home/u573062443/domains/admin.pintaara.com && php -r '{php_script}'"
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
