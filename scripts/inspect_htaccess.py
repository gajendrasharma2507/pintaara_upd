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

    stdin, stdout, stderr = client.exec_command("cat /home/u573062443/domains/admin.pintaara.com/public_html/.htaccess")
    print("HTACCESS:\n" + stdout.read().decode())
    client.close()

if __name__ == '__main__':
    run()
