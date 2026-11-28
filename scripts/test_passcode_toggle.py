import os
import paramiko
import json
import urllib.request

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

# Set to 0 (Disabled)
_, stdout, _ = c.exec_command('cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="App\\Models\\Setting::set(\'storefront_password_enabled\', \'0\');"')
stdout.channel.recv_exit_status()

# Fetch endpoint
req = urllib.request.urlopen('https://admin.pintaara.com/api/storefront/passcode-status')
res_disabled = json.loads(req.read().decode())
print("When set to 0 -> Response:", res_disabled)

# Restore to 1 (Enabled)
_, stdout2, _ = c.exec_command('cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="App\\Models\\Setting::set(\'storefront_password_enabled\', \'1\');"')
stdout2.channel.recv_exit_status()

req2 = urllib.request.urlopen('https://admin.pintaara.com/api/storefront/passcode-status')
res_enabled = json.loads(req2.read().decode())
print("When set to 1 -> Response:", res_enabled)

c.close()
