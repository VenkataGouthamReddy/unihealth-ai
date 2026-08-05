# Executive Architecture & Security Overview

## Project Profile
- **Application Name**: UniHealth AI (Healthcare Management & AI Consultation Platform)
- **Primary Backend Stack**: Python 3.11+, FastAPI (ASGI), MongoDB Motor (Async Driver), Pydantic v2
- **Architecture Pattern**: Decoupled Modular Monolith with Router-based Domain Controllers
- **Authentication**: Bearer JWT (OAuth2 Password flow) + Passlib/Bcrypt
- **Frontend Integration**: React + Vite SPA (served via FastAPI static mount in production)

---

## Security & Architecture Quality Scores

| Score Metric | Rating | Status | Key Highlights |
| :--- | :---: | :---: | :--- |
| **Security Hygiene** | **72 / 100** | ⚠️ Moderate Risk | Missing auth on notification/doctor schedule routes, BOLA risks on patient endpoints. |
| **Code Maintainability** | **85 / 100** | ✅ Good | Clean domain router separation, Pydantic data schemas, async database I/O. |
| **Dependency Health** | **80 / 100** | ✅ Good | Modern core dependencies (FastAPI, Motor, Pydantic v2), minor library upgrades recommended. |
| **CI/CD Quality Enforcement**| **90 / 100** | 🚀 Automated | GitHub Actions DevSecOps workflow integrated with Semgrep, Gitleaks, & Trivy. |

---

## Categorized SAST Vulnerability Summary

```
Total Identified Findings: 12
├── Critical : 5  (Access control omissions, BOLA vulnerabilities)
├── High     : 4  (CORS wildcarding, missing rate-limiting, missing role checks)
├── Medium   : 2  (Unsanitized regex queries, file upload size limits)
└── Low      : 1  (Default startup admin credentials)
```

---

## Top 3 High-Priority Refactoring Recommendations

1. **Enforce Global & Path-Level Authorization Guardrails**:
   Add authentication (`Depends(get_current_user)`) and BOLA checks (`current_user['email'] == student_email`) across `routers/notifications.py`, `routers/prescriptions.py`, `routers/reports.py`, and `routers/doctors.py`.

2. **Restrict CORS Origins & Secrets Security**:
   Remove wildcard `allow_origins=["*"]` in `main.py` when `allow_credentials=True` is enabled. Mandate strong non-empty `SECRET_KEY` in `core/config.py`.

3. **Integrate API Rate Limiting**:
   Apply rate-limiting middleware (`slowapi`) on sensitive auth routes (`/auth/login`, `/auth/send-otp`, `/auth/forgot-password`) to eliminate brute-force attack vectors.
