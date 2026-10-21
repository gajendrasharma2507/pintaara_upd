import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)

stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && sed -n "111,180p" seed_full_store.php')
print(stdout.read().decode('utf-8', errors='replace'))
ssh.close()
