# Dependency & Software Composition Analysis (SCA) Report

## Inventory & Status

The `requirements.txt` file defines the core backend runtime dependencies for UniHealthAI.

| Package Name | Current Version | Status | Security / Maintenance Notes | Recommended Target Version |
| :--- | :--- | :--- | :--- | :--- |
| `fastapi` | Unpinned (latest ~0.111.0) | ⚠️ Unpinned | Unpinned dependencies can lead to non-deterministic builds. | `fastapi>=0.111.0` |
| `uvicorn[standard]` | Unpinned | ⚠️ Unpinned | Production ASGI server. Pin to stable version. | `uvicorn[standard]>=0.30.0` |
| `motor` | Unpinned | ⚠️ Unpinned | Async MongoDB driver (AsyncIOMotorClient). | `motor>=3.4.0` |
| `passlib[bcrypt]` | Unpinned | ℹ️ Deprecated warning | Passlib is unmaintained on newer Python versions; raw bcrypt or Argon2 recommended. | `bcrypt>=4.1.0` |
| `python-jose[cryptography]` | Unpinned | ℹ️ Maintenance Warning | `python-jose` lacks active updates; `pyjwt[crypto]` is safer. | `PyJWT[crypto]>=2.8.0` |
| `pydantic` | Unpinned | ✅ Active | Pydantic v2 support. | `pydantic>=2.7.0` |
| `pydantic-settings` | Unpinned | ✅ Active | Settings management. | `pydantic-settings>=2.2.0` |
| `python-multipart` | Unpinned | ⚠️ Security Advisory | Ensure version is >= 0.0.9 to mitigate multipart parsing denial of service. | `python-multipart>=0.0.9` |
| `bcrypt` | Unpinned | ✅ Active | Native password hashing library. | `bcrypt>=4.1.0` |
| `email-validator` | Unpinned | ✅ Active | Email syntax validation. | `email-validator>=2.1.0` |
| `fastapi-mail` | Unpinned | ✅ Active | Asynchronous email dispatch via FastMail. | `fastapi-mail>=1.4.0` |

---

## Recommended `requirements.txt` Pinning Specification

```text
fastapi>=0.111.0
uvicorn[standard]>=0.30.0
motor>=3.4.0
PyJWT[crypto]>=2.8.0
pydantic>=2.7.1
pydantic-settings>=2.2.1
python-multipart>=0.0.9
bcrypt>=4.1.2
email-validator>=2.1.1
fastapi-mail>=1.4.1
slowapi>=0.1.9
```

---

## License Compliance Audit
- All identified packages (`FastAPI`, `Motor`, `PyJWT`, `Bcrypt`, `Pydantic`) use permissive open-source licenses (**MIT** or **Apache-2.0**).
- No restrictive GPL / AGPL copyleft license risks detected in runtime dependencies.
