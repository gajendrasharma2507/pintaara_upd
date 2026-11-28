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
    ->with([
        "collectionMaster",
        "images",
        "options.values",
        "optionAssignments.group.values",
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

// 1. Dynamic assigned options
$dynamicOptions = collect();
if ($product->optionAssignments && $product->optionAssignments->count() > 0) {
    foreach ($product->optionAssignments as $assign) {
        $grp = $assign->group;
        if (!$grp || !$grp->is_active) continue;

        $selIds = $assign->selected_values;
        $grpValues = $grp->values->where("is_active", true);
        if (!empty($selIds) && is_array($selIds)) {
            $grpValues = $grpValues->whereIn("id", $selIds);
        }

        $assignedPrices = is_array($assign->value_prices) ? $assign->value_prices : [];

        $mappedVals = $grpValues->values()->map(function ($v) use ($assignedPrices, $allMasterValues) {
            $delta = isset($assignedPrices[$v->id]) ? (float)$assignedPrices[$v->id] : (float)($v->price_delta ?? 0);
            $img = $v->image;
            if (!empty($img) && str_starts_with($img, "/storage/")) {
                $img = url($img);
            }
            return [
                "id" => $v->id,
                "value" => $v->value,
                "code" => $v->code,
                "image" => $img,
                "price_delta" => $delta,
                "hex_color" => $v->hex_color ?? $v->color_code,
            ];
        });

        if ($mappedVals->isNotEmpty()) {
            $dynamicOptions->push([
                "id" => $grp->id,
                "name" => $grp->name,
                "code" => $grp->code ?: strtoupper(preg_replace("/[^A-Za-z0-9]/", "_", $grp->name)),
                "display_type" => $assign->display_type ?: $grp->display_type ?: "dropdown",
                "input_type" => $assign->display_type ?: $grp->display_type ?: "dropdown",
                "is_required" => (bool)$assign->is_required,
                "sort_order" => (int)($assign->sort_order ?? 0),
                "values" => $mappedVals,
            ]);
        }
    }
}

$dynamicGroupNorms = $dynamicOptions->map(function($g) {
    $n = strtolower($g["name"]);
    if (str_contains($n, "purity") || str_contains($n, "metal") || str_contains($n, "karat")) return "purity";
    if (str_contains($n, "finish") || str_contains($n, "tone")) return "finish";
    if (str_contains($n, "size")) return "size";
    if (str_contains($n, "chain")) return "chain";
    if (str_contains($n, "gem") || str_contains($n, "stone")) return "gem";
    return $n;
})->toArray();

$finalOptions = collect();
foreach ($dynamicOptions as $dOpt) {
    $finalOptions->push($dOpt);
}

foreach ($product->options as $o) {
    $nameLower = strtolower($o->name);
    $normKey = $nameLower;
    if (str_contains($nameLower, "purity") || str_contains($nameLower, "metal") || str_contains($nameLower, "karat")) $normKey = "purity";
    elseif (str_contains($nameLower, "finish") || str_contains($nameLower, "tone")) $normKey = "finish";
    elseif (str_contains($nameLower, "size")) $normKey = "size";
    elseif (str_contains($nameLower, "chain")) $normKey = "chain";
    elseif (str_contains($nameLower, "gem") || str_contains($nameLower, "stone")) $normKey = "gem";

    if (in_array($normKey, $dynamicGroupNorms)) {
        continue;
    }

    $isGem = str_contains($nameLower, "gem") || str_contains($nameLower, "stone");
    $isPurity = str_contains($nameLower, "purity") || str_contains($nameLower, "metal") || str_contains($nameLower, "karat");
    $isFinish = !$isGem && (str_contains($nameLower, "finish") || preg_match("/\\\\bhue\\\\b/i", $nameLower) || strtoupper($o->name) === "FINISH");
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

    $mappedVals = $vals->values()->map(function ($v) use ($isGem, $gems, $allMasterValues, $valPricesMap) {
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

    $finalOptions->push([
        "id" => $o->id,
        "name" => $o->name,
        "code" => strtoupper(preg_replace("/[^A-Za-z0-9]/", "_", $o->name)),
        "display_type" => $isFinish || $isGem ? "image_swatch" : ($isPurity ? "text_button" : "dropdown"),
        "input_type" => $isFinish || $isGem ? "image_swatch" : ($isPurity ? "text_button" : "dropdown"),
        "values" => $mappedVals,
    ]);
}

foreach ($finalOptions as $fo) {
    echo "FINAL OPT: name=" . $fo["name"] . " display=" . $fo["display_type"] . " count=" . count($fo["values"]) . "\n";
    foreach ($fo["values"] as $fv) {
        echo "   -> " . $fv["value"] . " (delta=" . $fv["price_delta"] . ", img=" . ($fv["image"] ? "YES" : "NO") . ")\n";
    }
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
