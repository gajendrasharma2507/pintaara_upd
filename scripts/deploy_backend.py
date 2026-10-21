import paramiko
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

files_to_upload = [
    (r"e:\MERN\Pintaara\backend\app\Console\Commands\SyncGoldRatesCommand.php", "/home/u573062443/pintaara_api/app/Console/Commands/SyncGoldRatesCommand.php"),
    (r"e:\MERN\Pintaara\backend\routes\console.php", "/home/u573062443/pintaara_api/routes/console.php"),
    (r"e:\MERN\Pintaara\backend\routes\api.php", "/home/u573062443/pintaara_api/routes/api.php"),
    (r"e:\MERN\Pintaara\backend\app\Http\Controllers\Api\GoldRateApiController.php", "/home/u573062443/pintaara_api/app/Http/Controllers/Api/GoldRateApiController.php"),
    (r"e:\MERN\Pintaara\backend\app\Services\JewelryPricingService.php", "/home/u573062443/pintaara_api/app/Services/JewelryPricingService.php"),
]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting SSH to Hostinger VPS (145.79.210.26)...")
ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=30)

# Ensure remote directories exist
sftp = ssh.open_sftp()
for d in ["/home/u573062443/pintaara_api/app/Console", "/home/u573062443/pintaara_api/app/Console/Commands"]:
    try:
        sftp.mkdir(d)
    except:
        pass

for local, remote in files_to_upload:
    if os.path.exists(local):
        print(f"Uploading {local} -> {remote}")
        sftp.put(local, remote)
        print("  ✓ Uploaded successfully.")
    else:
        print(f"  ✗ Local file not found: {local}")

sftp.close()

# Zero out offsets in live database to match Aarav Bullion 100% exactly
print("\nResetting gold and silver extra offsets to 0 on live server...")
reset_php = "require 'vendor/autoload.php'; $app = require_once 'bootstrap/app.php'; $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class); $kernel->bootstrap(); App\\Models\\Setting::set('gold_rate_extra_offset', 0, 'number'); App\\Models\\Setting::set('silver_rate_extra_offset', 0, 'number'); App\\Models\\Setting::set('gold_rate_min_floor', 0, 'number'); Illuminate\\Support\\Facades\\Cache::flush(); echo 'OFFSET_RESET_OK';"
stdin, stdout, stderr = ssh.exec_command(f'cd /home/u573062443/pintaara_api && php -r "{reset_php}"')
reset_out = stdout.read().decode('utf-8', errors='replace')
print("Reset output:", reset_out)

# Clear cache and run rates:sync on server
print("\nClearing Laravel config & application cache on live server...")
stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php artisan config:clear && php artisan cache:clear')
print(stdout.read().decode('utf-8', errors='replace'))

print("Running php artisan rates:sync --force on live server...")
stdin, stdout, stderr = ssh.exec_command('cd /home/u573062443/pintaara_api && php artisan rates:sync --force')
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("Output:\n", out)
if err:
    print("Stderr:\n", err)

# Check and update cron
print("\nVerifying live server cron job...")
stdin, stdout, stderr = ssh.exec_command('crontab -l')
crontab_content = stdout.read().decode('utf-8', errors='replace')
print("Current crontab:\n", crontab_content)

cron_cmd = "* * * * * cd /home/u573062443/pintaara_api && php artisan schedule:run >> /dev/null 2>&1"
if "schedule:run" not in crontab_content:
    print("Adding Laravel schedule:run cron job to crontab...")
    new_cron = (crontab_content.strip() + "\n" + cron_cmd + "\n").strip() + "\n"
    stdin, stdout, stderr = ssh.exec_command(f'echo "{new_cron}" | crontab -')
    print("Crontab updated!")
else:
    print("✓ Laravel scheduler cron is already configured and active.")

ssh.close()
print("\n✓ Live deployment completed successfully!")
