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

$user = App\\Models\\User::where("email", "zenishsoni2@gmail.com")->first();
if ($user) {
    $req = Illuminate\\Http\\Request::create("/api/user/collection", "GET");
    $req->setUserResolver(function() use ($user) { return $user; });
    $ctrl = app(App\\Http\\Controllers\\Api\\OrderApiController::class);
    $res = $ctrl->userCollection($req);
    echo $res->getContent();
} else {
    echo "User not found\\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
