from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    customer = "customer"
    pro = "pro"
    supplier = "supplier"
    admin = "admin"

class UserBase(BaseModel):
    phone: str
    role: UserRole = UserRole.customer

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    telegram_id: Optional[int] = None
    username: Optional[str] = None
    phone_visible: bool = False
    rating: float
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    bio: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    category_id: Optional[int] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    user_id: int

class Profile(ProfileBase):
    id: int
    user_id: int
    is_verified: bool

    class Config:
        from_attributes = True

class PortfolioItemBase(BaseModel):
    title: str
    image_url1: str
    image_url2: Optional[str] = None
    image_url3: Optional[str] = None
    image_url4: Optional[str] = None
    image_url5: Optional[str] = None
    price: Optional[float] = None
    price_type: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "available"
    description: Optional[str] = None
    item_type: Optional[str] = "service"
    phone: Optional[str] = None
    category_id: Optional[int] = None

class PortfolioItemCreate(PortfolioItemBase):
    profile_id: int

class PortfolioItem(PortfolioItemBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True

class ProfilePublic(ProfileBase):
    id: int
    user_id: int
    is_verified: bool
    user: User

    class Config:
        from_attributes = True

class PortfolioItemPublic(PortfolioItem):
    profile: ProfilePublic

    class Config:
        from_attributes = True

# Reviews removed from here, using the ones at the bottom

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    phone: str
    role: Optional[UserRole] = UserRole.customer

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class OTPVerify(BaseModel):
    phone: str
    otp_code: str

class MessageBase(BaseModel):
    receiver_id: int
    content: Optional[str] = None
    image_url: Optional[str] = None

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    sender_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    stars: int
    text: Optional[str] = None

class ReviewCreate(ReviewBase):
    to_user_id: int

class Review(ReviewBase):
    id: int
    from_user_id: int
    to_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
