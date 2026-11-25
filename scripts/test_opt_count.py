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

$designCode = "PD-PD-CS-002";
$product = \\App\\Models\\Product::whereRaw("UPPER(design_code) = UPPER(?)", [$designCode])
    ->orWhere("id", is_numeric($designCode) ? (int)$designCode : 0)
    ->with([
        "collectionMaster",
        "images",
        "options.values",
        "optionAssignments",
        "variants.optionValues.option",
        "designLog",
        "productFinishPurities.finish",
        "productFinishPurities.purity",
    ])
    ->firstOrFail();

foreach ($product->options as $o) {
    echo "Option: id=" . $o->id . " name=" . $o->name . " count=" . $o->values->count() . "\n";
    foreach ($o->values as $v) {
        echo "   -> " . $v->value . "\n";
    }
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
