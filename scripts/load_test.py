import time
import urllib.request
import urllib.error
import threading
import statistics
import ssl
from concurrent.futures import ThreadPoolExecutor

# Configuration
TARGET_URL = "http://127.0.0.1:8000/public/stats"
VIRTUAL_USERS = 100
DURATION_SECONDS = 60

# Shared state
response_times = []
errors = 0
lock = threading.Lock()
is_running = True

# Disable SSL verification for local testing if needed
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def virtual_user_task():
    global errors
    while is_running:
        start_time = time.time()
        try:
            req = urllib.request.Request(TARGET_URL)
            # Add timeout to prevent hanging forever
            with urllib.request.urlopen(req, timeout=5, context=ctx) as response:
                response.read()
            elapsed_ms = (time.time() - start_time) * 1000
            
            with lock:
                response_times.append(elapsed_ms)
        except Exception as e:
            with lock:
                errors += 1

def run_load_test():
    global is_running
    print(f"Starting Baseline Load Test...")
    print(f"Target URL: {TARGET_URL}")
    print(f"Virtual Users: {VIRTUAL_USERS}")
    print(f"Duration: {DURATION_SECONDS} seconds")
    print("-" * 40)
    
    start_time = time.time()
    
    # Start virtual users
    with ThreadPoolExecutor(max_workers=VIRTUAL_USERS) as executor:
        futures = [executor.submit(virtual_user_task) for _ in range(VIRTUAL_USERS)]
        
        # Run for the specified duration
        time.sleep(DURATION_SECONDS)
        
        # Stop the test
        is_running = False
        print("Stopping test and calculating results...\n")
        
    actual_duration = time.time() - start_time
    
    # Calculate statistics
    total_requests = len(response_times)
    rps = total_requests / actual_duration if actual_duration > 0 else 0
    
    if total_requests > 0:
        avg_time = statistics.mean(response_times)
        min_time = min(response_times)
        max_time = max(response_times)
    else:
        avg_time = min_time = max_time = 0

    print("=== Load Test Results ===")
    print(f"Total Requests Completed: {total_requests}")
    print(f"Total Errors: {errors}")
    print(f"Actual Duration: {actual_duration:.2f} seconds")
    print("-" * 40)
    print("What you will see")
    print(f"Requests per second (RPS): {rps:.2f} req/sec")
    print("-" * 40)
    print("Response Time")
    print(f"Average: {avg_time:.2f}ms")
    print(f"Min: {min_time:.2f}ms")
    print(f"Max: {max_time:.2f}ms")

if __name__ == "__main__":
    run_load_test()
