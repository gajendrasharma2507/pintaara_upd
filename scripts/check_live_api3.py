import paramiko

def check_api():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    cmd = 'curl -s "https://admin.pintaara.com/api/v1/products/PD-PD-CS-002"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    print("API Response (first 500 chars):", out[:500])
    client.close()

if __name__ == '__main__':
    check_api()
