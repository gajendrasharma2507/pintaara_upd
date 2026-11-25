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

$p = \\App\\Models\\Product::find(2);
echo "Product 2: " . $p->name . " (" . $p->design_code . ")\n";
$assigns = \\App\\Models\\ProductOptionAssignment::where("product_id", 2)->with("group.values")->get();
echo "Assignments (" . $assigns->count() . "):\n";
foreach ($assigns as $a) {
    echo "  Group: " . ($a->group->name ?? "NULL") . " (id=" . $a->group_id . ") display=" . $a->display_type . " values=" . json_encode($a->selected_values) . " prices=" . json_encode($a->value_prices) . "\n";
}

$legacy = \\App\\Models\\ProductOption::where("product_id", 2)->with("values")->get();
echo "Legacy ProductOptions (" . $legacy->count() . "):\n";
foreach ($legacy as $lo) {
    echo "  Opt: " . $lo->name . " (id=" . $lo->id . ") count=" . $lo->values->count() . "\n";
    foreach ($lo->values as $lv) {
        echo "     " . $lv->value . "\n";
    }
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
