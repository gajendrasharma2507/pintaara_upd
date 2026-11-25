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

$users = App\\Models\\User::whereIn("email", ["zenishsoni2@gmail.com", "zenishsoni16@gmail.com"])->get();
foreach ($users as $user) {
    echo "USER: {$user->email} (id: {$user->id})\\n";
    $req = Illuminate\\Http\\Request::create("/api/user/orders", "GET");
    $req->setUserResolver(function() use ($user) { return $user; });
    $ctrl = app(App\\Http\\Controllers\\Api\\OrderApiController::class);
    $res = $ctrl->userOrders($req);
    echo $res->getContent() . "\\n\\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
