import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();

use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Database\\Schema\\Blueprint;

if (!Schema::hasColumn("products", "compatibility_matrix")) {
    Schema::table("products", function (Blueprint $table) {
        $table->json("compatibility_matrix")->nullable()->after("available_finishes");
    });
    echo "Added compatibility_matrix column to products table!\\n";
} else {
    echo "compatibility_matrix column already exists!\\n";
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode())
print("ERR:", stderr.read().decode())
client.close()
