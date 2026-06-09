from fastapi import FastAPI
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
import os

# Build allowed origins list from env var (comma-separated) or default to allow all
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "*")
if _raw_origins == "*":
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

# Ensure static directory exists for mounting
if not os.path.exists("static/profiles"):
    os.makedirs("static/profiles")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(doctors_router)
app.include_router(appointments_router)
app.include_router(admin_router)
app.include_router(alerts_router)
app.include_router(notifications_router)
app.include_router(prescriptions_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to UniHealth AI API"}
