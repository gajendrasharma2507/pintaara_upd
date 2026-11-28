import os
import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=20)

    stdin, stdout, stderr = client.exec_command('grep "production.ERROR" -A 10 /home/u573062443/domains/admin.pintaara.com/storage/logs/laravel.log | tail -n 30')
    print("OUTPUT:\n" + stdout.read().decode())
    client.close()

if __name__ == '__main__':
    run()
