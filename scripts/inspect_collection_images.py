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

$orders = App\\Models\\Order::with("items")->get();
foreach ($orders as $o) {
    echo "Order: {$o->order_number}, Customer: {$o->customer_email}\\n";
    foreach ($o->items as $i) {
        echo "  Item: {$i->product_name}, design: {$i->design_code}, image: {$i->image}, product_id: {$i->product_id}, finish: {$i->finish}\\n";
        if ($i->product) {
            echo "    Product: id={$i->product->id}, primaryImage={$i->product->primaryImage?->url}\\n";
            foreach ($i->product->images as $img) {
                echo "    ProductImage: url={$img->url}, finish_key={$img->finish_key}\\n";
            }
        } else {
            echo "    Product: NULL\\n";
        }
    }
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
