from fastapi import FastAPI, Request
import contextlib
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from database.mongodb import connect_to_mongo, close_mongo_connection
from routers.auth import router as auth_router
from routers.ai import router as ai_router
from routers.doctors import router as doctors_router
from routers.appointments import router as appointments_router
from routers.admin import router as admin_router
from routers.alerts import router as alerts_router
from routers.notifications import router as notifications_router
from routers.prescriptions import router as prescriptions_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os

# Build allowed origins list from env var (comma-separated) or default to allow all
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "*")
if _raw_origins == "*":
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

async def seed_doctors_non_destructive():
    try:
        from database.mongodb import db
        from core.security import get_password_hash
        from datetime import datetime
        
        # Check if database has been seeded before
        config = await db.db["system_config"].find_one({"key": "seeded"})
        if config:
            return
            
        hashed_pwd = get_password_hash("doctor123")
        mock_doctors = [
            {"name": "Dr. Sarah Johnson", "full_name": "Dr. Sarah Johnson", "email": "sarah.j@unihealth.edu", "role": "doctor", "specialization": "Cardiologist", "experience_years": 12, "consultation_fee": 75.0, "hashed_password": hashed_pwd},
            {"name": "Dr. Michael Chen", "full_name": "Dr. Michael Chen", "email": "m.chen@unihealth.edu", "role": "doctor", "specialization": "Neurologist", "experience_years": 8, "consultation_fee": 90.0, "hashed_password": hashed_pwd},
            {"name": "Dr. Emily Rodriguez", "full_name": "Dr. Emily Rodriguez", "email": "e.rodriguez@unihealth.edu", "role": "doctor", "specialization": "Dermatologist", "experience_years": 15, "consultation_fee": 80.0, "hashed_password": hashed_pwd},
            {"name": "Dr. David Smith", "full_name": "Dr. David Smith", "email": "d.smith@unihealth.edu", "role": "doctor", "specialization": "General Physician", "experience_years": 10, "consultation_fee": 50.0, "hashed_password": hashed_pwd}
        ]
        
        doctor_ids = {}
        for doc in mock_doctors:
            existing = await db.db["users"].find_one({"email": doc["email"]})
            if not existing:
                doc["created_at"] = datetime.utcnow()
                res = await db.db["users"].insert_one(doc)
                doctor_ids[doc["email"]] = str(res.inserted_id)
            else:
                doctor_ids[doc["email"]] = str(existing["_id"])
                # Ensure fields are correctly populated if they were missing or null
                updates = {}
                if not existing.get("specialization"):
                    updates["specialization"] = doc["specialization"]
                if not existing.get("full_name"):
                    updates["full_name"] = doc["full_name"]
                if updates:
                    await db.db["users"].update_one({"_id": existing["_id"]}, {"$set": updates})
                    
        # Seed schedules for mock doctors
        default_avail = {
            "Monday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
            "Tuesday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
            "Wednesday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
            "Thursday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
            "Friday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
            "Saturday": {"active": False, "slots": []},
            "Sunday": {"active": False, "slots": []}
        }
        
        default_breaks = {
            "Monday": [{"start": "13:00", "end": "15:00"}],
            "Tuesday": [{"start": "13:00", "end": "15:00"}],
            "Wednesday": [{"start": "13:00", "end": "15:00"}],
            "Thursday": [{"start": "13:00", "end": "15:00"}],
            "Friday": [{"start": "13:00", "end": "15:00"}],
            "Saturday": [],
            "Sunday": []
        }
        
        for email, doc_id in doctor_ids.items():
            existing_sched = await db.db["doctor_schedules"].find_one({"doctor_id": doc_id})
            if not existing_sched:
                schedule = {
                    "doctor_id": doc_id,
                    "availability": default_avail,
                    "custom_dates": {},
                    "breaks": default_breaks,
                    "settings": {
                        "slot_duration": 15,
                        "max_patients_per_slot": 1,
                        "max_patients_per_day": 10
                    },
                    "updated_at": datetime.utcnow()
                }
                await db.db["doctor_schedules"].insert_one(schedule)
                
        await db.db["system_config"].update_one(
            {"key": "seeded"},
            {"$set": {"value": True, "seeded_at": datetime.utcnow()}},
            upsert=True
        )
        print("Non-destructive seeding of mock doctors and schedules completed.")
    except Exception as e:
        print(f"Error during non-destructive seeding: {e}")

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    await seed_doctors_non_destructive()
    yield
    await close_mongo_connection()

# Ensure static directory exists for mounting
if not os.path.exists("static/profiles"):
    os.makedirs("static/profiles")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# ── Middleware (must be added BEFORE routes) ────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file uploads (profile pictures etc.) ────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── API Routers ─────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(doctors_router)
app.include_router(appointments_router)
app.include_router(admin_router)
app.include_router(alerts_router)
app.include_router(notifications_router)
app.include_router(prescriptions_router)

# ── Frontend (Vite production build) ────────────────────────────────────────
# Mount the compiled JS/CSS assets only when the dist folder exists
_DIST = os.path.join(os.path.dirname(__file__), "dist")
_DIST_ASSETS = os.path.join(_DIST, "assets")

if os.path.isdir(_DIST_ASSETS):
    app.mount("/assets", StaticFiles(directory=_DIST_ASSETS), name="vite-assets")

# API route prefixes – the catch-all must NOT intercept these
_API_PREFIXES = (
    "/auth", "/ai", "/doctors", "/appointments",
    "/admin", "/alerts", "/notifications", "/prescriptions",
    "/static", "/assets", "/docs", "/openapi",
)

@app.get("/{catchall:path}", include_in_schema=False)
async def serve_spa(request: Request, catchall: str):
    """Serve the React SPA for all non-API GET requests.
    Only active when dist/index.html exists (i.e. after `npm run build`).
    During local development the Vite dev server handles the frontend.
    """
    # Let API routes pass through (shouldn't normally reach here, but guard anyway)
    if any(request.url.path.startswith(p) for p in _API_PREFIXES):
        return JSONResponse({"detail": "Not found"}, status_code=404)

    # Check if dist folder is present (production build was done)
    index_path = os.path.join(_DIST, "index.html")
    if not os.path.exists(index_path):
        return JSONResponse(
            {"message": "Welcome to UniHealth AI API. Run 'npm run build' to serve the frontend."},
            status_code=200,
        )

    # Serve static files that live directly in dist/ (favicon, icons, etc.)
    file_path = os.path.join(_DIST, catchall)
    if catchall and os.path.isfile(file_path):
        return FileResponse(file_path)

    # Fallback: serve index.html so React Router can handle client-side navigation
    return FileResponse(index_path)
