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
if ($product->relationLoaded("optionAssignments")) {
    foreach ($product->optionAssignments as $assign) {
        if (!empty($assign->value_prices) && is_array($assign->value_prices)) {
            foreach ($assign->value_prices as $vId => $p) {
                $valPricesMap[$vId] = (float)$p;
            }
        }
    }
}

$mappedOptions = $product->options->map(function ($o) use ($masters, $allMasterValues, $product, $valPricesMap) {
    $isPurity = str_contains(strtolower($o->name), "purity") || str_contains(strtolower($o->name), "metal") || str_contains(strtolower($o->name), "karat");
    $isFinish = str_contains(strtolower($o->name), "finish") || str_contains(strtolower($o->name), "tone") || strtoupper($o->name) === "FINISH";
    $isGem = str_contains(strtolower($o->name), "gem") || str_contains(strtolower($o->name), "stone");
    $gems = $masters["gems"] ?? collect();

    $vals = $o->values;
    if ($isPurity && !empty($product->available_purities) && is_array($product->available_purities)) {
        $allowedPurities = array_map(fn($p) => strtoupper(str_replace(" ", "", $p)), $product->available_purities);
        $vals = $vals->filter(function($v) use ($allowedPurities) {
            $clean = strtoupper(str_replace(" ", "", $v->value));
            return in_array($clean, $allowedPurities);
        });
    }

    if ($isFinish && !empty($product->available_finishes) && is_array($product->available_finishes)) {
        $allowedFinishes = $product->available_finishes;
        $vals = $vals->filter(function($v) use ($allowedFinishes) {
            $valLower = strtolower($v->value);
            if (in_array("YG", $allowedFinishes) && str_contains($valLower, "yellow")) return true;
            if (in_array("WG", $allowedFinishes) && str_contains($valLower, "white")) return true;
            if (in_array("RG", $allowedFinishes) && str_contains($valLower, "rose")) return true;
            if ((in_array("BLK", $allowedFinishes) || in_array("BG", $allowedFinishes)) && (str_contains($valLower, "black") || str_contains($valLower, "ruthenium"))) return true;
            return false;
        });
    }

    $retValues = $vals->values()->map(function ($v) use ($isGem, $gems, $allMasterValues, $valPricesMap) {
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

    return [
        "id" => $o->id,
        "name" => $o->name,
        "values" => $retValues,
    ];
});

echo json_encode($mappedOptions->toArray(), JSON_PRETTY_PRINT);
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
