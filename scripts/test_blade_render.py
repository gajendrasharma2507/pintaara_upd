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

$view = view("admin.products.edit", [
    "product" => \\App\\Models\\Product::with(["collection", "images", "designLog"])->first(),
    "collections" => \\App\\Models\\CollectionMaster::all(),
    "purities" => \\App\\Models\\MetalPurity::all(),
    "finishes" => \\App\\Models\\FinishOption::all(),
    "rates" => app(\\App\\Services\\JewelryPricingService::class)->getAllPurityRates(),
    "gstPercent" => 3.0,
])->render();

echo "Has FINISH OPTIONS section? " . (strpos($view, "FINISH OPTIONS") !== false ? "YES" : "NO") . "\n";
echo "Has finish-checkbox? " . (strpos($view, "finish-checkbox") !== false ? "YES" : "NO") . "\n";
echo "Has available_finishes in products table? " . (\\Illuminate\\Support\\Facades\\Schema::hasColumn("products", "available_finishes") ? "YES" : "NO") . "\n";
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
