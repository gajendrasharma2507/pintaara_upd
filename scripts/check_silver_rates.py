import os
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)
stdin, stdout, stderr = c.exec_command("cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute=\"echo json_encode(app(App\\Services\\JewelryPricingService::class)->getAllPurityRates());\"")
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print("ERR:", err)
c.close()
