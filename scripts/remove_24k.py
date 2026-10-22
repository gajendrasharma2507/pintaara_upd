import paramiko

def run():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)
    
    php_code = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();

use App\\Models\\Product;
use App\\Models\\ProductOptionValue;

$prod = Product::find(60);
if ($prod) {
    $purityOpt = $prod->options()->where('name', 'like', '%Purity%')->orWhere('name', 'like', '%Metal%')->first();
    if ($purityOpt) {
        $val24 = $purityOpt->values()->where('value', 'like', '%24KT%')->orWhere('value', 'like', '%24K%')->first();
        if ($val24) {
            $val24->delete();
            echo "DELETED_24KT_FROM_PRODUCT_60_SUCCESS\\n";
        } else {
            echo "24KT not found in product 60 options\\n";
        }
    }
}
"""

    sftp = ssh.open_sftp()
    with sftp.file('/home/u573062443/pintaara_api/remove_24k_p60.php', 'w') as f:
        f.write(php_code)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php remove_24k_p60.php && rm remove_24k_p60.php')
    print(stdout.read().decode())
    print(stderr.read().decode())
    ssh.close()

if __name__ == '__main__':
    run()
