import paramiko
import os

VPS_HOST = '145.79.209.237'
VPS_PORT = 65002
VPS_USER = 'u573062443'
VPS_PASS = 'Prayosha@2026'
REMOTE_BASE = '/home/u573062443/domains/admin.pintaara.com'

files_to_sync = [
    ('backend/app/Services/SequelLogisticsService.php', 'app/Services/SequelLogisticsService.php'),
    ('backend/config/services.php', 'config/services.php'),
    ('backend/resources/views/admin/settings/index.blade.php', 'resources/views/admin/settings/index.blade.php'),
    ('backend/resources/views/admin/orders/show.blade.php', 'resources/views/admin/orders/show.blade.php'),
]

def main():
    print(f"Connecting to VPS {VPS_HOST}:{VPS_PORT}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
    sftp = ssh.open_sftp()

    for local_rel, remote_rel in files_to_sync:
        local_path = os.path.abspath(local_rel)
        remote_path = f"{REMOTE_BASE}/{remote_rel}".replace('\\', '/')
        print(f"Uploading {local_rel} -> {remote_path}...")
        sftp.put(local_path, remote_path)

    sftp.close()

    print("Updating settings in database via artisan tinker...")
    tinker_code = (
        "App\\Models\\Setting::set('sequel_client_code', '31492');"
        "App\\Models\\Setting::set('sequel_store_code', 'PINTARA');"
        "App\\Models\\Setting::set('sequel_origin_pincode', '390001');"
        "App\\Models\\Setting::set('sequel_test_token', '7418b689f9b4fbf82c9f67588206fecc');"
        "App\\Models\\Setting::set('sequel_prod_token', 'e27b75bc3b396ee53d2349adae6884ed');"
        "App\\Models\\Setting::set('sequel_env', 'test');"
        "echo 'SETTINGS_UPDATED_SUCCESSFULLY';"
    )
    cmd = f'cd {REMOTE_BASE} && php artisan tinker --execute="{tinker_code}"'
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8').strip()
    print("Tinker OUT:", out)

    print("Clearing view and cache on VPS...")
    for c in ["php artisan view:clear", "php artisan config:clear", "php artisan cache:clear"]:
        ssh.exec_command(f"cd {REMOTE_BASE} && {c}")

    ssh.close()
    print("Sequel 247 Credentials Synced and Deployed Successfully!")

if __name__ == '__main__':
    main()
