import paramiko

def test_urls():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    urls = [
        'https://admin.pintaara.com/login',
        'https://www.pintaara.com/',
        'https://www.pintaara.com/collection/pendant',
        'https://www.pintaara.com/collection/PD-PD-CS-002',
    ]
    for url in urls:
        cmd = f'curl -s -o /dev/null -w "%{{http_code}}" -L "{url}"'
        stdin, stdout, stderr = client.exec_command(cmd)
        code = stdout.read().decode().strip()
        print(f'{url} -> HTTP {code}')
        
    client.close()

if __name__ == '__main__':
    test_urls()
