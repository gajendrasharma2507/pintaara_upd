import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)

stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php -r "require __DIR__ . \'/vendor/autoload.php\'; \$app = require_once __DIR__ . \'/bootstrap/app.php\'; \$kernel = \$app->make(Illuminate\\Contracts\\Console\\Kernel::class); \$kernel->bootstrap(); \$users = App\\Models\\User::all([\'id\', \'name\', \'email\', \'role\']); foreach (\$users as \$u) { echo \$u->id . \' | \' . \$u->name . \' | \' . \$u->email . \' | \' . \$u->role . PHP_EOL; }"')
print(stdout.read().decode('utf-8', errors='replace'))
ssh.close()
