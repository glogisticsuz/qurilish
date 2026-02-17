from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Enum as SQLEnum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    customer = "customer"
    pro = "pro"
    supplier = "supplier"
    admin = "admin"

class AdType(str, enum.Enum):
    splash = "splash"
    banner = "banner"
    inline = "inline"

class MediaType(str, enum.Enum):
    image = "image"
    video = "video"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.customer)
    rating = Column(Float, default=0.0)
    username = Column(String, unique=True, nullable=True, index=True)
    phone_visible = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)
    otp_created_at = Column(DateTime, nullable=True)
    preferred_language = Column(String, default="uz")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, nullable=True)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    region = Column(String, nullable=True)
    district = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="profile")
    items = relationship("PortfolioItem", back_populates="profile")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"
    
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    image_url1 = Column(String)
    image_url2 = Column(String, nullable=True)
    image_url3 = Column(String, nullable=True)
    image_url4 = Column(String, nullable=True)
    image_url5 = Column(String, nullable=True)
    title = Column(String)
    price = Column(Float, nullable=True)
    price_type = Column(String, nullable=True)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    item_type = Column(String, default="service") # service or job_request
    category_id = Column(Integer, nullable=True)
    phone = Column(String, nullable=True)
    
    profile = relationship("Profile", back_populates="items")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id"))
    to_user_id = Column(Integer, ForeignKey("users.id"))
    stars = Column(Integer)
    text = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

# === ADVERTISEMENT MODELS ===

class Advertisement(Base):
    __tablename__ = "advertisements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    image_url = Column(String)
    link_url = Column(String, nullable=True)
    ad_type = Column(SQLEnum(AdType))
    position = Column(Integer, nullable=True)  # For banner ads (1, 2, 3)
    is_active = Column(Boolean, default=True)
    views_count = Column(Integer, default=0)
    clicks_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True) # This can be used as end_date
    
    # New fields for advanced ads
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    media_type = Column(String, default="image") # image, video
    is_skippable = Column(Boolean, default=False)
    duration = Column(Integer, default=5) # seconds (for splash)

class AdView(Base):
    __tablename__ = "ad_views"
    
    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(Integer, ForeignKey("advertisements.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    viewed_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)

class AdClick(Base):
    __tablename__ = "ad_clicks"
    
    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(Integer, ForeignKey("advertisements.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    clicked_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
