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
        "ls -la /home/u573062443/domains/admin.pintaara.com/public_html",
        "cat /home/u573062443/domains/admin.pintaara.com/public_html/index.php | head -n 30 || true",
        "ls -la /home/u573062443/domains/admin.pintaara.com/public",
        "php -r \"require '/home/u573062443/domains/admin.pintaara.com/vendor/autoload.php'; \\$app = require_once '/home/u573062443/domains/admin.pintaara.com/bootstrap/app.php'; echo 'public_path: ' . public_path() . PHP_EOL; echo 'base_path: ' . base_path() . PHP_EOL;\"",
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
