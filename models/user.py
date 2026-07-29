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
    
    # New Student Fields
    dob: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    university_register_number: Optional[str] = None
    university_name: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None

    # New Doctor Fields
    degree: Optional[str] = None
    qualification: Optional[str] = None
    medical_registration_number: Optional[str] = None
    hospital_name: Optional[str] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    roll_number: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    profile_picture: Optional[str] = None
    
    # New Student Fields
    dob: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    university_register_number: Optional[str] = None
    university_name: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None

    # New Doctor Fields
    degree: Optional[str] = None
    qualification: Optional[str] = None
    medical_registration_number: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    hospital_name: Optional[str] = None
    availability: Optional[dict] = None

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
