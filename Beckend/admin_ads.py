from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
import models, schemas, auth, image_utils
from database import get_db
from datetime import datetime
from sqlalchemy import func
import os
from jose import jwt

from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

def check_admin(user: models.User = Depends(auth.get_current_user)):
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")
    return user

# === ADMIN AUTHENTICATION ===

@router.post("/admin/login")
async def admin_login(data: schemas.AdminLoginRequest):
    try:
        username = data.username
        password = data.password
        
        print(f"Admin login attempt: {username}") # Don't log password in production, but okay for debug here
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            # Create admin token
            SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
            token = jwt.encode({"sub": "admin", "role": "admin"}, SECRET_KEY, algorithm="HS256")
            return {"access_token": token, "token_type": "bearer"}
            
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login Error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))

# === ADVERTISEMENT ENDPOINTS ===

@router.get("/ads/splash")
async def get_splash_ad(db: Session = Depends(get_db)):
    """Get active splash ad"""
    ad = db.query(models.Advertisement).filter(
        models.Advertisement.ad_type == models.AdType.splash,
        models.Advertisement.is_active == True
    ).first()
    return ad

@router.get("/ads/banners")
async def get_banner_ads(db: Session = Depends(get_db)):
    """Get 3 active banner ads"""
    ads = db.query(models.Advertisement).filter(
        models.Advertisement.ad_type == models.AdType.banner,
        models.Advertisement.is_active == True
    ).order_by(models.Advertisement.position).limit(3).all()
    return ads

@router.get("/ads/inline")
async def get_inline_ads(db: Session = Depends(get_db)):
    """Get active inline ads"""
    ads = db.query(models.Advertisement).filter(
        models.Advertisement.ad_type == models.AdType.inline,
        models.Advertisement.is_active == True
    ).all()
    return ads

@router.post("/ads/{ad_id}/view")
async def track_ad_view(ad_id: int, db: Session = Depends(get_db)):
    """Track ad view"""
    ad = db.query(models.Advertisement).filter(models.Advertisement.id == ad_id).first()
    if ad:
        ad.views_count += 1
        view = models.AdView(ad_id=ad_id)
        db.add(view)
        db.commit()
    return {"success": True}

@router.post("/ads/{ad_id}/click")
async def track_ad_click(ad_id: int, db: Session = Depends(get_db)):
    """Track ad click"""
    ad = db.query(models.Advertisement).filter(models.Advertisement.id == ad_id).first()
    if ad:
        ad.clicks_count += 1
        click = models.AdClick(ad_id=ad_id)
        db.add(click)
        db.commit()
    return {"success": True}

# === ADMIN ADVERTISEMENT CRUD ===

@router.get("/admin/ads", dependencies=[Depends(check_admin)])
async def get_all_ads(db: Session = Depends(get_db)):
    """Get all advertisements"""
    return db.query(models.Advertisement).all()

@router.post("/admin/ads", dependencies=[Depends(check_admin)])
async def create_ad(
    title: str = Form(...),
    link_url: str = Form(None),
    ad_type: str = Form(...),
    position: int = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Create new advertisement"""
    file_content = await file.read()
    image_url = image_utils.upload_image(file_content, file.filename)
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Image upload failed")
    
    ad = models.Advertisement(
        title=title,
        image_url=image_url,
        link_url=link_url,
        ad_type=models.AdType(ad_type),
        position=position
    )
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad

@router.put("/admin/ads/{ad_id}", dependencies=[Depends(check_admin)])
async def update_ad(ad_id: int, is_active: bool, db: Session = Depends(get_db)):
    """Update advertisement status"""
    ad = db.query(models.Advertisement).filter(models.Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    ad.is_active = is_active
    db.commit()
    return ad

@router.delete("/admin/ads/{ad_id}", dependencies=[Depends(check_admin)])
async def delete_ad(ad_id: int, db: Session = Depends(get_db)):
    """Delete advertisement"""
    ad = db.query(models.Advertisement).filter(models.Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    db.delete(ad)
    db.commit()
    return {"success": True}

# === ADMIN ANALYTICS ===

@router.get("/admin/stats/overview", dependencies=[Depends(check_admin)])
async def get_overview_stats(db: Session = Depends(get_db)):
    """Get platform overview statistics"""
    total_users = db.query(models.User).count()
    total_listings = db.query(models.PortfolioItem).count()
    total_messages = db.query(models.Message).count()
    total_reviews = db.query(models.Review).count()
    
    # Users by role
    users_by_role = db.query(
        models.User.role,
        func.count(models.User.id)
    ).group_by(models.User.role).all()
    
    return {
        "total_users": total_users,
        "total_listings": total_listings,
        "total_messages": total_messages,
        "total_reviews": total_reviews,
        "users_by_role": dict(users_by_role)
    }

@router.get("/admin/stats/ads", dependencies=[Depends(check_admin)])
async def get_ad_stats(db: Session = Depends(get_db)):
    """Get advertisement statistics"""
    ads = db.query(models.Advertisement).all()
    
    stats = []
    for ad in ads:
        ctr = (ad.clicks_count / ad.views_count * 100) if ad.views_count > 0 else 0
        stats.append({
            "id": ad.id,
            "title": ad.title,
            "type": ad.ad_type,
            "views": ad.views_count,
            "clicks": ad.clicks_count,
            "ctr": round(ctr, 2)
        })
    
    return stats
