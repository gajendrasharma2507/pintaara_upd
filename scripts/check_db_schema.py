import paramiko

def run():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)
    
    php_code = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();

use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Support\\Facades\\DB;

echo "COLUMNS IN product_option_values:\\n";
print_r(Schema::getColumnListing('product_option_values'));

echo "\\nCOLUMNS IN product_options:\\n";
print_r(Schema::getColumnListing('product_options'));

echo "\\nCOLUMNS IN gem_options:\\n";
print_r(Schema::getColumnListing('gem_options'));

echo "\\nCOLUMNS IN customization_master_values:\\n";
print_r(Schema::getColumnListing('customization_master_values'));
"""

    sftp = ssh.open_sftp()
    with sftp.file('/home/u573062443/pintaara_api/check_cols.php', 'w') as f:
        f.write(php_code)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php check_cols.php && rm check_cols.php')
    print(stdout.read().decode())
    print(stderr.read().decode())
    ssh.close()

if __name__ == '__main__':
    run()
