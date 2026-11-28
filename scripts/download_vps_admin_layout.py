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

# Download the remote admin.blade.php to inspect
sftp = ssh.open_sftp()
sftp.get(REMOTE_PATH, "scripts/vps_admin_layout.blade.php")
sftp.close()
ssh.close()
print("Downloaded vps_admin_layout.blade.php")
