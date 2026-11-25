import paramiko
import os

def deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    sftp = client.open_sftp()
    
    remote_base = '/home/u573062443/domains/admin.pintaara.com'
    
    # 1. Upload Migration
    local_mig = 'backend/database/migrations/2026_11_19_000002_create_dynamic_product_options_and_variants_tables.php'
    remote_mig = f'{remote_base}/database/migrations/2026_11_19_000002_create_dynamic_product_options_and_variants_tables.php'
    sftp.put(local_mig, remote_mig)
    print("Uploaded migration.")
    
    # 2. Run Migration
    cmd = f'cd {remote_base} && php artisan migrate --force'
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Migrate stdout:", stdout.read().decode())
    print("Migrate stderr:", stderr.read().decode())
    
    # 3. Check groups count
    cmd_check = '''cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make("Illuminate\\\\Contracts\\\\Console\\\\Kernel")->bootstrap();

$groups = \\\\Illuminate\\\\Support\\\\Facades\\\\DB::table("product_option_groups")->get();
echo "Total Option Groups: " . $groups->count() . "\\n";
foreach ($groups as $g) {
    $valCount = \\\\Illuminate\\\\Support\\\\Facades\\\\DB::table("product_option_values")->where("group_id", $g->id)->count();
    echo "- Group " . $g->name . " (" . $g->code . ", type=" . $g->display_type . "): " . $valCount . " values\\n";
}
'
'''
    stdin, stdout, stderr = client.exec_command(cmd_check)
    print("CHECK OUTPUT:\n", stdout.read().decode())
    print("CHECK STDERR:\n", stderr.read().decode())
    
    sftp.close()
    client.close()

if __name__ == '__main__':
    deploy()
