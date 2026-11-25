import os
import paramiko

def run():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.getenv('SSH_PASSWORD', 'Prayosha@2026')

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=20)

    stdin, stdout, stderr = client.exec_command('php -r "echo \'upload_max_filesize: \' . ini_get(\'upload_max_filesize\') . PHP_EOL . \'post_max_size: \' . ini_get(\'post_max_size\') . PHP_EOL . \'memory_limit: \' . ini_get(\'memory_limit\') . PHP_EOL;"')
    print("PHP INI SETTINGS:\n" + stdout.read().decode())
    client.close()

if __name__ == '__main__':
    run()
