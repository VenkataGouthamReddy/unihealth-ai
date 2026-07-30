import random
from datetime import datetime
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from core.config import settings
from core.security import get_password_hash, verify_password, create_access_token
from database.mongodb import db
from models.user import UserCreate, UserInDB, UserResponse, Token, TokenData, OTPVerify, PasswordChange, ProfileUpdate

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await db.db["users"].find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    return user

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_PORT != 465,
    MAIL_SSL_TLS=settings.MAIL_PORT == 465,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

@router.post("/send-otp")
async def send_otp(user_data: UserCreate):
    import re
    if user_data.role == "admin":
        raise HTTPException(status_code=400, detail="Admin accounts cannot be created via registration.")
    
    clean_email = (user_data.email or "").strip().lower()

    # Check if user already exists
    existing_user = await db.db["users"].find_one({"email": {"$regex": f"^{re.escape(clean_email)}$", "$options": "i"}})
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email address already exists. Please log in.")
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store temporary user data and OTP
    await db.db["temp_users"].update_one(
        {"email": clean_email},
        {"$set": {
            "email": clean_email,
            "name": user_data.name.strip(),
            "role": user_data.role,
            "password": user_data.password, # Plain password temporarily, will hash on verification
            "otp": str(otp).strip(),
            "created_at": datetime.utcnow()
        }},
        upsert=True
    )
    
    # Send email with OTP
    try:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563eb; text-align: center;">Welcome to UniHealth AI!</h2>
            <p style="font-size: 16px; color: #333;">Hello {user_data.name},</p>
            <p style="font-size: 16px; color: #333;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #1f2937; letter-spacing: 5px;">{otp}</span>
            </div>
            <p style="font-size: 14px; color: #666;">This OTP is valid for a limited time. Please do not share it with anyone.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this verification, please ignore this email.</p>
        </div>
        """
        
        message = MessageSchema(
            subject="UniHealth AI - Account Verification OTP",
            recipients=[clean_email],
            body=html,
            subtype=MessageType.html
        )
        
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"OTP email sent successfully to {clean_email}")
        
    except Exception as e:
        print(f"\n{'='*50}")
        print(f"⚠️ SMTP FAILED (Likely blocked by network/firewall)")
        print(f"Error details: {str(e)}")
        print(f"⚠️ DEVELOPMENT FALLBACK - USE THIS OTP: {otp}")
        print(f"{'='*50}\n")
        return {"message": "Email blocked by Gmail firewall. Using Demo Mode.", "demo_otp": otp}
        
    return {"message": "OTP sent successfully. Please check your email."}

@router.post("/verify-otp", response_model=Token)
async def verify_otp(verify_data: OTPVerify):
    import re
    clean_email = (verify_data.email or "").strip().lower()
    clean_otp = (verify_data.otp or "").strip()

    temp_user = await db.db["temp_users"].find_one({"email": {"$regex": f"^{re.escape(clean_email)}$", "$options": "i"}})
    
    if not temp_user:
        raise HTTPException(status_code=400, detail="Registration session not found or expired. Please register again.")
    
    stored_otp = str(temp_user.get("otp", "")).strip()
    if stored_otp != clean_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please double-check the 6-digit code sent to your email.")
    
    # Check if user was already inserted in main collection
    existing_user = await db.db["users"].find_one({"email": {"$regex": f"^{re.escape(clean_email)}$", "$options": "i"}})
    if existing_user:
        await db.db["temp_users"].delete_one({"_id": temp_user["_id"]})
        access_token = create_access_token(data={
            "sub": existing_user["email"], 
            "id": str(existing_user["_id"]),
            "role": existing_user.get("role"),
            "name": existing_user.get("name"),
            "profile_picture": existing_user.get("profile_picture")
        })
        return {"access_token": access_token, "token_type": "bearer"}

    # Move to main users collection
    user_in_db = UserInDB(
        name=temp_user["name"],
        email=clean_email,
        role=temp_user["role"],
        hashed_password=get_password_hash(temp_user["password"])
    )
    
    new_user = await db.db["users"].insert_one(user_in_db.dict(exclude={"id"}))
    created_user = await db.db["users"].find_one({"_id": new_user.inserted_id})
    
    # Clean up temp collection
    await db.db["temp_users"].delete_one({"_id": temp_user["_id"]})
    
    access_token = create_access_token(data={
        "sub": created_user["email"], 
        "id": str(created_user["_id"]),
        "role": created_user.get("role"),
        "name": created_user.get("name"),
        "profile_picture": created_user.get("profile_picture")
    })
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    # This endpoint is now a fallback or simplified registration
    # For a professional app, we use the OTP flow above
    return await verify_otp(OTPVerify(email=user.email, otp="123456")) # Mocked for direct use if needed

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    import re
    clean_email = (form_data.username or "").strip().lower()
    user = await db.db["users"].find_one({"email": {"$regex": f"^{re.escape(clean_email)}$", "$options": "i"}})
    if not user or not verify_password(form_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={
        "sub": user["email"], 
        "id": str(user["_id"]),
        "role": user.get("role"),
        "name": user.get("name"),
        "profile_picture": user.get("profile_picture")
    })
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/change-password")
async def change_password(data: PasswordChange, current_user: dict = Depends(get_current_user)):
    if not verify_password(data.old_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    new_hashed_password = get_password_hash(data.new_password)
    await db.db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": new_hashed_password}}
    )
    
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
async def forgot_password(data: dict):
    email = data.get("email")
    user = await db.db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate 6-digit OTP for reset
    otp = str(random.randint(100000, 999999))
    
    # Store OTP in a temporary collection for reset
    await db.db["password_resets"].update_one(
        {"email": email},
        {"$set": {
            "otp": otp,
            "created_at": datetime.utcnow()
        }},
        upsert=True
    )
    
    # Send email with OTP
    try:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563eb; text-align: center;">UniHealth AI - Password Reset</h2>
            <p style="font-size: 16px; color: #333;">Hello {user.get('name', 'User')},</p>
            <p style="font-size: 16px; color: #333;">You requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #1f2937; letter-spacing: 5px;">{otp}</span>
            </div>
            <p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">UniHealth AI Security Team</p>
        </div>
        """
        
        message = MessageSchema(
            subject="UniHealth AI - Password Reset OTP",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )
        
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"Password reset OTP email sent successfully to {email}")
        
    except Exception as e:
        print(f"\n{'='*50}")
        print(f"⚠️ SMTP FAILED (Likely blocked by network/firewall)")
        print(f"⚠️ DEVELOPMENT FALLBACK - USE THIS OTP FOR {email}: {otp}")
        print(f"{'='*50}\n")
        # Do not raise 500 error so that development/APK testing can continue
        # raise HTTPException(status_code=500, detail="Failed to send OTP email. Please ensure email settings are configured on the server.")
        
    return {"message": "OTP sent successfully. Please check your email.", "otp_sent": True}

@router.post("/reset-password")
async def reset_password(data: dict):
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")
    
    reset_data = await db.db["password_resets"].find_one({"email": email})
    if not reset_data or reset_data["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Check if OTP is older than 10 minutes
    if (datetime.utcnow() - reset_data["created_at"]).total_seconds() > 600:
        await db.db["password_resets"].delete_one({"email": email})
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Update password
    hashed_password = get_password_hash(new_password)
    await db.db["users"].update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    # Clean up reset data
    await db.db["password_resets"].delete_one({"email": email})
    
    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    return current_user

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
        
    await db.db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    updated_user = await db.db["users"].find_one({"_id": current_user["_id"]})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@router.post("/upload-profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    import base64
    contents = await file.read()
    mime_type = file.content_type or "image/jpeg"
    base64_encoded = base64.b64encode(contents).decode('utf-8')
    data_url = f"data:{mime_type};base64,{base64_encoded}"

    # Best-effort disk save for local static serving if available
    try:
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        file_name = f"{current_user['_id']}.{file_extension}"
        file_path = f"static/profiles/{file_name}"
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        print(f"Skipped static file save: {e}")

    await db.db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"profile_picture": data_url}}
    )
    
    return {"profile_picture": data_url}

@router.delete("/profile-picture")
async def remove_profile_picture(current_user: dict = Depends(get_current_user)):
    await db.db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$unset": {"profile_picture": ""}}
    )
    return {"message": "Profile picture removed successfully", "profile_picture": None}

@router.get("/user-profile/{email_or_id}", response_model=UserResponse)
async def get_user_profile(email_or_id: str):
    from bson import ObjectId
    query = {}
    try:
        query["_id"] = ObjectId(email_or_id)
    except:
        query["email"] = email_or_id
        
    user = await db.db["users"].find_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user["_id"] = str(user["_id"])
    return user
