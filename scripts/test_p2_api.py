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

$p = \\App\\Models\\Product::where("design_code", "PD-PD-CS-002")->first();
$assigns = $p->optionAssignments()->with("group.values")->get();
echo "DYNAMIC ASSIGNMENTS COUNT: " . $assigns->count() . "\n";
foreach ($assigns as $a) {
    echo "ASSIGN: group=" . $a->group->name . " display=" . ($a->display_type ?: $a->group->display_type) . "\n";
    $valIds = $a->selected_values ?? [];
    $vals = $a->group->values;
    if (!empty($valIds)) {
        $vals = $vals->whereIn("id", $valIds);
    }
    foreach ($vals as $v) {
        echo "   -> " . $v->value . "\n";
    }
}
'"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
client.close()
