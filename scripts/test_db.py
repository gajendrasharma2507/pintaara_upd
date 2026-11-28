import os
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'])

stdin, stdout, stderr = client.exec_command('sed -n "95,120p" /home/u573062443/domains/admin.pintaara.com/app/Http/Controllers/Api/PricingApiController.php')
print(stdout.read().decode())
client.close()
