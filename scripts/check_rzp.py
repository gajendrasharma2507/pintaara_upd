import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)

cmd = "php -r \"require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$kernel = \$app->make(Illuminate\\Contracts\\Console\\Kernel::class); \$kernel->bootstrap(); var_dump(App\\Models\\Setting::where('key', 'like', 'razorpay%')->get()->toArray()); var_dump(config('razorpay'));\""
stdin, stdout, stderr = ssh.exec_command(f'cd /home/u573062443/pintaara_api && {cmd}')
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("STDOUT:\n" + out)
if err:
    print("STDERR:\n" + err)
ssh.close()
