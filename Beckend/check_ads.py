from database import SessionLocal
import models

def check_ads():
    db = SessionLocal()
    try:
        ads = db.query(models.Advertisement).all()
        print(f"Jami reklamalar: {len(ads)}")
        for ad in ads:
            print(f"ID: {ad.id}, Title: {ad.title}, Type: {ad.ad_type}, Active: {ad.is_active}")
    finally:
        db.close()

if __name__ == "__main__":
    check_ads()
