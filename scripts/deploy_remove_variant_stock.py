import os
import paramiko

def deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)
    sftp = client.open_sftp()
    
    remote_base = '/home/u573062443/domains/admin.pintaara.com'
    
    files = [
        ('backend/resources/views/admin/products/edit.blade.php', f'{remote_base}/resources/views/admin/products/edit.blade.php'),
        ('backend/resources/views/admin/products/create.blade.php', f'{remote_base}/resources/views/admin/products/create.blade.php'),
    ]
    
    for local_path, remote_path in files:
        print(f"Uploading {local_path} -> {remote_path}...")
        sftp.put(local_path, remote_path)
        
    cmd = f'cd {remote_base} && php artisan view:clear && php artisan cache:clear'
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Cache cleared:\n", stdout.read().decode())
    
    sftp.close()
    client.close()

if __name__ == '__main__':
    deploy()
