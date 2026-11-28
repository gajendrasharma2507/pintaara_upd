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

$order = App\\Models\\Order::with("items")->find(4);
if ($order) {
    echo "ORDER 4 found: {$order->order_number}\\n";
    $view = view("admin.orders.show", compact("order"))->render();
    echo "VIEW RENDER SUCCESS! Length: " . strlen($view) . "\\n";
} else {
    echo "Order 4 not found\\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
