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
$isGem = str_contains(strtolower($o->name), "gem") || str_contains(strtolower($o->name), "stone");
$gems = $masters["gems"] ?? collect();
$vals = $o->values;

$mapped = $vals->values()->map(function ($v) use ($isGem, $gems, $allMasterValues, $valPricesMap) {
    $delta = (float) ($v->price_delta ?? 0);
    if (isset($valPricesMap[$v->id])) {
        $delta = (float) $valPricesMap[$v->id];
    }
    $vLower = strtolower(trim($v->value));
    $isNoStone = in_array($vLower, ["none", "no stone", "solid gold", "no stone / solid gold", "no stone/solid gold", ""]);

    $matchedMaster = $allMasterValues->first(function($mv) use ($v, $vLower) {
        if (!empty($mv->code) && !empty($v->code) && strtoupper($mv->code) === strtoupper($v->code)) {
            return true;
        }
        $mvLower = strtolower(trim($mv->value));
        if ($mvLower === $vLower) return true;
        if (str_contains($mvLower, "diamond") && str_contains($vLower, "diamond")) return true;
        if (str_contains($mvLower, "emerald") && str_contains($vLower, "emerald")) return true;
        if (str_contains($mvLower, "sapphire") && str_contains($vLower, "sapphire")) return true;
        if (str_contains($mvLower, "ruby") && str_contains($vLower, "ruby")) return true;
        return false;
    });

    $img = $v->image;
    if ($matchedMaster && !empty($matchedMaster->image)) {
        if (empty($img) || str_contains($img, "unsplash.com") || str_contains($matchedMaster->image, "/storage/")) {
            $img = $matchedMaster->image;
        }
    }
    if ($isNoStone) {
        $img = null;
    } elseif (!empty($img) && str_starts_with($img, "/storage/")) {
        $img = url($img);
    }

    if ($delta == 0.0 && $isGem && !$isNoStone) {
        if ($matchedMaster && (float)$matchedMaster->price_delta > 0) {
            $delta = (float) $matchedMaster->price_delta;
        } else {
            $matched = $gems->first(function ($g) use ($v) {
                return stripos($v->value, $g->stone_type) !== false || stripos($g->stone_type, $v->value) !== false;
            });
            if ($matched) {
                $delta = (float) $matched->default_stone_charge;
            }
        }
    }
    return [
        "id" => $v->id,
        "value" => $v->value,
        "code" => $v->code ?? ($matchedMaster?->code ?? null),
        "image" => $img,
        "price_delta" => $delta,
        "hex_color" => $v->hex_color ?? ($matchedMaster?->hex_color ?? null),
    ];
});

echo "MAPPED:\n";
print_r($mapped->toArray());
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
