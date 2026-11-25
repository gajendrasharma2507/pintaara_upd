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
    ->with(["options.values"])
    ->firstOrFail();

$masters = ["gems" => \\App\\Models\\GemOption::orderBy("sort_order")->get()];
$allMasterValues = collect();
$valPricesMap = [];

$mappedOptions = $product->options->map(function ($o) use ($masters, $allMasterValues, $product, $valPricesMap) {
    echo "Processing option " . $o->id . ": " . $o->name . "\n";
    $vals = $o->values;
    echo "  vals count: " . $vals->count() . "\n";
    $retValues = $vals->values()->map(function ($v) {
        echo "    val: " . $v->value . "\n";
        return ["id" => $v->id, "value" => $v->value];
    });
    echo "  retValues count: " . $retValues->count() . "\n";
    return [
        "id" => $o->id,
        "name" => $o->name,
        "values" => $retValues,
    ];
});
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
