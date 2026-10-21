import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)

# Update database settings to use real Razorpay test keys from .env
cmd = """php -r "require 'vendor/autoload.php'; \\$app = require_once 'bootstrap/app.php'; \\$kernel = \\$app->make(Illuminate\\Contracts\\Console\\Kernel::class); \\$kernel->bootstrap();
App\\Models\\Setting::set('razorpay_test_key_id', 'rzp_test_TAzQnfWccCWrqq', 'string', 'Razorpay Test Key ID');
App\\Models\\Setting::set('razorpay_test_key_secret', 'gOxwbqhtPz136rYuc6Tx1O5a', 'string', 'Razorpay Test Key Secret');
echo 'Keys updated in Setting table! Testing Razorpay API order creation...\\n';

\\$response = Illuminate\\Support\\Facades\\Http::withBasicAuth('rzp_test_TAzQnfWccCWrqq', 'gOxwbqhtPz136rYuc6Tx1O5a')
    ->post('https://api.razorpay.com/v1/orders', [
        'amount' => 15034300,
        'currency' => 'INR',
        'receipt' => 'test_rcpt_1',
        'payment_capture' => 1,
    ]);

echo 'Status: ' . \\$response->status() . '\\n';
echo 'Body: ' . \\$response->body() . '\\n';
"
"""

stdin, stdout, stderr = ssh.exec_command(f'cd /home/u573062443/pintaara_api && {cmd}')
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("STDOUT:\n" + out)
if err:
    print("STDERR:\n" + err)
ssh.close()
