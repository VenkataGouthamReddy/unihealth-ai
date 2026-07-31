# Secure Code Review & Developer Guidance

This document provides developer guidance for the vulnerabilities identified during the Secure Code Review. For each issue, the root cause is explained, the vulnerable code is identified, and a secure replacement is provided along with the rationale.

---

## 1. Predictable OTP Generation

**File:** `routers/auth.py` (Endpoints: `/send-otp`, `/forgot-password`)
**Severity:** Critical

### Why it matters
The application generates One-Time Passwords (OTPs) using Python's standard `random` module. The `random` module is designed for statistical modeling and games, not cryptography. Its output is deterministic and can be predicted if an attacker observes a few outputs, allowing them to forge OTPs and bypass 2FA/Registration checks.

### Vulnerable Code
```python
# Generate 6-digit OTP
otp = str(random.randint(100000, 999999))
```

### Secure Replacement
```python
import secrets

# Generate cryptographically secure 6-digit OTP
otp = str(secrets.randbelow(900000) + 100000)
```

### Why the new implementation is safer
The `secrets` module uses the operating system's cryptographic pseudo-random number generator (CSPRNG). This ensures that the generated values are unpredictable and cannot be mathematically inferred, securing the authentication workflow.

---

## 2. Insecure Direct Object Reference (IDOR) & Missing Authorization

**File:** `routers/appointments.py` (and similarly in `prescriptions.py`, `alerts.py`, `reports.py`)
**Severity:** Critical

### Why it matters
Many endpoints accept parameters like `student_email` or `appointment_id` but do not verify that the user making the request is actually authorized to access or modify that specific resource. An attacker can simply change the ID in the request URL or body to interact with other users' data.

### Vulnerable Code (Example)
```python
@router.get("/student/{student_email}", response_model=List[dict])
async def get_student_appointments(student_email: str):
    today = date_type.today()
    appointments = await db.db["appointments"].find({"student_id": student_email}).to_list(100)
    # ...
```

### Secure Replacement
```python
from routers.auth import get_current_user

@router.get("/student/{student_email}", response_model=List[dict])
async def get_student_appointments(
    student_email: str, 
    current_user: dict = Depends(get_current_user)
):
    # Enforce authorization: Ensure the requester is the student or an admin
    if current_user.get("role") != "admin" and current_user.get("email") != student_email:
        raise HTTPException(status_code=403, detail="Not authorized to view these records")

    today = date_type.today()
    appointments = await db.db["appointments"].find({"student_id": student_email}).to_list(100)
    # ...
```

### Why the new implementation is safer
By injecting `current_user: dict = Depends(get_current_user)`, FastAPI automatically validates the JWT token. The subsequent check ensures that the user is explicitly authorized to view the requested data, completely preventing IDOR.

---

## 3. Password Verification Bypass Fallback

**File:** `core/security.py` (Function: `verify_password`)
**Severity:** High

### Why it matters
The `verify_password` function includes a fallback mechanism `return plain_password == str(hashed_password)` that triggers if the hashed string doesn't start with bcrypt prefixes or if an exception is thrown. If an attacker passes the exact bcrypt hash as their *plain password*, and manages to trigger this fallback, the system will log them in without actually validating the hash securely.

### Vulnerable Code
```python
    except Exception as e:
        print(f"Password verification fallback check: {e}")
        return plain_password == str(hashed_password)
```

### Secure Replacement
```python
    except Exception as e:
        print(f"Password verification failed: {e}")
        return False # Never fallback to plain text comparison!
```

### Why the new implementation is safer
Removing the fallback ensures that only correctly verified bcrypt hashes are treated as valid passwords, preventing potential bypass attacks during edge-cases or malformed inputs.

---

## 4. Hardcoded Secret Key

**File:** `core/config.py`
**Severity:** High

### Why it matters
The `SECRET_KEY` is used to cryptographically sign JWT tokens. Because it is hardcoded in the source code, anyone who gains access to the repository (or an exposed `.pyc` file) can forge tokens for any user (including admins) and completely compromise the system.

### Vulnerable Code
```python
class Settings(BaseSettings):
    # ...
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
```

### Secure Replacement
```python
import os

class Settings(BaseSettings):
    # ...
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION")
```
*Note: Ensure that production environments enforce a strong, randomly generated environment variable for `SECRET_KEY`.*

### Why the new implementation is safer
Relying on environment variables keeps sensitive credentials out of version control and separates code from configuration, adhering to the principles of the Twelve-Factor App.

---

## 5. Unvalidated File Uploads

**File:** `routers/auth.py` (Endpoint: `/upload-profile-picture`)
**Severity:** Medium

### Why it matters
The endpoint trusts the file extension provided by the user `file.filename.split(".")[-1]`. An attacker can upload a file named `../../../etc/passwd` or `malicious.sh`. While the system names the file after the `_id`, trusting untrusted extensions and missing content-type validation is dangerous and can lead to path traversal or stored malicious payloads.

### Vulnerable Code
```python
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    file_name = f"{current_user['_id']}.{file_extension}"
    file_path = f"static/profiles/{file_name}"
```

### Secure Replacement
```python
import os
from werkzeug.utils import secure_filename

@router.post("/upload-profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # ...
    # 1. Validate MIME Type
    allowed_mimes = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_mimes:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # 2. Sanitize Extension
    safe_filename = secure_filename(file.filename)
    file_extension = safe_filename.split(".")[-1] if "." in safe_filename else "jpg"
    
    if file_extension.lower() not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Invalid extension")

    file_name = f"{current_user['_id']}.{file_extension}"
    file_path = os.path.join("static", "profiles", file_name)
    # ...
```

### Why the new implementation is safer
This replacement introduces strict MIME-type validation, sanitizes the user-provided filename using `secure_filename` (which strips out malicious path characters like `../`), and safely joins paths using `os.path.join`, heavily mitigating path traversal and malicious file upload risks.
