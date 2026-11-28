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

echo "=== FINISH OPTIONS ===\n";
$finishes = DB::table("finish_options")->get();
foreach ($finishes as $f) {
    echo json_encode($f) . "\n";
}

echo "\n=== PRODUCT OPTION VALUES ===\n";
$povs = DB::table("product_option_values")->where("value", "like", "%ruthenium%")->orWhere("value", "like", "%black%")->get();
foreach ($povs as $pov) {
    echo "ID: {$pov->id}, OptID: {$pov->product_option_id}, Value: {$pov->value}\n";
}

echo "\n=== CUSTOMIZATION VALUES ===\n";
if (Illuminate\\Support\\Facades\\Schema::hasTable("customization_values")) {
    $cvs = DB::table("customization_values")->where("value", "like", "%ruthenium%")->orWhere("value", "like", "%black%")->get();
    foreach ($cvs as $cv) {
        echo "ID: {$cv->id}, MasterID: {$cv->customization_master_id}, Value: {$cv->value}\n";
    }
}

echo "\n=== PRODUCTS WITH BLACK RUTHENIUM ===\n";
$prods = DB::table("products")->where("available_finishes", "like", "%ruthenium%")->orWhere("available_finishes", "like", "%BLK%")->get(["id", "design_code", "name", "available_finishes"]);
foreach ($prods as $p) {
    echo "ID: {$p->id}, Code: {$p->design_code}, Name: {$p->name}, Finishes: {$p->available_finishes}\n";
}
'
'''

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
