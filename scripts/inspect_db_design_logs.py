import os
import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=20)

    sftp = client.open_sftp()
    with sftp.file('/home/u573062443/domains/admin.pintaara.com/query_logs.php', 'w') as f:
        f.write("""<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=u573062443_admin;charset=utf8mb4', 'u573062443_admin', '&oTbwZGvjR;2');
$stmt = $pdo->query('SELECT id, product_id, design_code, design_type FROM design_logs');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']} | product_id: " . var_export($row['product_id'], true) . " | design_code: {$row['design_code']} | type: {$row['design_type']}\n";
}
""")
    sftp.close()

    stdin, stdout, stderr = client.exec_command('php /home/u573062443/domains/admin.pintaara.com/query_logs.php')
    print("OUTPUT:\n" + stdout.read().decode())

    client.exec_command('rm -f /home/u573062443/domains/admin.pintaara.com/query_logs.php')
    client.close()

if __name__ == '__main__':
    run()
