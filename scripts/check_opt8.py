import paramiko
import json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();
$vals = \\Illuminate\\Support\\Facades\\DB::table("product_option_values")->where("product_option_id", 8)->get();
echo json_encode($vals, JSON_PRETTY_PRINT);
'"""

stdin, stdout, stderr = c.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
c.close()
