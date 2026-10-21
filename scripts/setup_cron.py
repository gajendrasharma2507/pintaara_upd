import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=15)

cron_content = "* * * * * cd /home/u573062443/pintaara_api && php artisan schedule:run >> /dev/null 2>&1\n"

sftp = ssh.open_sftp()
with sftp.file('/home/u573062443/mycron.txt', 'w') as f:
    f.write(cron_content)
sftp.close()

stdin, stdout, stderr = ssh.exec_command('crontab /home/u573062443/mycron.txt && crontab -l')
out = stdout.read().decode('utf-8')
err = stderr.read().decode('utf-8')
print("Crontab Output:\n", out)
if err:
    print("Stderr:\n", err)

ssh.close()
