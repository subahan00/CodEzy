import sys
import subprocess
import time
import json
import os

CODE_FILE = "/workspace/code.py"
INPUT_FILE = "/workspace/input.txt"

def run():
    input_data = ""
    try:
        if os.path.exists(INPUT_FILE):
            with open(INPUT_FILE, "r") as f:
                input_data = f.read()
    except Exception:
        pass

    start_time = time.time()

    try:
        # Execute user code with input piped to stdin
        # timeout=2s matches your JS timeout
        result = subprocess.run(
            ["python", CODE_FILE],
            input=input_data,
            text=True,
            capture_output=True,
            timeout=2 
        )
        
        duration = int((time.time() - start_time) * 1000)

        # Check for non-zero exit code (Runtime Error)
        if result.returncode != 0:
            print(json.dumps({
                "status": "RUNTIME_ERROR",
                "error": result.stderr,
                "time": duration
            }))
            return

        # Success
        print(json.dumps({
            "status": "OK",
            "output": result.stdout.strip(),
            "time": duration
        }))

    except subprocess.TimeoutExpired:
        duration = int((time.time() - start_time) * 1000)
        print(json.dumps({
            "status": "TLE",
            "time": duration
        }))

    except Exception as e:
        print(json.dumps({
            "status": "RUNTIME_ERROR",
            "error": str(e)
        }))

if __name__ == "__main__":
    run()