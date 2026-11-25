import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)

php_script = """
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

foreach (["admin.products.edit", "admin.products.create"] as $viewName) {
    $args = [
        "collections" => \\App\\Models\\CollectionMaster::all(),
        "purities" => \\App\\Models\\MetalPurity::all(),
        "finishes" => \\App\\Models\\FinishOption::all(),
        "rates" => app(\\App\\Services\\JewelryPricingService::class)->getAllPurityRates(),
        "gstPercent" => 3.0,
    ];
    if ($viewName === "admin.products.edit") {
        $args["product"] = \\App\\Models\\Product::with(["collection", "images", "designLog"])->first();
    }
    $rendered = view($viewName, $args)->render();
    echo "=== Checking $viewName ===\\n";
    $banned = [
        "Select which finish options this piece is available in",
        "Select Multiple Available Finishes",
        "Classic Signature Gold Polish",
        "Rhodium Lustre White Gold",
        "Upload separate images for each Finish Option",
        "active_finish_banner",
        "manual_img_url",
        "Total: ",
    ];
    foreach ($banned as $b) {
        echo (strpos($rendered, $b) !== false ? "FOUND BANNED: $b" : "CLEAN: $b") . "\\n";
    }
}
"""

cmd = f"cd /home/u573062443/domains/admin.pintaara.com && php -r '{php_script}'"
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
