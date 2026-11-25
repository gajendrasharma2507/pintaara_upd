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

use Illuminate\\Support\\Facades\\Schema;

echo "product_options columns: " . json_encode(Schema::getColumnListing("product_options")) . "\\n";
echo "product_option_values columns: " . json_encode(Schema::getColumnListing("product_option_values")) . "\\n";
echo "product_variants columns: " . json_encode(Schema::getColumnListing("product_variants")) . "\\n";
echo "customization_masters: " . json_encode(Schema::getColumnListing("customization_masters")) . "\\n";
echo "customization_master_values: " . json_encode(Schema::getColumnListing("customization_master_values")) . "\\n";
'"""
    stdin, stdout, stderr = client.exec_command(cmd)
    print("OUTPUT:\n", stdout.read().decode('utf-8'))
    print("ERRORS:\n", stderr.read().decode('utf-8'))
    client.close()

if __name__ == '__main__':
    run()
