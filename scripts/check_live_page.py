import os
import paramiko

def check_html():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)
    
    cmd = 'curl -s -L "https://www.pintaara.com/collection/PD-PD-CS-002" | grep -i "couldn\'t load"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    print("Match couldn't load:", out)
    
    cmd2 = 'curl -s -L "https://www.pintaara.com/collection/PD-PD-CS-002" | grep -i "atelier-info-sections"'
    stdin, stdout, stderr = client.exec_command(cmd2)
    print("Match atelier-info-sections:", stdout.read().decode())
    
    client.close()

if __name__ == '__main__':
    check_html()
