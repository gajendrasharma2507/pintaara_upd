import paramiko
import os
import json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com/public_html && php artisan tinker --execute="echo json_encode(App\\Models\\Product::find(2)->compatibility_matrix);" """
stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode()
err = stderr.read().decode()
print("Out len:", len(out))
if out:
    try:
        data = json.loads(out.strip())
        print("14KT sizes in DB:", data.get('14KT', {}).get('options', {}).get('3'))
    except Exception as e:
        print("Raw out:", out[:200])
if err:
    print("Err:", err)
client.close()
