import os
import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=20)

    # Replace DB_HOST=srv1988.hstgr.io with DB_HOST=127.0.0.1 in .env
    cmd = """
sed -i 's/DB_HOST=srv1988.hstgr.io/DB_HOST=127.0.0.1/g' /home/u573062443/domains/admin.pintaara.com/.env
cd /home/u573062443/domains/admin.pintaara.com && php artisan config:clear && php artisan cache:clear
grep DB_ /home/u573062443/domains/admin.pintaara.com/.env
"""
    stdin, stdout, stderr = client.exec_command(cmd)
    print("OUTPUT:\n" + stdout.read().decode())
    print("ERR:\n" + stderr.read().decode())
    client.close()

if __name__ == '__main__':
    run()
