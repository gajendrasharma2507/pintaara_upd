import paramiko

def check_db():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    cmd = '''php -r '
require "/home/u573062443/domains/admin.pintaara.com/vendor/autoload.php";
$app = require_once "/home/u573062443/domains/admin.pintaara.com/bootstrap/app.php";
$app->make("Illuminate\\Contracts\\Console\\Kernel")->bootstrap();

$tables = ["product_option_groups", "product_options", "product_option_values", "product_option_assignments", "product_variants", "product_variant_option_values", "product_variant_values", "customization_masters", "customization_master_values"];
foreach ($tables as $t) {
    $exists = \Illuminate\Support\Facades\Schema::hasTable($t);
    echo "$t: " . ($exists ? "EXISTS" : "DOES NOT EXIST") . "\n";
    if ($exists) {
        echo "   columns: " . json_encode(\Illuminate\Support\Facades\Schema::getColumnListing($t)) . "\n";
    }
}
'
'''
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    client.close()

if __name__ == '__main__':
    check_db()
