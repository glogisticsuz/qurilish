from Beckend.database import SessionLocal, engine
from Beckend import models
from sqlalchemy import create_engine

# Force the engine to use the correct file
engine = create_engine("sqlite:///Beckend/hamkorqurilish.db")
SessionLocal.configure(bind=engine)

db = SessionLocal()
try:
    items = db.query(models.PortfolioItem).all()
    print(f"Total items: {len(items)}")
    for item in items:
        print(f"Item: {item.title}, Status: {item.status}, Profile ID: {item.profile_id}")
        profile = db.query(models.Profile).filter(models.Profile.id == item.profile_id).first()
        print(f"  -> Profile Category: {profile.category_id if profile else 'NOT FOUND'}")
    
    profiles = db.query(models.Profile).all()
    print(f"\nTotal profiles: {len(profiles)}")
    for p in profiles:
        print(f"Profile ID: {p.id}, User ID: {p.user_id}, Category: {p.category_id}")
finally:
    db.close()
