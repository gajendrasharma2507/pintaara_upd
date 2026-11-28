import os
import paramiko
import urllib.request
import json

def deploy_and_test():
    host = os.getenv('SSH_HOST', '145.79.209.237')
    port = int(os.getenv('SSH_PORT', '65002'))
    user = os.getenv('SSH_USER', 'u573062443')
    password = os.environ['SSH_PASSWORD']
    remote_base = '/home/u573062443/domains/admin.pintaara.com'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=30)
    sftp = client.open_sftp()

    local_file = "backend/app/Http/Controllers/Api/ProductApiController.php"
    remote_file = f"{remote_base}/app/Http/Controllers/Api/ProductApiController.php"
    print(f"Uploading {local_file} -> {remote_file}...")
    sftp.put(local_file, remote_file)
    sftp.close()

    print("Clearing cache on VPS...")
    client.exec_command(f"cd {remote_base} && php artisan route:clear && php artisan cache:clear")
    client.close()

    print("Testing https://admin.pintaara.com/api/products/PD-PD-CS-002 ...")
    req = urllib.request.Request(
        'https://admin.pintaara.com/api/products/PD-PD-CS-002',
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        data = json.loads(res.read().decode('utf-8'))
        print("API Response Status:", data.get('status'))
        prod = data.get('data', {})
        print("Product ID:", prod.get('id'))
        print("Product Name:", prod.get('name'))
        print("Design Code:", prod.get('design_code'))
        print("Options Count:", len(prod.get('options', [])))
        print("Base Price Total:", prod.get('base_pricing', {}).get('total_price'))

if __name__ == '__main__':
    deploy_and_test()
