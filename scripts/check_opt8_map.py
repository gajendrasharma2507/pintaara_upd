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
$masters = [
    "gems" => \\App\\Models\\GemOption::orderBy("sort_order")->get(),
];
$customizationMasters = \\App\\Models\\CustomizationMaster::with(["values"])->where("is_active", true)->get();
$allMasterValues = $customizationMasters->pluck("values")->flatten();
$valPricesMap = [];

$o = $product->options->firstWhere("id", 8);
$isGem = str_contains(strtolower($o->name), "gem");
$gems = $masters["gems"];
$res = $o->values->values()->map(function ($v) use ($isGem, $gems, $allMasterValues, $valPricesMap) {
    return [
        "id" => $v->id,
        "value" => $v->value,
    ];
});
print_r($res->toArray());
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
