import os
import paramiko

def run():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.environ['SSH_PASSWORD']

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=20)
    sftp = client.open_sftp()

    php_content = """<?php
require '/home/u573062443/domains/admin.pintaara.com/vendor/autoload.php';
$app = require_once '/home/u573062443/domains/admin.pintaara.com/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

echo "view.compiled: " . var_export(config('view.compiled'), true) . "\n";
echo "storage_path: " . storage_path('framework/views') . "\n";
echo "is_dir: " . (is_dir(storage_path('framework/views')) ? "YES" : "NO") . "\n";
echo "is_writable: " . (is_writable(storage_path('framework/views')) ? "YES" : "NO") . "\n";

try {
    $compiler = $app->make('blade.compiler');
    echo "Blade compiler created successfully!\n";
} catch (Throwable $e) {
    echo "Blade error: " . $e->getMessage() . "\n";
}
"""
    with sftp.file('/home/u573062443/domains/admin.pintaara.com/test_blade_run.php', 'w') as f:
        f.write(php_content)
    sftp.close()

    stdin, stdout, stderr = client.exec_command('php /home/u573062443/domains/admin.pintaara.com/test_blade_run.php')
    print("OUTPUT:\n" + stdout.read().decode())
    print("ERR:\n" + stderr.read().decode())

    # clean up test file
    client.exec_command('rm -f /home/u573062443/domains/admin.pintaara.com/test_blade_run.php')
    client.close()

if __name__ == '__main__':
    run()
