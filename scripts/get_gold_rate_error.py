import os
import paramiko

def check_log():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.getenv('SSH_PASSWORD', 'Prayosha@2026')
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)

    # Grep for local.ERROR and get 15 lines of context
    cmd = f"grep -n -C 5 'ERROR' {remote_base}/storage/logs/laravel.log | tail -n 40"
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    print("=== LATEST ERROR ===")
    print(out)

    client.close()

if __name__ == '__main__':
    check_log()
