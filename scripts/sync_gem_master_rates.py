import paramiko

def run():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)
    
    php_script = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\CustomizationMaster;
use App\\Models\\CustomizationMasterValue;
use App\\Models\\GemOption;

echo "=== GEM OPTIONS IN DB ===\\n";
$gems = GemOption::all();
foreach ($gems as $g) {
    echo "- ID {$g->id}: {$g->name} ({$g->stone_type}) => default_stone_charge = {$g->default_stone_charge}\\n";
}

echo "\\n=== CUSTOMIZATION MASTERS ===\\n";
$masters = CustomizationMaster::all();
foreach ($masters as $m) {
    echo "- ID {$m->id}: {$m->name} (code: {$m->code}, is_active: {$m->is_active})\\n";
}

$gemMaster = CustomizationMaster::where('code', 'GEM')->orWhere('name', 'like', '%GEM%')->first();
if ($gemMaster) {
    echo "\\n=== GEM MASTER VALUES BEFORE ===\\n";
    foreach ($gemMaster->values as $v) {
        echo "- ID {$v->id}: {$v->value} => price_delta = {$v->price_delta}\\n";
    }

    // Update master values to match gem_options
    CustomizationMasterValue::where('master_id', $gemMaster->id)->where('value', 'like', '%Sapphire%')->update(['price_delta' => 30000]);
    CustomizationMasterValue::where('master_id', $gemMaster->id)->where('value', 'like', '%Diamond%')->update(['price_delta' => 45000]);
    CustomizationMasterValue::where('master_id', $gemMaster->id)->where('value', 'like', '%Emerald%')->update(['price_delta' => 32000]);
    CustomizationMasterValue::where('master_id', $gemMaster->id)->where('value', 'like', '%Ruby%')->update(['price_delta' => 28000]);
    CustomizationMasterValue::where('master_id', $gemMaster->id)->where('value', 'like', '%Solid Gold%')->update(['price_delta' => 0]);

    // Ensure master is active
    $gemMaster->update(['is_active' => true]);

    echo "\\n=== GEM MASTER VALUES AFTER ===\\n";
    $gemMaster->refresh();
    foreach ($gemMaster->values as $v) {
        echo "- ID {$v->id}: {$v->value} => price_delta = {$v->price_delta}\\n";
    }
}

echo "\\nSync completed successfully!\\n";
"""

    sftp = ssh.open_sftp()
    remote_path = '/home/u573062443/pintaara_api/sync_gem_rates.php'
    with sftp.file(remote_path, 'w') as f:
        f.write(php_script)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php sync_gem_rates.php && rm sync_gem_rates.php')
    print("STDOUT:\n" + stdout.read().decode())
    print("STDERR:\n" + stderr.read().decode())
    ssh.close()

if __name__ == '__main__':
    run()
