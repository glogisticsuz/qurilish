import paramiko
import sys

def deploy(hostname, username, password):
    print(f"Connecting to {hostname} as {username}...", flush=True)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname, username=username, password=password, timeout=10)
        print("Connected! Running deployment script...", flush=True)
        
        # Run the deployment script
        stdin, stdout, stderr = client.exec_command("cd /root/yangiUstalar && ./deploy.sh || cd /home/king/yangiUstalar && ./deploy.sh", get_pty=True)
        
        # Read output in real-time
        for line in iter(stdout.readline, ""):
            print(f"OUT: {line.strip()}", flush=True)
        
        for line in iter(stderr.readline, ""):
            print(f"ERR: {line.strip()}", flush=True)
            
        print("Finished deployment command.", flush=True)
        client.close()
        return True
    except Exception as e:
        print(f"Error connecting as {username}: {e}", flush=True)
        client.close()
        return False

hostname = "hamkorqurilish.uz"
password = "Damasmas_3434"

# Try root, king, ubuntu
if not deploy(hostname, "root", password):
    if not deploy(hostname, "king", password):
        if not deploy(hostname, "ubuntu", password):
            print("Could not deploy as root, king or ubuntu.", flush=True)
            sys.exit(1)
