# Dependency Security Report

## Overview
This report provides an analysis of the backend dependency file (`requirements.txt`) to identify supply chain security risks, unmaintained libraries, and versioning best practices.

## Analyzed File
`requirements.txt`

### Current Dependencies
```text
fastapi
uvicorn[standard]
motor
passlib[bcrypt]
python-jose[cryptography]
pydantic
pydantic-settings
python-multipart
bcrypt
email-validator
fastapi-mail
```

## Findings

### 1. Missing Version Pinning (High Risk)
**Issue:** None of the packages in `requirements.txt` specify exact versions (e.g., `fastapi==0.103.1`).
**Impact:** 
- **Supply Chain Attacks:** If a malicious update is published for a package (e.g., typosquatting or compromised maintainer), the deployment process will automatically fetch the latest, potentially malicious, version.
- **Stability:** Breaking changes in upstream libraries will break the application unexpectedly.
**Recommendation:** 
Pin all dependencies to specific known-good versions. Use a lockfile management tool such as `pip-compile` (from `pip-tools`), `Poetry`, or `Pipenv` to lock both direct and transitive dependencies securely.

### 2. Deprecated / Unmaintained Libraries (Medium Risk)
**Issue:** The project uses `passlib[bcrypt]`.
**Impact:** `passlib` is an unmaintained project and has not received significant updates in years. Continuing to use unmaintained cryptographic wrappers can lead to unpatched vulnerabilities.
**Recommendation:**
Since `bcrypt` is already listed as a direct dependency, replace the usage of `passlib` entirely with direct `bcrypt` calls for password hashing and verification. The `core/security.py` file already seems to use `bcrypt` directly, making `passlib` redundant and safe to remove.

## Recommended `requirements.txt` Structure
*Example of a securely pinned requirements file (versions should be audited for the latest secure releases):*

```text
fastapi==0.103.1
uvicorn[standard]==0.23.2
motor==3.3.1
python-jose[cryptography]==3.3.0
pydantic==2.4.2
pydantic-settings==2.0.3
python-multipart==0.0.6
bcrypt==4.0.1
email-validator==2.0.0.post2
fastapi-mail==1.4.1
```
