import paramiko

def check_api():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    cmd = 'curl -s "https://admin.pintaara.com/api/products/PD-PD-CS-002"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    print("API Response custom_sections?", "custom_sections" in out)
    if "custom_sections" in out:
        import json
        data = json.loads(out)
        print("custom_sections:", data.get('data', {}).get('custom_sections'))
    client.close()

if __name__ == '__main__':
    check_api()
