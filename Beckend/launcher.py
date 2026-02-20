import subprocess
import os
import sys
import time

def start_process(command, log_file):
    with open(log_file, 'w') as f:
        print(f"Starting {command} -> {log_file}")
        return subprocess.Popen(
            command,
            cwd='c:/Users/king/Desktop/yangiUstalar/Beckend',
            stdout=f,
            stderr=subprocess.STDOUT,
            shell=True
        )

if __name__ == "__main__":
    # Kill old processes first
    subprocess.run("taskkill /F /IM python.exe /T", shell=True)
    time.sleep(1)
    
    start_process("python bot.py", "bot_startup.log")
    start_process("python support_bot.py", "support_startup.log")
    start_process("uvicorn main:app --reload --host 0.0.0.0 --port 8000", "api_startup.log")
    
    print("Processes started. Checking logs in 5 seconds...")
    time.sleep(5)
    
    for log in ["bot_startup.log", "support_startup.log", "api_startup.log"]:
        if os.path.exists(log):
            with open(log, 'r') as f:
                content = f.read()
                print(f"--- {log} ---")
                print(content[-500:])
        else:
            print(f"Log file {log} not found!")
