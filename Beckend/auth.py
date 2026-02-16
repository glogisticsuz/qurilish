import os
import random
import string
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models, schemas, database
from dotenv import load_dotenv
import httpx

import logging
logger = logging.getLogger(__name__)

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

def normalize_phone(phone: str) -> str:
    """Ensures phone number always starts with '+'."""
    if not phone:
        return phone
    phone = phone.strip()
    if not phone.startswith("+"):
        phone = "+" + phone
    return phone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# OTPs are now stored in the database

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def send_telegram_otp(phone: str, db: Session, telegram_id: Optional[int] = None):
    otp = "".join(random.choices(string.digits, k=6))
    
    # Save to DB
    user = db.query(models.User).filter(models.User.phone == phone).first()
    if user:
        user.otp_code = otp
        user.otp_created_at = datetime.utcnow()
        db.commit()
    
    print(f"OTP for {phone}: {otp}")
    
    # If we have telegram_id, we can send it directly
    if telegram_id:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                logger.info(f"Sending TG message to {telegram_id}...")
                response = await client.post(url, json={
                    "chat_id": telegram_id,
                    "text": f"Sizning MegaStroy tasdiqlash kodingiz: {otp}"
                })
                logger.info(f"TG Status: {response.status_code}")
            except Exception as e:
                logger.error(f"Error sending TG message: {e}")
    return otp

def get_current_user(db: Session = Depends(database.get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone: str = payload.get("sub")
        if phone is None:
            raise credentials_exception
        token_data = schemas.TokenData(phone=phone)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.phone == token_data.phone).first()
    if user is None:
        raise credentials_exception
    return user
