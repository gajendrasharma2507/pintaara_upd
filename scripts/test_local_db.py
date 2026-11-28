import os
import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=20)

    php_code = """<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=u573062443_admin;charset=utf8mb4', 'u573062443_admin', '&oTbwZGvjR;2');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->query('SELECT COUNT(*) as cnt FROM design_logs');
    echo 'Local 127.0.0.1 connected! Design logs count: ' . $stmt->fetchColumn() . PHP_EOL;
    $stmt2 = $pdo->query('SELECT COUNT(*) as cnt FROM users');
    echo 'Users count: ' . $stmt2->fetchColumn() . PHP_EOL;
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
"""
    stdin, stdout, stderr = client.exec_command(f'php -r "{php_code}"')
    out = stdout.read().decode()
    err = stderr.read().decode()
    print("STDOUT:\n" + out)
    print("STDERR:\n" + err)
    client.close()

if __name__ == '__main__':
    run()
