import os
import paramiko

def deploy():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.getenv('SSH_PASSWORD', 'Prayosha@2026')
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {host}:{port}...")
    client.connect(host, port=port, username=user, password=password, timeout=30)
    print("SSH Connected.")

    sftp = client.open_sftp()

    files = [
        ("backend/resources/views/admin/products/create.blade.php", f"{remote_base}/resources/views/admin/products/create.blade.php"),
        ("backend/resources/views/admin/products/edit.blade.php", f"{remote_base}/resources/views/admin/products/edit.blade.php"),
        ("backend/resources/views/admin/product-options/index.blade.php", f"{remote_base}/resources/views/admin/product-options/index.blade.php"),
    ]

    for local, remote in files:
        print(f"Uploading {local} -> {remote}...")
        sftp.put(local, remote)
        print("  ✓ Uploaded.")

    sftp.close()

    print("Clearing view cache on remote admin server...")
    stdin, stdout, stderr = client.exec_command(f"cd {remote_base} && php artisan view:clear")
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print("Output:", out)
    if err:
        print("Error:", err)

    client.close()
    print("Deployment finished successfully!")

if __name__ == '__main__':
    deploy()
