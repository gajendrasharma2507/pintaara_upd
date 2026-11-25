import os
import json
import paramiko
import urllib.request

def deploy():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.getenv('SSH_PASSWORD', 'Prayosha@2026')
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {host}:{port}...")
    client.connect(host, port=port, username=user, password=password, timeout=30)
    print("SSH Connected.")

    sftp = client.open_sftp()

    files = [
        ("backend/app/Services/JewelryPricingService.php", 
         f"{remote_base}/app/Services/JewelryPricingService.php"),
        ("backend/app/Http/Controllers/Api/GoldRateApiController.php", 
         f"{remote_base}/app/Http/Controllers/Api/GoldRateApiController.php"),
        ("backend/app/Http/Controllers/Admin/AdminWebController.php", 
         f"{remote_base}/app/Http/Controllers/Admin/AdminWebController.php"),
        ("backend/resources/views/admin/gold-rates/index.blade.php", 
         f"{remote_base}/resources/views/admin/gold-rates/index.blade.php"),
        ("backend/resources/views/layouts/admin.blade.php", 
         f"{remote_base}/resources/views/layouts/admin.blade.php"),
    ]

    for local, remote in files:
        print(f"Uploading {local} -> {remote}...")
        sftp.put(local, remote)
        print(f"  ✓ Uploaded {local}.")

    sftp.close()

    print("Clearing view, route and config caches on VPS...")
    cmd = f"cd {remote_base} && php artisan view:clear && php artisan route:clear && php artisan config:clear && php artisan cache:clear"
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print("Artisan Output:", out)
    if err:
        print("Artisan Error:", err)

    client.close()
    print("Files deployed to Hostinger VPS successfully!")

    print("\nVerifying live API https://admin.pintaara.com/api/gold-rate/today ...")
    try:
        req = urllib.request.Request(
            'https://admin.pintaara.com/api/gold-rate/today?fresh=1',
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode('utf-8'))
            print("API Response Status:", data.get('status'))
            print("Gold Rate CAP:", data.get('gold_cap'))
            print("Silver Rate CAP:", data.get('silver_cap'))
            print("22KT / g:", data.get('gold_22kt_rate_per_gram'))
            print("18KT / g:", data.get('gold_18kt_rate_per_gram'))
            print("14KT / g:", data.get('gold_14kt_rate_per_gram'))
            print("92.5% Silver / g:", data.get('silver_925_per_gram'))
    except Exception as e:
        print("API verification error:", e)

if __name__ == '__main__':
    deploy()
