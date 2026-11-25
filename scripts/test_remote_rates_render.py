import os
import paramiko

def test_remote_script():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.getenv('SSH_PASSWORD', 'Prayosha@2026')
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)
    sftp = client.open_sftp()

    remote_test_file = f"{remote_base}/test_rates_page.php"
    php_script = """<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

try {
    $ctrl = app(App\\Http\\Controllers\\Admin\\AdminWebController::class);
    $view = $ctrl->goldRates();
    $html = $view->render();
    echo "SUCCESS: Rendered HTML length = " . strlen($html) . "\\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine() . "\\n";
    echo $e->getTraceAsString() . "\\n";
}
"""
    with sftp.open(remote_test_file, 'w') as f:
        f.write(php_script)

    sftp.close()

    stdin, stdout, stderr = client.exec_command(f"php {remote_test_file} && rm {remote_test_file}")
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')

    print("OUTPUT:\n", out)
    if err:
        print("ERRORS:\n", err)

    client.close()

if __name__ == '__main__':
    test_remote_script()
