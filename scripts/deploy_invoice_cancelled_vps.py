import os
import paramiko

FILES = [
    ('backend/resources/views/admin/orders/partials/invoice_sheet.blade.php',
     '/home/u573062443/domains/admin.pintaara.com/resources/views/admin/orders/partials/invoice_sheet.blade.php'),
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
php artisan view:clear
"""
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))

client.close()
print("Deployed invoice_sheet to VPS successfully!")
