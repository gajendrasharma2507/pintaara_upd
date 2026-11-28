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

$product = \\App\\Models\\Product::first();

// Simulate request
$testImages = [
    ["url" => "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop", "finish_key" => "default", "is_primary" => true],
    ["url" => "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1000&auto=format&fit=crop", "finish_key" => "YG", "is_primary" => false],
];

$req = \\Illuminate\\Http\\Request::create("/admin/products/{$product->id}", "PUT", [
    "name" => $product->name,
    "collection_master_id" => $product->collection_master_id,
    "base_weight_grams" => $product->base_weight_grams,
    "finish_images_json" => json_encode($testImages),
]);

$controller = app(\\App\\Http\\Controllers\\Admin\\AdminWebController::class);
$reflection = new \\ReflectionClass($controller);
$method = $reflection->getMethod("syncFinishImages");
$method->setAccessible(true);
$method->invoke($controller, $product, $req);

echo "Images after sync:\n";
foreach ($product->fresh()->images as $img) {
    echo "  - ID: {$img->id}, URL: {$img->url}, Finish: " . ($img->finish_key ?: "null") . ", Finish ID: " . ($img->finish_id ?: "null") . ", Primary: " . ($img->is_primary ? "1" : "0") . "\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
