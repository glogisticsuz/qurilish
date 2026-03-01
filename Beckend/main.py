from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Body, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func # Added func import
import models, schemas, auth, database, image_utils
from database import engine, get_db
from typing import List, Optional
import json
from datetime import datetime, timedelta

import admin_ads

import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='backend.log',
    filemode='a'
)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HamkorQurilish API")

# CORS configuration - Tighten this in production!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hamkorqurilish.uz",
        "http://localhost:3000",
        "http://localhost:5173",
        "*"
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_ads.router)

@app.get("/")
async def root():
    return {"message": "Welcome to HamkorQurilish API"}

@app.get("/privacy-policy", response_class=HTMLResponse)
@app.get("/api/privacy-policy", response_class=HTMLResponse)
async def privacy_policy():
    html_content = """
    <!DOCTYPE html>
    <html lang="uz">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HamkorQurilish - Maxfiylik Siyosati</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb; }
            .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            h1 { color: #7c3aed; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; }
            h3 { color: #111827; margin-top: 30px; }
            p, li { color: #4b5563; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 0.9em; color: #9ca3af; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Maxfiylik Siyosati (Privacy Policy)</h1>
            <p><strong>Oxirgi yangilangan sana:</strong> 1-mart, 2026-yil</p>
            
            <p>"HamkorQurilish" jamoasi sizning maxfiyligingizni hurmat qiladi va himoya qiladi. Ushbu Maxfiylik siyosati bizning mobil ilovamiz orqali qanday ma'lumotlar to'planishi, foydalanilishi va himoya qilinishi haqida ma'lumot beradi.</p>

            <h3>1. Ma'lumotlarni to'plash va ulardan foydalanish</h3>
            <p>Ilovadan foydalanish jarayonida biz quyidagi hollarda ruxsat so'rashimiz mumkin:</p>
            <ul>
                <li><strong>Kamera:</strong> Ilovaning asosiy funksiyalarini bajarish uchun (masalan, profil rasmini yuklash, qurilish ob'ektlari rasmlarini olish yoki xabarlarda rasm yuborish) kameradan foydalanishga ruxsat talab qilinadi. Kamera faqatgina foydalanuvchi bevosita rasmga olish tugmasini bosganida ishga tushadi.</li>
                <li><strong>Galereya/Xotira:</strong> Qurilmangiz xotirasidagi mavjud rasmlarni tanlash va yuklash uchun foydalaniladi.</li>
            </ul>

            <h3>2. Ma'lumotlar xavfsizligi</h3>
            <p>Sizning shaxsiy ma'lumotlaringiz (ism, telefon raqami va rasm) xavfsiz serverlarda saqlanadi. Biz ma'lumotlaringiz xavfsizligini ta'minlash uchun zamonaviy shifrlash (encryption) usullaridan foydalanamiz.</p>

            <h3>3. UGC Safety (Foydalanuvchi xavfsizligi)</h3>
            <p>Ilovada foydalanuvchilar bir-birini bloklash va nojo'ya kontent ustidan shikoyat qilish imkoniyatiga ega. Biz har qanday haqoratli yoki zo'ravonlikni targ'ib qiluvchi kontentni 24 soat ichida ko'rib chiqamiz va kerakli choralarni ko'ramiz.</p>

            <h3>4. Ma'lumotlarni uchinchi shaxslarga bermaslik</h3>
            <p>Biz foydalanuvchilarning shaxsiy ma'lumotlarini uchinchi shaxslarga sotmaymiz, almashmaymiz va tarqatmaymiz. Ma'lumotlar faqatgina ilovaning ishlashi va sizga xizmat ko'rsatish uchun foydalaniladi.</p>

            <h3>5. Bog'lanish</h3>
            <p>Agar ushbu maxfiylik siyosati bo'yicha savollaringiz bo'lsa, ilova ichidagi qo'llab-quvvatlash qismi orqali biz bilan bog'laning.</p>

            <div class="footer">
                <strong>HamkorQurilish</strong> — Qurilishda ishonchli hamkoringiz.
            </div>
        </div>
    </body>
    </html>
    """
    return html_content

@app.post("/auth/login", response_model=schemas.LoginRequest)
async def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    logger.info(f"Login request received for phone: {request.phone}, role: {request.role}")
    # Check if user exists, if not create them
    request.phone = auth.normalize_phone(request.phone)
    user = db.query(models.User).filter(models.User.phone == request.phone).first()
    if not user:
        user = models.User(phone=request.phone, role=models.UserRole(request.role))
        db.add(user)
        db.commit()
        db.refresh(user)
    elif request.role and user.role != models.UserRole(request.role):
        # Allow user to update their role during login (e.g. switching from Supplier to Customer)
        user.role = models.UserRole(request.role)
        db.commit()
    
    logger.info(f"Integrated OTP sending for {request.phone} with telegram_id: {user.telegram_id}")
    # Generate and send OTP (in database now)
    await auth.send_telegram_otp(request.phone, db, user.telegram_id)
    logger.info(f"Login successful for {request.phone}")
    return request

@app.post("/auth/verify", response_model=schemas.Token)
async def verify(request: schemas.OTPVerify, db: Session = Depends(get_db)):
    logger.info(f"Verify request received for phone: {request.phone}, code: {request.otp_code}")
    request.phone = auth.normalize_phone(request.phone)
    user = db.query(models.User).filter(models.User.phone == request.phone).first()
    
    if not user or not user.otp_code or user.otp_code != request.otp_code:
        raise HTTPException(status_code=400, detail="Noto'g'ri tasdiqlash kodi")
    
    # Check expiration (10 minutes)
    if user.otp_created_at and datetime.utcnow() - user.otp_created_at > timedelta(minutes=10):
        # Clear expired OTP
        user.otp_code = None
        db.commit()
        raise HTTPException(status_code=400, detail="Tasdiqlash kodi muddati o'tgan")

    # Clear code after successful verify
    user.otp_code = None
    db.commit()
    
    access_token = auth.create_access_token(data={"sub": user.phone})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

class RoleUpdate(BaseModel):
    role: schemas.UserRole

@app.put("/users/role", response_model=schemas.User)
async def update_role(role_data: RoleUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    current_user.role = models.UserRole(role_data.role)
    db.commit()
    db.refresh(current_user)
    return current_user

# --- Admin Endpoints ---

def check_admin(user: models.User = Depends(auth.get_current_user)):
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")
    return user

@app.get("/admin/stats", dependencies=[Depends(check_admin)])
async def get_admin_stats(db: Session = Depends(get_db)):
    users_count = db.query(models.User).count()
    profiles_count = db.query(models.Profile).count()
    verified_count = db.query(models.Profile).filter(models.Profile.is_verified == True).count()
    portfolio_count = db.query(models.PortfolioItem).count()
    
    return {
        "users": users_count,
        "profiles": profiles_count,
        "verified": verified_count,
        "portfolio": portfolio_count
    }

@app.get("/admin/unverified", dependencies=[Depends(check_admin)], response_model=List[schemas.Profile])
async def get_unverified_profiles(db: Session = Depends(get_db)):
    return db.query(models.Profile).filter(models.Profile.is_verified == False).all()

@app.post("/admin/profiles/{profile_id}/verify", dependencies=[Depends(check_admin)])
async def verify_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil topilmadi")
    profile.is_verified = True
    db.commit()
    return {"message": "Profil tasdiqlandi"}

# --- Profile Endpoints ---

@app.get("/profiles/me", response_model=schemas.Profile)
async def get_my_profile(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        # Auto-create profile if doesn't exist
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.put("/profiles/me", response_model=schemas.Profile)
async def update_my_profile(profile_data: schemas.ProfileBase, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@app.post("/profiles/me/avatar", response_model=schemas.Profile)
async def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
    
    file_content = await file.read()
    image_url = image_utils.upload_image(file_content, file.filename)
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Rasmni yuklashda xatolik yuz berdi")
    
    profile.avatar_url = image_url
    db.commit()
    db.refresh(profile)
    return profile

# --- Portfolio Endpoints ---

@app.get("/profiles/me/portfolio", response_model=List[schemas.PortfolioItem])
async def get_my_portfolio(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile.items

@app.get("/profiles/{user_id}", response_model=schemas.ProfilePublic)
async def get_public_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil topilmadi")
    return profile

@app.get("/profiles/{user_id}/portfolio", response_model=List[schemas.PortfolioItem])
async def get_user_portfolio(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil topilmadi")
    return profile.items

@app.post("/profile/portfolio", response_model=schemas.PortfolioItem)
async def upload_portfolio(
    title: str = Form(...),
    price: float = Form(0),
    price_type: str = Form("soat"),
    location: str = Form(""),
    category_id: int = Form(...),
    description: str = Form(""),
    item_type: str = Form("service"),
    phone: str = Form(""),
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Upload portfolio started for user: {current_user.id}, title: {title}, files_count: {len(files)}")
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    import asyncio
    
    async def process_file(file):
        content = await file.read()
        return await image_utils.upload_image(content, file.filename)

    # Limit to 5 images and process in parallel
    tasks = [process_file(f) for f in files[:5]]
    image_urls = await asyncio.gather(*tasks)
    
    # Filter out None results (failed uploads)
    image_urls = [url for url in image_urls if url]
    
    if not image_urls:
        logger.error(f"No images uploaded correctly for user {current_user.id}")
        raise HTTPException(status_code=500, detail="Hech bo'lmaganda bitta rasmni yuklashda xatolik yuz berdi")
    
    logger.info(f"Successfully uploaded {len(image_urls)} images for user {current_user.id}")
    
    # Pad images list to 5 items with None
    while len(image_urls) < 5:
        image_urls.append(None)

    image_links = {f"image_url{i+1}": url for i, url in enumerate(image_urls)}
    
    new_item = models.PortfolioItem(
        profile_id=profile.id, # Use the profile object obtained or created above
        title=title,
        price=price,
        price_type=price_type,
        location=location,
        category_id=category_id,
        description=description,
        item_type=item_type,
        phone=phone,
        **image_links
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/items", response_model=List[schemas.PortfolioItemPublic])
async def get_all_items(
    category_id: Optional[int] = None,
    item_type: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional) # Need optional auth helper
):
    query = db.query(models.PortfolioItem).join(models.Profile)
    
    if category_id:
        query = query.filter(models.PortfolioItem.category_id == category_id)
    if item_type:
        query = query.filter(models.PortfolioItem.item_type == item_type)
        
    # Filter out items from blocked users if logged in
    if current_user:
        blocked_ids = db.query(models.BlockedUser.blocked_id).filter(models.BlockedUser.blocker_id == current_user.id).all()
        blocked_ids = [r[0] for r in blocked_ids]
        if blocked_ids:
            query = query.filter(models.Profile.user_id.notin_(blocked_ids))
            
    return query.order_by(models.PortfolioItem.id.desc()).all()

@app.post("/items/{item_id}/view")
async def increment_item_view(item_id: int, db: Session = Depends(database.get_db)):
    item = db.query(models.PortfolioItem).filter(models.PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Element topilmadi")
    item.views_count = (item.views_count or 0) + 1
    db.commit()
    return {"views_count": item.views_count}

@app.delete("/items/{item_id}")
async def delete_portfolio_item(item_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    item = db.query(models.PortfolioItem).join(models.Profile).filter(
        models.PortfolioItem.id == item_id,
        models.Profile.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Element topilmadi yoki sizda ruxsat yo'q")
    
    db.delete(item)
    db.commit()
    return {"message": "Element o'chirildi"}

@app.put("/portfolio/{item_id}", response_model=schemas.PortfolioItem)
async def update_portfolio_item(
    item_id: int,
    title: str = Form(None),
    price: float = Form(None),
    price_type: str = Form(None),
    status: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    item = db.query(models.PortfolioItem).join(models.Profile).filter(
        models.PortfolioItem.id == item_id,
        models.Profile.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Element topilmadi yoki sizda ruxsat yo'q")
    
    if title:
        item.title = title
    if price is not None:
        item.price = price
    if price_type:
        item.price_type = price_type
    if status:
        item.status = status
        
    if file:
        file_content = await file.read()
        image_url = image_utils.upload_image(file_content, file.filename)
        if image_url:
            item.image_url1 = image_url
            
    db.commit()
    db.refresh(item)
    return item

# --- Messaging Endpoints ---

@app.post("/messages/send", response_model=schemas.Message)
async def send_message(msg: schemas.MessageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=msg.receiver_id,
        content=msg.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    
    # Send Telegram notification to receiver
    receiver = db.query(models.User).filter(models.User.id == msg.receiver_id).first()
    sender_profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    sender_name = sender_profile.full_name if sender_profile and sender_profile.full_name else "Foydalanuvchi"
    
    # Silent Chat: Disabled Telegram notifications for internal messages per user request.
    # if receiver and receiver.telegram_id and receiver.id != current_user.id:
    #     import httpx
    #     url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    #     notification_text = f"🔔 Yangi xabar!\n\n👤 {sender_name}:\n{msg.content[:100]}{'...' if len(msg.content) > 100 else ''}"
    #     
    #     async with httpx.AsyncClient() as client:
    #         try:
    #             await client.post(url, json={
    #                 "chat_id": receiver.telegram_id,
    #                 "text": notification_text
    #             })
    #         except Exception as e:
    #             print(f"Telegram notification error: {e}")
    
    return new_msg

@app.get("/messages/chats")
async def get_my_chats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Find all users I've chatted with
    sent_to = db.query(models.Message.receiver_id).filter(models.Message.sender_id == current_user.id).distinct()
    recv_from = db.query(models.Message.sender_id).filter(models.Message.receiver_id == current_user.id).distinct()
    
    user_ids = [r[0] for r in sent_to.all()] + [r[0] for r in recv_from.all()]
    # Unique IDs
    user_ids = list(set(user_ids)) 
    
    # Filter out blocked users
    blocked_ids = db.query(models.BlockedUser.blocked_id).filter(models.BlockedUser.blocker_id == current_user.id).all()
    blocked_ids = [r[0] for r in blocked_ids]
    user_ids = [uid for uid in user_ids if uid not in blocked_ids]
    
    result = []
    for uid in user_ids:
        user = db.query(models.User).filter(models.User.id == uid).first()
        profile = db.query(models.Profile).filter(models.Profile.user_id == uid).first()
        last_msg = db.query(models.Message).filter(
            ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == uid)) |
            ((models.Message.sender_id == uid) & (models.Message.receiver_id == current_user.id))
        ).order_by(models.Message.created_at.desc()).first()
        
        unread_count = db.query(models.Message).filter(
            models.Message.sender_id == uid,
            models.Message.receiver_id == current_user.id,
            models.Message.is_read == False
        ).count()
        
        result.append({
            "user_id": uid,
            "full_name": profile.full_name if profile and profile.full_name else (user.phone if user else "Foydalanuvchi"),
            "avatar_url": profile.avatar_url if profile else None,
            "last_message": last_msg.content if last_msg else "",
            "last_message_time": last_msg.created_at if last_msg else None,
            "unread_count": unread_count
        })
    
    # Sort by last message time
    result.sort(key=lambda x: x["last_message_time"] if x["last_message_time"] else datetime.min, reverse=True)
    return result

@app.post("/messages/send-image", response_model=schemas.Message)
async def send_message_with_image(
    receiver_id: int = Form(...),
    content: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check daily limit (5 images per day)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    img_count = db.query(models.Message).filter(
        models.Message.sender_id == current_user.id,
        models.Message.image_url.isnot(None),
        models.Message.created_at >= today_start
    ).count()
    
    if img_count >= 5:
        raise HTTPException(status_code=400, detail="Kunlik rasm yuborish limiti (5 ta) tugadi")
    
    logger.info(f"Receiving image for user {current_user.id} to receiver {receiver_id}")
    file_content = await file.read()
    logger.info(f"File size: {len(file_content)} bytes, filename: {file.filename}")
    image_url = image_utils.upload_image(file_content, file.filename)
    logger.info(f"Uploaded URL: {image_url}")
    
    if not image_url:
        logger.error(f"Image upload failed for user {current_user.id}")
        raise HTTPException(status_code=500, detail="Rasmni yuklashda xatolik yuz berdi")
    
    new_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content,
        image_url=image_url
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    
    # Notification logic
    # Silent Chat: Disabled Telegram notifications for internal messages per user request.
    # if receiver and receiver.telegram_id and receiver.id != current_user.id:
    #     import httpx
    #     url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    #     content_preview = content[:50] + "..." if content else "Rasm yuborildi 📸"
    #     notification_text = f"🔔 Yangi xabar!\n\n👤 {sender_name}:\n{content_preview}"
    #     
    #     async with httpx.AsyncClient() as client:
    #         try:
    #             await client.post(url, json={
    #                 "chat_id": receiver.telegram_id,
    #                 "text": notification_text
    #             })
    #         except Exception as e:
    #             print(f"Telegram notification error: {e}")

    return new_msg

@app.get("/messages/{user_id}", response_model=List[schemas.Message])
async def get_chat_history(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == user_id)) |
        ((models.Message.sender_id == user_id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.created_at.asc()).all()
    return messages

@app.post("/messages/{user_id}/read")
async def mark_messages_as_read(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.Message).filter(
        models.Message.sender_id == user_id,
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).update({models.Message.is_read: True})
    db.commit()
    return {"message": "Success"}

# --- Review Endpoints ---

@app.post("/reviews/{user_id}", response_model=schemas.Review)
async def create_review(user_id: int, review: schemas.ReviewBase, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="O'zingizga sharh qoldira olmaysiz")
    
    new_review = models.Review(
        from_user_id=current_user.id,
        to_user_id=user_id,
        stars=review.stars,
        text=review.text
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Update dynamic rating
    avg_rating = db.query(func.avg(models.Review.stars)).filter(models.Review.to_user_id == user_id).scalar()
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if target_user:
        target_user.rating = float(avg_rating)
        db.commit()
        
    return new_review

@app.get("/reviews/{user_id}", response_model=List[schemas.Review])
async def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.to_user_id == user_id).order_by(models.Review.created_at.desc()).all()

# --- UGC Safety: Block and Report ---

@app.post("/users/{user_id}/block")
async def block_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="O'zingizni blocklay olmaysiz")
    
    # Check if already blocked
    existing = db.query(models.BlockedUser).filter(
        models.BlockedUser.blocker_id == current_user.id,
        models.BlockedUser.blocked_id == user_id
    ).first()
    
    if existing:
        return {"message": "Foydalanuvchi allaqachon blocklangan"}
    
    new_block = models.BlockedUser(blocker_id=current_user.id, blocked_id=user_id)
    db.add(new_block)
    db.commit()
    return {"message": "Foydalanuvchi blocklandi"}

@app.post("/reports", response_model=schemas.Report)
async def create_report(report: schemas.ReportBase, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_report = models.Report(
        reporter_id=current_user.id,
        reported_user_id=report.reported_user_id,
        item_id=report.item_id,
        reason=report.reason,
        details=report.details
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

# Note: Admin and Ad endpoints have been moved to admin_ads.py
# If they need to be included in the main app, use app.include_router
