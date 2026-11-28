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

$p = App\\Models\\Product::where("design_code", "BR-SG-OR-001")->first();
if ($p) {
    echo "Found Product: id={$p->id}, name={$p->name}\\n";
} else {
    echo "Product BR-SG-OR-001 NOT found in products table\\n";
}

$allProducts = App\\Models\\Product::all();
foreach ($allProducts as $ap) {
    echo "Product: id={$ap->id}, code={$ap->design_code}, name={$ap->name}\\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
