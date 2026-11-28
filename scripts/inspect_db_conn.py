import os
import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=20)

    cmds = [
        "cat /home/u573062443/domains/admin.pintaara.com/.env | grep DB_",
        "crontab -l || true",
        "mysql -u u573062443_admin -p'&oTbwZGvjR;2' -h 127.0.0.1 -e 'SHOW DATABASES;' || true",
        "mysql -u u573062443_admin -p'&oTbwZGvjR;2' -h localhost -e 'SHOW DATABASES;' || true",
        "ps aux | grep php || true",
    ]

    for cmd in cmds:
        print(f"\n--- Running: {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out:
            print(out)
        if err:
            print("ERR:", err)

    client.close()

if __name__ == '__main__':
    run()
