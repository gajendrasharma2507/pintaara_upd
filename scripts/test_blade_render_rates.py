import os
import paramiko

def test_render():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.environ['SSH_PASSWORD']
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)
    sftp = client.open_sftp()

    local_view = "backend/resources/views/admin/gold-rates/index.blade.php"
    remote_view = f"{remote_base}/resources/views/admin/gold-rates/index.blade.php"
    print(f"Uploading {local_view} -> {remote_view}...")
    sftp.put(local_view, remote_view)
    sftp.close()

    print("Clearing view cache...")
    client.exec_command(f"cd {remote_base} && php artisan view:clear")

    print("Testing view render in Laravel...")
    php_code = (
        "$controller = app(App\\Http\\Controllers\\Admin\\AdminWebController::class);"
        "$response = $controller->goldRates();"
        "echo 'RENDER SUCCESS, HTML LENGTH: ' . strlen($response->render());"
    )
    cmd = f"cd {remote_base} && php -r \"require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$kernel = \$app->make(Illuminate\\Contracts\\Console\\Kernel::class); \$kernel->bootstrap(); {php_code}\""
    
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')

    print("STDOUT:", out)
    if err:
        print("STDERR:", err)

    client.close()

if __name__ == '__main__':
    test_render()
