import paramiko
import os
import requests

VPS_HOST = "145.79.209.237"
VPS_PORT = 65002
VPS_USER = "u573062443"
VPS_PASS = os.getenv("SSH_PASSWORD", "Prayosha@2026")
REMOTE_BASE = "/home/u573062443/domains/admin.pintaara.com"

FILES_TO_UPLOAD = [
    ("backend/app/Models/Product.php", f"{REMOTE_BASE}/app/Models/Product.php"),
    ("backend/app/Http/Controllers/Api/ProductApiController.php", f"{REMOTE_BASE}/app/Http/Controllers/Api/ProductApiController.php"),
    ("backend/app/Http/Controllers/Admin/AdminWebController.php", f"{REMOTE_BASE}/app/Http/Controllers/Admin/AdminWebController.php"),
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

    print("Clearing caches on VPS...")
    commands = [
        f"cd {REMOTE_BASE} && php artisan view:clear",
        f"cd {REMOTE_BASE} && php artisan config:clear",
    ]
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        print(f"[CMD] {cmd}\n[OUT] {out}\n[ERR] {err}")

    # Verify Blade syntax and check test rendering of edit view
    verify_script = f"""cd {REMOTE_BASE} && php -r "
require 'vendor/autoload.php';
\\$app = require_once 'bootstrap/app.php';
\\$kernel = \\$app->make(Illuminate\\Contracts\\Console\\Kernel::class);
\\$kernel->bootstrap();
\\$product = \\App\\Models\\Product::with(['collection', 'images'])->first();
\\$categories = \\App\\Models\\Category::all();
\\$collections = \\App\\Models\\CollectionMaster::all();
\\$rates = \\App\\Services\\MetalRateService::getCurrentRates();
\\$imagesData = [];
\\$optionGroups = \\App\\Models\\ProductOptionGroup::with('values')->orderBy('sort_order')->get();
\\$existingAssignments = \\App\\Models\\ProductOptionAssignment::where('product_id', \\$product->id)->get();
\\$existingVariants = \\App\\Models\\ProductVariant::where('product_id', \\$product->id)->get();
try {{
    \\$view = view('admin.products.edit', [
        'product' => \\$product,
        'categories' => \\$categories,
        'collections' => \\$collections,
        'rates' => \\$rates,
        'imagesData' => \\$imagesData,
        'optionGroups' => \\$optionGroups,
        'existingAssignments' => \\$existingAssignments,
        'existingVariants' => \\$existingVariants,
    ])->render();
    echo 'EDIT_VIEW_RENDER_OK: ' . strlen(\\$view) . ' bytes\\n';
}} catch (\\Throwable \\$e) {{
    echo 'EDIT_VIEW_RENDER_ERROR: ' . \\$e->getMessage() . ' at line ' . \\$e->getLine() . '\\n';
}}
" """
    stdin, stdout, stderr = ssh.exec_command(verify_script)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(f"[VERIFY]\n{out}\n{err}")

    ssh.close()
    print("Deployment completed successfully!")

if __name__ == "__main__":
    main()
