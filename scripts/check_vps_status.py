import paramiko

def check():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    cmd = 'grep -n "Delivery" /home/u573062443/domains/admin.pintaara.com/resources/views/admin/products/edit.blade.php'
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Lines with Delivery:", stdout.read().decode())
    
    client.close()

if __name__ == '__main__':
    check()
