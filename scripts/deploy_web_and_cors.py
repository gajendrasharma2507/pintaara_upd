import paramiko
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting SSH to Hostinger server...")
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=30)

sftp = ssh.open_sftp()

files_to_upload = [
    (r"e:\MERN\p1.0\backend\routes\web.php", "/home/u573062443/pintaara_api/routes/web.php"),
    (r"e:\MERN\p1.0\backend\config\cors.php", "/home/u573062443/pintaara_api/config/cors.php"),
]

for local, remote in files_to_upload:
    print(f"Uploading {local} -> {remote}")
    sftp.put(local, remote)
    print("  ✓ Uploaded successfully.")

sftp.close()

# Clear route and config cache on the live server
print("\nClearing route & config cache on live server...")
stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php artisan route:clear && php artisan config:clear && php artisan cache:clear')
print(stdout.read().decode('utf-8', errors='replace'))
err = stderr.read().decode('utf-8', errors='replace')
if err:
    print("Stderr:", err)

ssh.close()
print("✓ Live server updated successfully!")
