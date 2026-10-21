import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)

php_script = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\CollectionMaster;

$bangles = CollectionMaster::updateOrCreate(
    ['slug' => 'bangles'],
    [
        'name' => 'Bangles',
        'image' => '/images/products/bangles.png',
        'sort_order' => 8,
        'status' => 'active',
        'description' => 'Architectural luxury cuffs and articulated bangles.'
    ]
);

echo "Bangles status: " . $bangles->name . " -> " . $bangles->status . " (ID: " . $bangles->id . ")\\n";
$all = CollectionMaster::orderBy('sort_order')->get();
foreach ($all as $c) {
    echo "- #" . $c->id . ": " . $c->name . " (slug: " . $c->slug . ", status: " . $c->status . ")\\n";
}
"""

sftp = ssh.open_sftp()
with sftp.file('/home/u573062443/pintaara_api/fix_bangles.php', 'w') as f:
    f.write(php_script)
sftp.close()

stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php fix_bangles.php')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
ssh.close()
