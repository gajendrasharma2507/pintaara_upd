import os
import paramiko

def deploy():
    files_to_upload = [
        ('backend/resources/views/admin/product-options/index.blade.php', '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/product-options/index.blade.php'),
        ('backend/resources/views/admin/products/edit.blade.php', '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/products/edit.blade.php'),
        ('backend/resources/views/admin/products/create.blade.php', '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/products/create.blade.php'),
        ('backend/app/Http/Controllers/Admin/AdminOptionController.php', '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Admin/AdminOptionController.php')
    ]

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to Hostinger VPS...")
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=30)

    sftp = client.open_sftp()
    for local_path, remote_path in files_to_upload:
        print(f"Uploading {local_path} -> {remote_path}...")
        sftp.put(local_path, remote_path)
    sftp.close()

    print("Clearing view and cache...")
    stdin, stdout, stderr = client.exec_command('cd /home/u573062443/domains/admin.pintaara.com && php artisan view:clear && php artisan cache:clear')
    print("Artisan output:\n" + stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("Artisan stderr:\n" + err)

    print("Verifying view render...")
    stdin, stdout, stderr = client.exec_command('cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="echo view(\'admin.product-options.index\', [\'groups\' => \App\Models\ProductOptionGroup::with(\'values\')->get()])->render();"')
    output = stdout.read().decode()
    if "Option Groups" in output:
        print("SUCCESS: admin.product-options.index rendered successfully!")
    else:
        print("Output preview:\n" + output[:500])

    client.close()

if __name__ == '__main__':
    deploy()
