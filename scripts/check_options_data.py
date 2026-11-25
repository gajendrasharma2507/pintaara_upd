import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    cmd = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

echo "Customization Masters Count: " . App\\Models\\CustomizationMaster::count() . "\\n";
foreach (App\\Models\\CustomizationMaster::with("values")->get() as $m) {
    echo "- Master: {$m->name} ({$m->code}, type={$m->input_type}) values count: " . $m->values->count() . "\\n";
}

echo "\\nProduct Options for Product 2 (PD-PD-CS-002):\\n";
foreach (App\\Models\\ProductOption::where("product_id", 2)->with("values")->get() as $po) {
    echo "- Option: {$po->name} (values: " . $po->values->pluck("value")->implode(", ") . ")\\n";
}

echo "\\nProduct Variants for Product 2:\\n";
echo "Count: " . App\\Models\\ProductVariant::where("product_id", 2)->count() . "\\n";
'"""
    stdin, stdout, stderr = client.exec_command(cmd)
    print("OUTPUT:\n", stdout.read().decode('utf-8'))
    print("ERRORS:\n", stderr.read().decode('utf-8'))
    client.close()

if __name__ == '__main__':
    run()
