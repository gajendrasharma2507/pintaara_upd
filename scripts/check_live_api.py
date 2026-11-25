import paramiko

def check_api():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    cmd = 'curl -s "https://admin.pintaara.com/api/v1/products/2"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    print("API product 2 custom_sections in out?", "custom_sections" in out)
    if "custom_sections" in out:
        import json
        data = json.loads(out)
        print("custom_sections:", data.get('data', {}).get('custom_sections'))
        print("description:", data.get('data', {}).get('description'))
        print("delivery_return:", data.get('data', {}).get('delivery_return'))
        
    client.close()

if __name__ == '__main__':
    check_api()
