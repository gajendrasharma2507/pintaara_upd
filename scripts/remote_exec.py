import paramiko
import sys

def run():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('145.79.210.26', port=65002, username='u573062443', password='Prayosha@2024', timeout=20)
    
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'echo OK'
    stdin, stdout, stderr = ssh.exec_command(f'cd /home/u573062443/pintaara_api && {cmd}')
    out = stdout.read().decode()
    err = stderr.read().decode()
    print("STDOUT:\n" + out)
    if err:
        print("STDERR:\n" + err)
    ssh.close()

if __name__ == '__main__':
    run()
