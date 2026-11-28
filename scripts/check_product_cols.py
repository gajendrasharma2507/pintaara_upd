import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();
echo "product_finish_purities: " . json_encode(Illuminate\\Support\\Facades\\Schema::getColumnListing("product_finish_purities")) . "\\n";
echo "finish_purities: " . json_encode(Illuminate\\Support\\Facades\\Schema::getColumnListing("finish_purities")) . "\\n";
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode())
client.close()
