import paramiko
import os

VPS_HOST = '145.79.209.237'
VPS_PORT = 65002
VPS_USER = 'u573062443'
VPS_PASS = os.environ['SSH_PASSWORD']
REMOTE_BASE = '/home/u573062443/domains/admin.pintaara.com'

files_to_sync = [
    ('backend/app/Services/SequelLogisticsService.php', 'app/Services/SequelLogisticsService.php'),
    ('backend/app/Http/Controllers/Api/SequelApiController.php', 'app/Http/Controllers/Api/SequelApiController.php'),
    ('backend/app/Http/Controllers/Admin/AdminWebController.php', 'app/Http/Controllers/Admin/AdminWebController.php'),
    ('backend/config/services.php', 'config/services.php'),
    ('backend/routes/web.php', 'routes/web.php'),
    ('backend/resources/views/admin/settings/index.blade.php', 'resources/views/admin/settings/index.blade.php'),
    ('backend/resources/views/admin/orders/show.blade.php', 'resources/views/admin/orders/show.blade.php'),
]

def main():
    print(f"Connecting to VPS {VPS_HOST}:{VPS_PORT} as {VPS_USER}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
    sftp = ssh.open_sftp()

    for local_rel, remote_rel in files_to_sync:
        local_path = os.path.abspath(local_rel)
        remote_path = f"{REMOTE_BASE}/{remote_rel}".replace('\\', '/')
        
        # Ensure remote directory exists
        remote_dir = os.path.dirname(remote_path)
        try:
            sftp.stat(remote_dir)
        except IOError:
            print(f"Creating directory {remote_dir}...")
            ssh.exec_command(f"mkdir -p {remote_dir}")
        
        print(f"Uploading {local_rel} -> {remote_path}...")
        sftp.put(local_path, remote_path)

    sftp.close()

    print("Clearing view and route caches on VPS...")
    commands = [
        f"cd {REMOTE_BASE} && php artisan view:clear",
        f"cd {REMOTE_BASE} && php artisan route:clear",
        f"cd {REMOTE_BASE} && php artisan config:clear",
        f"cd {REMOTE_BASE} && php artisan cache:clear",
    ]
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8').strip()
        err = stderr.read().decode('utf-8').strip()
        print(f"CMD: {cmd}")
        if out: print(f"OUT: {out}")
        if err: print(f"ERR: {err}")

    ssh.close()
    print("Sequel 247 Logistics successfully deployed to VPS!")

if __name__ == '__main__':
    main()
