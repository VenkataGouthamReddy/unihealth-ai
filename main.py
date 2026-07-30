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
from routers.reports import router as reports_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os

# Build allowed origins list from env var (comma-separated) or default to allow all
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "*")
if _raw_origins == "*":
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

async def init_db_and_cleanup_sample_data():
    try:
        from database.mongodb import db
        from core.security import get_password_hash
        from datetime import datetime

        # Seed Default Admin User if missing
        admin_email = "admin@unihealth.ai"
        existing_admin = await db.db["users"].find_one({"email": admin_email})
        if not existing_admin:
            admin_data = {
                "name": "Admin Master",
                "full_name": "Admin Master",
                "email": admin_email,
                "hashed_password": get_password_hash("admin123"),
                "role": "admin",
                "created_at": datetime.utcnow()
            }
            await db.db["users"].insert_one(admin_data)
            print("Default admin user seeded on startup.")

        # Sample doctor emails to purge
        sample_emails = [
            "sarah.j@unihealth.edu",
            "m.chen@unihealth.edu",
            "e.rodriguez@unihealth.edu",
            "d.smith@unihealth.edu"
        ]

        # Find any sample doctor accounts
        sample_docs = await db.db["users"].find({"email": {"$in": sample_emails}}).to_list(100)
        if sample_docs:
            sample_ids = [str(doc["_id"]) for doc in sample_docs]
            # Delete sample doctors from users collection
            await db.db["users"].delete_many({"email": {"$in": sample_emails}})
            # Clean up schedules, appointments, prescriptions for sample doctors
            await db.db["doctor_schedules"].delete_many({"doctor_id": {"$in": sample_ids}})
            await db.db["appointments"].delete_many({"doctor_id": {"$in": sample_ids}})
            await db.db["prescriptions"].delete_many({"doctor_id": {"$in": sample_ids}})
            print(f"Purged {len(sample_docs)} sample doctors and associated data.")

        # Ensure all existing users have complete profile details
        student_users = await db.db["users"].find({"role": {"$ne": "doctor"}}).to_list(500)
        for idx, s in enumerate(student_users):
            defaults = {
                "department": s.get("department") or "Computer Science & Engineering",
                "roll_number": s.get("roll_number") or f"21CSE{101 + idx}",
                "age": s.get("age") or 21,
                "gender": s.get("gender") or "Male",
                "dob": s.get("dob") or "2003-05-15",
                "phone": s.get("phone") or f"+91 98765 {43210 + idx}",
                "blood_group": s.get("blood_group") or "O+",
                "emergency_contact": s.get("emergency_contact") or "+91 98765 00000",
                "course": s.get("course") or "B.Tech",
                "branch": s.get("branch") or "CSE",
                "university_name": s.get("university_name") or "UniHealth University",
                "university_register_number": s.get("university_register_number") or f"UNI2026{101 + idx}",
                "address": s.get("address") or "Hostel Block A, Campus Green, University Rd"
            }
            await db.db["users"].update_one({"_id": s["_id"]}, {"$set": defaults})

        await db.db["system_config"].update_one(
            {"key": "sample_doctors_removed"},
            {"$set": {"value": True, "updated_at": datetime.utcnow()}},
            upsert=True
        )
    except Exception as e:
        print(f"Error during DB initialization / sample cleanup: {e}")

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    await init_db_and_cleanup_sample_data()
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
app.include_router(reports_router)

# ── Frontend (Vite production build) ────────────────────────────────────────
# Mount the compiled JS/CSS assets only when the dist folder exists
_DIST = os.path.join(os.path.dirname(__file__), "dist")
_DIST_ASSETS = os.path.join(_DIST, "assets")

if os.path.isdir(_DIST_ASSETS):
    app.mount("/assets", StaticFiles(directory=_DIST_ASSETS), name="vite-assets")

# API route prefixes – the catch-all must NOT intercept these
_API_PREFIXES = (
    "/auth", "/ai", "/doctors", "/appointments",
    "/admin", "/alerts", "/notifications", "/prescriptions", "/reports",
    "/static", "/assets", "/docs", "/openapi", "/public"
)

@app.get("/public/stats")
async def get_public_stats():
    from database.mongodb import db
    total_users = await db.db["users"].count_documents({})
    cursor = db.db["users"].find({}, {"name": 1, "full_name": 1, "profile_picture": 1}).sort("_id", -1).limit(4)
    raw_users = await cursor.to_list(length=4)
    users_data = []
    for u in raw_users:
        users_data.append({
            "name": u.get("name") or u.get("full_name") or "User",
            "profile_picture": u.get("profile_picture")
        })
    return {"total_users": total_users, "recent_users": users_data}

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
