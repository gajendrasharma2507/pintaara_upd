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
use App\\Models\\CustomizationMaster;
use App\\Models\\CustomizationMasterValue;

echo "=== CUSTOMIZATION MASTERS IN DB ===\\n";
$masters = CustomizationMaster::with('values')->get();
foreach ($masters as $m) {
    echo "Master #{$m->id}: {$m->name} (code: {$m->code})\\n";
    foreach ($m->values as $v) {
        echo "  - Val #{$v->id}: '{$v->value}' (code: {$v->code}) -> image: '{$v->image}', delta: {$v->price_delta}\\n";
    }
}

echo "\\n=== PRODUCT 60 OPTIONS IN DB ===\\n";
$prod = Product::find(60);
foreach ($prod->options as $o) {
    echo "Option #{$o->id}: {$o->name}\\n";
    foreach ($o->values as $v) {
        echo "  - Val #{$v->id}: '{$v->value}' (code: {$v->code}) -> image: '{$v->image}', delta: {$v->price_delta}\\n";
    }
}
"""

    sftp = ssh.open_sftp()
    with sftp.file('/home/u573062443/pintaara_api/inspect_gem_images.php', 'w') as f:
        f.write(php_code)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php inspect_gem_images.php && rm inspect_gem_images.php')
    print(stdout.read().decode())
    print(stderr.read().decode())
    ssh.close()

if __name__ == '__main__':
    run()
