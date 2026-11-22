import paramiko
import os

VPS_HOST = "145.79.209.237"
VPS_PORT = 65002
VPS_USER = "u573062443"
VPS_PASS = os.getenv("SSH_PASSWORD", "Prayosha@2026")
REMOTE_BASE = "/home/u573062443/domains/admin.pintaara.com"

FILES_TO_UPLOAD = [
    ("backend/routes/web.php", f"{REMOTE_BASE}/routes/web.php"),
    ("backend/resources/views/layouts/admin.blade.php", f"{REMOTE_BASE}/resources/views/layouts/admin.blade.php"),
    ("backend/resources/views/admin/products/create.blade.php", f"{REMOTE_BASE}/resources/views/admin/products/create.blade.php"),
    ("backend/resources/views/admin/products/edit.blade.php", f"{REMOTE_BASE}/resources/views/admin/products/edit.blade.php"),
]

def main():
    print("Connecting to VPS via SSH/SFTP...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=15)
    sftp = ssh.open_sftp()

    for local_path, remote_path in FILES_TO_UPLOAD:
        print(f"Uploading {local_path} -> {remote_path}...")
        sftp.put(local_path, remote_path)
    sftp.close()

    print("Clearing view, route, config caches on VPS...")
    commands = [
        f"cd {REMOTE_BASE} && php artisan view:clear",
        f"cd {REMOTE_BASE} && php artisan route:clear",
        f"cd {REMOTE_BASE} && php artisan config:clear",
    ]
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        print(f"[CMD] {cmd}\n[OUT] {out}\n[ERR] {err}")

    # Verify rendering
    test_cmd = f"""cd {REMOTE_BASE} && php -r "
require 'vendor/autoload.php';
\\$app = require_once 'bootstrap/app.php';
\\$kernel = \\$app->make(Illuminate\\Contracts\\Console\\Kernel::class);
\\$kernel->bootstrap();

\\$ctrl = app(\\App\\Http\\Controllers\\Admin\\AdminWebController::class);
\\$p = \\App\\Models\\Product::first();
try {{
    \\$resCreate = \\$ctrl->createProduct();
    \\$htmlCreate = \\$resCreate->render();
    echo 'CREATE_VIEW_OK: ' . strlen(\\$htmlCreate) . ' bytes\\n';
}} catch (\\Throwable \\$e) {{
    echo 'CREATE_VIEW_ERROR: ' . \\$e->getMessage() . ' at line ' . \\$e->getLine() . '\\n';
}}

try {{
    \\$resEdit = \\$ctrl->editProduct(\\$p->id);
    \\$htmlEdit = \\$resEdit->render();
    echo 'EDIT_VIEW_OK: ' . strlen(\\$htmlEdit) . ' bytes\\n';
}} catch (\\Throwable \\$e) {{
    echo 'EDIT_VIEW_ERROR: ' . \\$e->getMessage() . ' at line ' . \\$e->getLine() . '\\n';
}}
" """
    stdin, stdout, stderr = ssh.exec_command(test_cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print("OUTPUT:\n", out)
    if err:
        print("STDERR:\n", err)

    ssh.close()
    print("Deployment completed successfully!")

if __name__ == "__main__":
    main()
