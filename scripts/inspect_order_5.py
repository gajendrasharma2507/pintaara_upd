import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)

cmd = "cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute='echo json_encode(optional(App\\Models\\Order::find(5))->toArray());'"

stdin, stdout, stderr = ssh.exec_command(cmd)
print("OUT:", stdout.read().decode('utf-8'))
print("ERR:", stderr.read().decode('utf-8'))
ssh.close()
