# UniHealth AI — Backend Audit & Mobile Integration Report

## 1. Backend Framework & Architecture
- **Framework**: **Python 3.10+ / FastAPI** (Server entry point: [main.py](file:///d:/Projects/PDD/UniHealthAI/main.py)).
- **ASGI Server**: **Uvicorn** (`uvicorn main:app --host 0.0.0.0 --port 8000`).
- **Database**: **MongoDB** connected via `motor` (async driver) in [database/mongodb.py](file:///d:/Projects/PDD/UniHealthAI/database/mongodb.py).
- **Service Status**: **Single & Unified**. A single Python FastAPI backend service powers all portals (Student, Doctor, Admin) and external AI integrations (Google Gemini AI). No duplication or split backend logic exists.

---

## 2. API Routing & Endpoints Map

All endpoints are organized in modular routers inside [routers/](file:///d:/Projects/PDD/UniHealthAI/routers):

| Router File | Base Prefix | Key Endpoints | Description |
| :--- | :--- | :--- | :--- |
| [auth.py](file:///d:/Projects/PDD/UniHealthAI/routers/auth.py) | `/auth` | `POST /login`, `POST /send-otp`, `POST /verify-otp`, `POST /change-password`, `POST /upload-profile-picture`, `DELETE /profile-picture`, `PUT /update-profile` | User registration, authentication, OTP verification, and profile management. |
| [ai.py](file:///d:/Projects/PDD/UniHealthAI/routers/ai.py) | `/ai` | `POST /chat`, `POST /symptom-check`, `GET /insights` | AI medical chatbot (Gemini), symptom checker, and wellness insights. |
| [doctors.py](file:///d:/Projects/PDD/UniHealthAI/routers/doctors.py) | `/doctors` | `GET /`, `GET /{id}`, `GET /schedule`, `POST /schedule` | Doctor directory, specialty filters, and availability schedules. |
| [appointments.py](file:///d:/Projects/PDD/UniHealthAI/routers/appointments.py) | `/appointments` | `GET /`, `POST /book`, `POST /{id}/cancel`, `PUT /{id}/status`, `GET /today` | Appointment scheduling, status tracking, and doctor queues. |
| [admin.py](file:///d:/Projects/PDD/UniHealthAI/routers/admin.py) | `/admin` | `GET /stats`, `GET /users`, `GET /doctors` | Campus system analytics, user management, and stats. |
| [alerts.py](file:///d:/Projects/PDD/UniHealthAI/routers/alerts.py) | `/alerts` | `GET /`, `POST /` | Campus health alerts and emergency notices. |
| [notifications.py](file:///d:/Projects/PDD/UniHealthAI/routers/notifications.py) | `/notifications` | `GET /`, `PUT /{id}/read` | User notifications and activity logs. |
| [prescriptions.py](file:///d:/Projects/PDD/UniHealthAI/routers/prescriptions.py) | `/prescriptions` | `GET /`, `POST /` | Medical prescriptions and treatment records. |
| [reports.py](file:///d:/Projects/PDD/UniHealthAI/routers/reports.py) | `/reports` | `GET /`, `POST /` | Medical report uploads and viewer. |

---

## 3. CORS Configuration Analysis
In [main.py](file:///d:/Projects/PDD/UniHealthAI/main.py):
```python
ALLOWED_ORIGINS = ["*"]  # Configurable via environment variable ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
- **Mobile Compatibility**: Fully verified. CORS allows requests from any mobile origin, local development IP, or React Native client.

---

## 4. Authentication Mechanism
- **Auth Model**: **Stateless JWT (JSON Web Token) Bearer Token**.
- **Token Delivery**: On successful `/auth/login` or `/auth/verify-otp`, the API returns a JSON response containing `access_token` and `token_type: "bearer"`.
- **Authorization Header**:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Mobile Security Integration**:
  - **Web Client**: Stores JWT in `localStorage`.
  - **React Native Mobile Client**: Stores JWT in native encrypted storage (`expo-secure-store`) and injects it into every request header via Axios interceptor.
  - **No Cookie Dependency**: The backend does not rely on browser-only `Set-Cookie` session headers, making it 100% ready for native mobile apps out of the box.

---

## 5. Conclusion & Action Items
- **Backend Unification**: Completed & Confirmed. No backend refactoring or endpoint consolidation is required.
- **Client Configuration**: Both web (`VITE_API_URL`) and mobile (`EXPO_PUBLIC_API_URL`) target the exact same FastAPI endpoints cleanly.
