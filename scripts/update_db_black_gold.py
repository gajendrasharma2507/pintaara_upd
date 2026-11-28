import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

cmd = '''cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\DB;

$updatedPov = DB::table("product_option_values")
    ->where("value", "like", "%Black Ruthenium%")
    ->update(["value" => "Black Gold"]);
echo "Updated product_option_values: {$updatedPov}\n";

$updatedFinishes = DB::table("finish_options")
    ->where("name", "like", "%Black Ruthenium%")
    ->update(["name" => "Black Gold"]);
echo "Updated finish_options: {$updatedFinishes}\n";

if (Illuminate\\Support\\Facades\\Schema::hasTable("customization_values")) {
    $updatedCv = DB::table("customization_values")
        ->where("value", "like", "%Black Ruthenium%")
        ->update(["value" => "Black Gold"]);
    echo "Updated customization_values: {$updatedCv}\n";
}

echo "FINISHED_DB_UPDATE\n";
'
'''

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
