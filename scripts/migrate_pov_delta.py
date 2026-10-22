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

use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Support\\Facades\\DB;
use App\\Models\\ProductOptionValue;
use App\\Models\\GemOption;

// 1. Add price_delta column to product_option_values if not exists
if (!Schema::hasColumn('product_option_values', 'price_delta')) {
    Schema::table('product_option_values', function ($table) {
        $table->decimal('price_delta', 12, 2)->default(0.00)->after('image');
    });
    echo "Added 'price_delta' column to product_option_values table!\\n";
} else {
    echo "'price_delta' column already exists in product_option_values.\\n";
}

// 2. Populate gemstone option values with their default charges from gem_options
$gemOptions = GemOption::all();
$povs = ProductOptionValue::all();
$updatedCount = 0;

foreach ($povs as $pov) {
    $vLower = strtolower(trim($pov->value));
    if (in_array($vLower, ['none', 'no stone', 'solid gold', 'no stone / solid gold', 'no stone/solid gold', ''])) {
        $pov->update(['price_delta' => 0]);
        continue;
    }
    
    // Check if it's a known gem
    if (str_contains($vLower, 'sapphire')) {
        $pov->update(['price_delta' => 30000]);
        $updatedCount++;
    } elseif (str_contains($vLower, 'diamond') || str_contains($vLower, 'vvs')) {
        $pov->update(['price_delta' => 45000]);
        $updatedCount++;
    } elseif (str_contains($vLower, 'emerald')) {
        $pov->update(['price_delta' => 32000]);
        $updatedCount++;
    } elseif (str_contains($vLower, 'ruby')) {
        $pov->update(['price_delta' => 28000]);
        $updatedCount++;
    }
}

echo "Updated {$updatedCount} gemstone product_option_values with real database charges.\\n";

// Print sample for verification
echo "\\n=== SAMPLE PRODUCT OPTION VALUES ===\\n";
$samples = ProductOptionValue::where('price_delta', '>', 0)->take(10)->get();
foreach ($samples as $s) {
    echo "- Option Value #{$s->id}: '{$s->value}' => price_delta = +₹{$s->price_delta}\\n";
}
"""

    sftp = ssh.open_sftp()
    remote_path = '/home/u573062443/pintaara_api/migrate_pov_delta.php'
    with sftp.file(remote_path, 'w') as f:
        f.write(php_script)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php migrate_pov_delta.php && rm migrate_pov_delta.php')
    print("STDOUT:\n" + stdout.read().decode())
    print("STDERR:\n" + stderr.read().decode())
    ssh.close()

if __name__ == '__main__':
    run()
