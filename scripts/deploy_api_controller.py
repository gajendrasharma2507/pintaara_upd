import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

sftp = client.open_sftp()
local_path = 'backend/app/Http/Controllers/Api/ProductApiController.php'
remote_path = '/home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Api/ProductApiController.php'

sftp.put(local_path, remote_path)
sftp.close()

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php artisan view:clear && php artisan cache:clear && php -l app/Http/Controllers/Api/ProductApiController.php"""
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print("ERR:", stderr.read().decode('utf-8', errors='replace'))
client.close()
print("DEPLOYED ProductApiController.php successfully!")
