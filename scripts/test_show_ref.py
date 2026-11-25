import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$ctrl = app(\\App\\Http\\Controllers\\Api\\ProductApiController::class);
$ref = new ReflectionMethod($ctrl, "show");
echo "Controller file: " . $ref->getFileName() . "\n";
$res = $ctrl->show("PD-PD-CS-002");
$content = json_decode($res->getContent(), true);
$opt8 = null;
foreach ($content["data"]["options"] as $o) {
    if ($o["id"] == 8) $opt8 = $o;
}
echo "OPT 8 in show response:\n";
print_r($opt8);
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
