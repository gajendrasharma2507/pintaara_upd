import os
import paramiko

FILES_TO_UPLOAD = [
    ('backend/database/migrations/2026_11_21_000001_add_soft_deletes_to_orders_table.php',
     '/home/u573062443/domains/admin.pintaara.com/database/migrations/2026_11_21_000001_add_soft_deletes_to_orders_table.php'),
    ('backend/app/Models/Order.php',
     '/home/u573062443/domains/admin.pintaara.com/app/Models/Order.php'),
    ('backend/app/Http/Controllers/Admin/AdminWebController.php',
     '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Admin/AdminWebController.php'),
    ('backend/app/Http/Controllers/Api/OrderApiController.php',
     '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Api/OrderApiController.php'),
    ('backend/app/Http/Controllers/Api/Admin/AdminCustomerApiController.php',
     '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Api/Admin/AdminCustomerApiController.php'),
    ('backend/routes/web.php',
     '/home/u573062443/domains/admin.pintaara.com/routes/web.php'),
    ('backend/routes/api.php',
     '/home/u573062443/domains/admin.pintaara.com/routes/api.php'),
    ('backend/resources/views/admin/orders/index.blade.php',
     '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/orders/index.blade.php'),
    ('backend/resources/views/admin/orders/show.blade.php',
     '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/orders/show.blade.php'),
    ('backend/resources/views/admin/customers/index.blade.php',
     '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/customers/index.blade.php'),
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=30)

sftp = client.open_sftp()
for local, remote in FILES_TO_UPLOAD:
    print(f"Uploading {local} -> {remote}...")
    sftp.put(local, remote)
sftp.close()

cmd = """
cd /home/u573062443/domains/admin.pintaara.com
php artisan migrate --force
php artisan route:clear
php artisan config:clear
php artisan view:clear
php -l app/Models/Order.php
php -l app/Http/Controllers/Admin/AdminWebController.php
php -l app/Http/Controllers/Api/OrderApiController.php
php -l app/Http/Controllers/Api/Admin/AdminCustomerApiController.php
"""
stdin, stdout, stderr = client.exec_command(cmd)
print("STDOUT:")
print(stdout.read().decode('utf-8', errors='replace'))
print("STDERR:")
print(stderr.read().decode('utf-8', errors='replace'))

client.close()
print("Done!")
