from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class UserBase(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: EmailStr
    role: str = Field(..., description="student, doctor, admin")
    profile_picture: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    roll_number: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    availability: Optional[dict] = None
    settings: Optional[dict] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    roll_number: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id", default=None)
    hashed_password: str
    created_at: datetime = datetime.utcnow()

class UserResponse(UserBase):
    id: str = Field(alias="_id", default=None)
    
    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str
