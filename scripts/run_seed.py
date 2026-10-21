import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=60)

stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php seed_full_store.php')
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("OUTPUT:\n", out)
if err:
    print("ERROR:\n", err)

ssh.close()
