import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

php_script = """
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$images = \\App\\Models\\ProductImage::take(10)->get(["id", "product_id", "finish_key", "url", "is_primary"]);
echo json_encode($images, JSON_PRETTY_PRINT);
"""

cmd = f"cd /home/u573062443/domains/admin.pintaara.com && php -r '{php_script}'"
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
