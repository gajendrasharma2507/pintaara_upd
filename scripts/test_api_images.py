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

$controller = app(\\App\\Http\\Controllers\\Api\\ProductApiController::class);
$res = $controller->show("1");
$data = json_decode($res->getContent(), true)["data"];

echo "API RETURNED IMAGES COUNT: " . count($data["images"]) . "\n";
print_r($data["images"]);
echo "\nIMAGES_BY_FINISH KEYS: " . implode(", ", array_keys($data["images_by_finish"])) . "\n";
print_r($data["images_by_finish"]);
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
