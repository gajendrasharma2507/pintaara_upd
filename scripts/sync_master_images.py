import paramiko

def run():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)

    php_code = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();

use App\\Models\\CustomizationMasterValue;
use App\\Models\\ProductOptionValue;

echo "=== SYNCING MASTER IMAGES TO PRODUCT OPTION VALUES ===\\n";
$masterValues = CustomizationMasterValue::where('is_active', true)->get();

foreach ($masterValues as $mv) {
    if (empty($mv->image)) continue;
    
    // Only sync uploaded / storage images or non-unsplash images
    echo "Master: '{$mv->value}' (code: '{$mv->code}') -> image: '{$mv->image}'\\n";
    
    $query = ProductOptionValue::query();
    $valLower = strtolower($mv->value);
    
    $query->where(function($q) use ($mv, $valLower) {
        $q->where('value', $mv->value)
          ->orWhere('value', 'LIKE', '%' . $mv->value . '%');
        
        if (str_contains($valLower, 'diamond')) {
            $q->orWhere('value', 'LIKE', '%Diamond%');
        } elseif (str_contains($valLower, 'emerald')) {
            $q->orWhere('value', 'LIKE', '%Emerald%');
        } elseif (str_contains($valLower, 'sapphire')) {
            $q->orWhere('value', 'LIKE', '%Sapphire%');
        } elseif (str_contains($valLower, 'ruby')) {
            $q->orWhere('value', 'LIKE', '%Ruby%');
        } elseif (str_contains($valLower, 'yellow gold')) {
            $q->orWhere('value', 'LIKE', '%Yellow Gold%');
        } elseif (str_contains($valLower, 'rose gold')) {
            $q->orWhere('value', 'LIKE', '%Rose Gold%');
        } elseif (str_contains($valLower, 'white gold')) {
            $q->orWhere('value', 'LIKE', '%White Gold%');
        }
    });
    
    $count = $query->count();
    $query->update(['image' => $mv->image]);
    echo "  Updated {$count} product option values with master image!\\n";
}

// Clear no-stone images so they render as clean gold SVG
ProductOptionValue::where('value', 'LIKE', '%No Stone%')
    ->orWhere('value', 'LIKE', '%Solid Gold%')
    ->update(['image' => null]);
echo "Cleared image for No Stone / Solid Gold.\\n";

// Show Product 60 gems now
$p60 = \\App\\Models\\Product::find(60);
$gOpt = $p60->options->first(function($o) {
    return str_contains(strtolower($o->name), 'gem') || str_contains(strtolower($o->name), 'stone');
});
if ($gOpt) {
    echo "\\nProduct 60 Gems Now:\\n";
    foreach ($gOpt->values as $v) {
        echo "  - '{$v->value}' -> image: '{$v->image}', delta: {$v->price_delta}\\n";
    }
}
"""

    sftp = ssh.open_sftp()
    with sftp.file('/home/u573062443/pintaara_api/sync_master_images.php', 'w') as f:
        f.write(php_code)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php sync_master_images.php && rm sync_master_images.php')
    print(stdout.read().decode())
    print(stderr.read().decode())
    ssh.close()

if __name__ == '__main__':
    run()
