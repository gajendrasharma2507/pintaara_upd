import os
import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=20)

    sftp = client.open_sftp()
    with sftp.file('/home/u573062443/domains/admin.pintaara.com/test_pdo.php', 'w') as f:
        f.write("""<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=u573062443_admin;charset=utf8mb4', 'u573062443_admin', '&oTbwZGvjR;2');
    $stmt = $pdo->query('SELECT COUNT(*) FROM design_logs');
    echo 'DESIGN LOGS: ' . $stmt->fetchColumn() . PHP_EOL;
    $stmt2 = $pdo->query('SELECT COUNT(*) FROM users');
    echo 'USERS: ' . $stmt2->fetchColumn() . PHP_EOL;
} catch (Throwable $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}
""")
    sftp.close()

    stdin, stdout, stderr = client.exec_command('php /home/u573062443/domains/admin.pintaara.com/test_pdo.php')
    print("OUTPUT:\n" + stdout.read().decode())
    print("ERR:\n" + stderr.read().decode())

    client.exec_command('rm -f /home/u573062443/domains/admin.pintaara.com/test_pdo.php')
    client.close()

if __name__ == '__main__':
    run()
