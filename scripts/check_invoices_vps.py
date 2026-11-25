import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
cmd = 'cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="echo json_encode([\'setting\' => \\App\\Models\\Setting::get(\'invoice_prefix\'), \'orders\' => \\App\\Models\\Order::withTrashed()->get()]);"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print(stdout.read().decode())
print(stderr.read().decode())
ssh.close()
