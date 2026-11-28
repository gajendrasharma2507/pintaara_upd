import os
import paramiko

FILES = [
    ('backend/database/migrations/2026_11_21_000002_add_image_to_order_items_table.php',
     '/home/u573062443/domains/admin.pintaara.com/database/migrations/2026_11_21_000002_add_image_to_order_items_table.php'),
    ('backend/app/Models/OrderItem.php',
     '/home/u573062443/domains/admin.pintaara.com/app/Models/OrderItem.php'),
    ('backend/app/Http/Controllers/Admin/AdminWebController.php',
     '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Admin/AdminWebController.php'),
    ('backend/app/Http/Controllers/Api/OrderApiController.php',
     '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Api/OrderApiController.php'),
    ('backend/routes/web.php',
     '/home/u573062443/domains/admin.pintaara.com/routes/web.php'),
    ('backend/resources/views/admin/orders/show.blade.php',
     '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/orders/show.blade.php'),
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

sftp = client.open_sftp()
for local, remote in FILES:
    print(f"Uploading {local} -> {remote}...")
    sftp.put(local, remote)
sftp.close()

cmd = """
cd /home/u573062443/domains/admin.pintaara.com
php artisan migrate --force
php artisan route:clear
php artisan config:clear
php artisan view:clear
php -l app/Models/OrderItem.php
php -l app/Http/Controllers/Admin/AdminWebController.php
php -l app/Http/Controllers/Api/OrderApiController.php
"""
stdin, stdout, stderr = client.exec_command(cmd)
print("STDOUT:")
print(stdout.read().decode('utf-8', errors='replace'))
print("STDERR:")
print(stderr.read().decode('utf-8', errors='replace'))

client.close()
print("Deployed successfully!")
