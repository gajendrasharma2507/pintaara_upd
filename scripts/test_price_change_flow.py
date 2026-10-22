import paramiko
import urllib.request
import json

def test():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)
    
    # 1. Update Ceylon Blue Sapphire to 35000 in DB for product 60
    php_code = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();

use App\\Models\\Product;
use App\\Models\\ProductOptionValue;

$prod = Product::find(60);
$opt = $prod->options()->where('name', 'like', '%Gem%')->first();
if ($opt) {
    $val = $opt->values()->where('value', 'like', '%Sapphire%')->first();
    if ($val) {
        $val->update(['price_delta' => 35000]);
        echo "UPDATED_TO_35000_OK\\n";
    }
}
"""
    sftp = ssh.open_sftp()
    with sftp.file('/home/u573062443/pintaara_api/test_update.php', 'w') as f:
        f.write(php_code)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php test_update.php && rm test_update.php')
    print("DB UPDATE OUTPUT:", stdout.read().decode())

    # 2. Check public API endpoint
    req = urllib.request.Request('https://api.pintaara.com/api/products/60', headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode())
        options = data.get('data', {}).get('options', [])
        for o in options:
            if 'gem' in o.get('name', '').lower() or 'stone' in o.get('name', '').lower():
                for v in o.get('values', []):
                    if 'sapphire' in v.get('value', '').lower():
                        print(f"STOREFRONT API RESULT: {v.get('value')} => price_delta = {v.get('price_delta')}")

    # 3. Test price calculation endpoint with the new delta
    calc_payload = json.dumps({
        "weight_grams": 5.0,
        "purity": "18KT Gold",
        "making_charge_flat": 12000,
        "wastage_percent": 2.5,
        "gem": "Ceylon Blue Sapphire",
        "stone_charge": 35000
    }).encode()
    calc_req = urllib.request.Request(
        'https://api.pintaara.com/api/price/calculate',
        data=calc_payload,
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'}
    )
    with urllib.request.urlopen(calc_req) as res:
        calc_res = json.loads(res.read().decode())
        print("PRICE CALCULATION API RESULT:")
        print("  - Stone Charge:", calc_res.get('data', {}).get('stone_charge'))
        print("  - Subtotal:", calc_res.get('data', {}).get('subtotal'))
        print("  - Total Price:", calc_res.get('data', {}).get('total_price'))

    # 4. Revert back to 30000
    php_revert = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();

use App\\Models\\Product;
$prod = Product::find(60);
$opt = $prod->options()->where('name', 'like', '%Gem%')->first();
if ($opt) {
    $val = $opt->values()->where('value', 'like', '%Sapphire%')->first();
    if ($val) {
        $val->update(['price_delta' => 30000]);
        echo "REVERTED_TO_30000_OK\\n";
    }
}
"""
    sftp = ssh.open_sftp()
    with sftp.file('/home/u573062443/pintaara_api/test_revert.php', 'w') as f:
        f.write(php_revert)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php test_revert.php && rm test_revert.php')
    print("REVERT OUTPUT:", stdout.read().decode())

    ssh.close()

if __name__ == '__main__':
    test()
