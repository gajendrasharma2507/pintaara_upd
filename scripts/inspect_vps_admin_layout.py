import paramiko
import os

VPS_HOST = "145.79.209.237"
VPS_PORT = 65002
VPS_USER = "u573062443"
VPS_PASS = os.environ['SSH_PASSWORD']
REMOTE_PATH = "/home/u573062443/domains/admin.pintaara.com/resources/views/layouts/admin.blade.php"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=15)

stdin, stdout, stderr = ssh.exec_command(f'grep -n "compatibility" {REMOTE_PATH} -C 5')
out = stdout.read().decode()
print("MATCHES:\n", out)

ssh.close()
