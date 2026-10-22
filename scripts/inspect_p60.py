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
$prod = Product::find(60);
echo "PRODUCT: {$prod->name} ({$prod->design_code})\\n";
foreach ($prod->options as $opt) {
    echo "Option #{$opt->id}: {$opt->name}\\n";
    foreach ($opt->values as $v) {
        echo "  - Value #{$v->id}: '{$v->value}' (price_delta: {$v->price_delta})\\n";
    }
}

echo "\\nPRODUCT FINISH PURITIES (Matrix):\\n";
foreach ($prod->productFinishPurities as $fp) {
    echo "  - Finish: {$fp->finish?->name} ({$fp->finish?->code}) -> Purity: {$fp->purity?->name} ({$fp->purity?->code}), is_available: {$fp->is_available}\\n";
}
"""

    sftp = ssh.open_sftp()
    with sftp.file('/home/u573062443/pintaara_api/inspect_p60_options.php', 'w') as f:
        f.write(php_code)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php inspect_p60_options.php && rm inspect_p60_options.php')
    print(stdout.read().decode())
    print(stderr.read().decode())
    ssh.close()

if __name__ == '__main__':
    run()
