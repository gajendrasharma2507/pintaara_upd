import os
import paramiko

def run():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.environ['SSH_PASSWORD']

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=20)

    cmds = [
        "ls -la /home/u573062443/domains/admin.pintaara.com/public/images",
        "ls -la /home/u573062443/domains/admin.pintaara.com/public_html/images",
        "ls -la /home/u573062443/domains/admin.pintaara.com/public_html/images/uploads || true",
        "ls -la /home/u573062443/domains/admin.pintaara.com/public/images/uploads || true",
    ]

    for cmd in cmds:
        print(f"\n--- Running: {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        if out:
            print(out)
        if err:
            print("ERR:", err)

    client.close()

if __name__ == '__main__':
    run()
