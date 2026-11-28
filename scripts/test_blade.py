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

    php_code = """
require '/home/u573062443/domains/admin.pintaara.com/vendor/autoload.php';
$app = require_once '/home/u573062443/domains/admin.pintaara.com/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();
echo 'view.compiled: ' . var_export(config('view.compiled'), true) . PHP_EOL;
echo 'storage_path(framework/views): ' . storage_path('framework/views') . PHP_EOL;
echo 'is_dir: ' . (is_dir(storage_path('framework/views')) ? 'YES' : 'NO') . PHP_EOL;
echo 'is_writable: ' . (is_writable(storage_path('framework/views')) ? 'YES' : 'NO') . PHP_EOL;
try {
    $compiler = $app->make('blade.compiler');
    echo 'Blade compiler created successfully!' . PHP_EOL;
} catch (\\Throwable $e) {
    echo 'Blade error: ' . $e->getMessage() . PHP_EOL;
}
"""
    stdin, stdout, stderr = client.exec_command(f'php -r "{php_code}"')
    print("OUTPUT:\n" + stdout.read().decode())
    print("ERRORS:\n" + stderr.read().decode())
    client.close()

if __name__ == '__main__':
    run()
