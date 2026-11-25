import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)

php_script = """
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$controller = app(\\App\\Http\\Controllers\\Api\\ProductApiController::class);
$prod = \\App\\Models\\Product::first();
$response = $controller->show($prod->design_code ?? $prod->id);
$data = json_decode($response->getContent(), true)["data"];
echo "Product: " . $data["design_code"] . "\\n";
echo "available_finishes: " . json_encode($data["available_finishes"]) . "\\n";
echo "images count: " . count($data["images"]) . "\\n";
if (count($data["images"]) > 0) {
    echo "first image finish_key: " . $data["images"][0]["finish_key"] . "\\n";
    echo "images_by_finish keys: " . json_encode(array_keys($data["images_by_finish"])) . "\\n";
}
"""

cmd = f"cd /home/u573062443/domains/admin.pintaara.com && php -r '{php_script}'"
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
