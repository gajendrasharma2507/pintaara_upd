import os
import paramiko, json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

php_script = """
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$prod = \\App\\Models\\Product::where("design_code", "PD-PD-CS-002")->with(["options.values", "variants.optionValues.option", "productFinishPurities.finish", "productFinishPurities.purity"])->first();
echo "Product: " . $prod->name . "\\n";
echo "OPTIONS:\\n";
foreach ($prod->options as $opt) {
    echo "  Option " . $opt->name . " (id=" . $opt->id . "):\\n";
    foreach ($opt->values as $val) {
        echo "    Val: " . $val->value . " (code=" . $val->code . ", img=" . $val->image . ")\\n";
    }
}
echo "FINISH PURITIES:\\n";
foreach ($prod->productFinishPurities as $pfp) {
    echo "  PFP: finish=" . ($pfp->finish->name ?? "") . ", purity=" . ($pfp->purity->name ?? "") . "\\n";
}
"""

cmd = f"cd /home/u573062443/domains/admin.pintaara.com && php -r '{php_script}'"
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
