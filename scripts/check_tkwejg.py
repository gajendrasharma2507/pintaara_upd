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

$o = App\\Models\\Order::withTrashed()->latest()->first();
if ($o) {
    echo "ORDER ID: " . $o->id . "\\n";
    echo "ORDER NUMBER: " . $o->order_number . "\\n";
    echo "CUSTOMER NAME: " . $o->customer_name . "\\n";
    echo "CUSTOMER PHONE: " . $o->customer_phone . "\\n";
    echo "SHIPPING ADDRESS: " . json_encode($o->shipping_address) . "\\n";
    echo "BILLING ADDRESS: " . json_encode($o->billing_address ?? null) . "\\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
