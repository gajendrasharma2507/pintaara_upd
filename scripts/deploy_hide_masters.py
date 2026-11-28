import os
import paramiko

def deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)
    sftp = client.open_sftp()
    
    remote_base = '/home/u573062443/domains/admin.pintaara.com'
    
    files = [
        ('backend/resources/views/layouts/admin.blade.php', f'{remote_base}/resources/views/layouts/admin.blade.php'),
        ('backend/resources/views/admin/dashboard.blade.php', f'{remote_base}/resources/views/admin/dashboard.blade.php'),
        ('backend/routes/web.php', f'{remote_base}/routes/web.php'),
    ]
    
    for local_path, remote_path in files:
        print(f"Uploading {local_path} -> {remote_path}...")
        sftp.put(local_path, remote_path)
        
    cmd = f'cd {remote_base} && php artisan view:clear && php artisan config:clear && php artisan route:clear && php artisan cache:clear'
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Cache cleared:\n", stdout.read().decode())
    
    # Test curl on /admin/masters from VPS
    cmd_test = 'curl -s -o /dev/null -w "%{http_code}" -I "https://admin.pintaara.com/admin/masters"'
    stdin, stdout, stderr = client.exec_command(cmd_test)
    print("Direct /admin/masters status code:", stdout.read().decode())
    
    sftp.close()
    client.close()

if __name__ == '__main__':
    deploy()
