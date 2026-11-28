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

$product = \\App\\Models\\Product::whereRaw("UPPER(design_code) = UPPER(?)", ["PD-PD-CS-002"])
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

$masters = [
    "purities" => \\App\\Models\\MetalPurity::where("is_active", true)->orderBy("sort_order")->get(),
    "finishes" => \\App\\Models\\FinishOption::orderBy("sort_order")->get(),
    "gems" => \\App\\Models\\GemOption::orderBy("sort_order")->get(),
];

$customizationMasters = \\App\\Models\\CustomizationMaster::with(["values" => function($q) {
    $q->where("is_active", true)->orderBy("sort_order");
}])->where("is_active", true)->orderBy("sort_order")->get();

$allMasterValues = $customizationMasters->pluck("values")->flatten();
$valPricesMap = [];

$o = $product->options->firstWhere("id", 8);
echo "o values count: " . $o->values->count() . "\n";

$isPurity = str_contains(strtolower($o->name), "purity") || str_contains(strtolower($o->name), "metal") || str_contains(strtolower($o->name), "karat");
$isFinish = str_contains(strtolower($o->name), "finish") || str_contains(strtolower($o->name), "tone") || strtoupper($o->name) === "FINISH";
$isGem = str_contains(strtolower($o->name), "gem") || str_contains(strtolower($o->name), "stone");
$gems = $masters["gems"] ?? collect();

$vals = $o->values;
echo "vals count before: " . $vals->count() . "\n";

$res = $vals->values()->map(function ($v) use ($isGem, $gems, $allMasterValues, $valPricesMap) {
    echo "mapping v: " . $v->value . "\n";
    return [
        "id" => $v->id,
        "value" => $v->value,
    ];
});
echo "res count: " . $res->count() . "\n";
print_r($res->toArray());
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
