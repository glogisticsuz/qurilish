import logging
import os
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

# Environment variables
load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
DATABASE_URL = os.getenv("DATABASE_URL")

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

from database import SessionLocal
from auth import normalize_phone

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Sends a message with a button to share contact and additional options."""
    contact_button = KeyboardButton(text="Raqamni ulash 📱", request_contact=True)
    reklama_button = KeyboardButton(text="Reklama berish 📢")
    admin_button = KeyboardButton(text="Adminga murojaat 👨‍💻")
    
    keyboard = ReplyKeyboardMarkup(
        [[contact_button], [reklama_button, admin_button]], 
        resize_keyboard=True
    )
    
    await update.message.reply_text(
        "Xush kelibsiz! HamkorQurilish platformasi rasmiy botiga xush kelibsiz. \n\nRaqamingizni tasdiqlash uchun 'Raqamni ulash' tugmasini bosing yoki quyidagi bo'limlardan birini tanlang.",
        reply_markup=keyboard
    )

async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles text buttons."""
    text = update.message.text
    
    if text == "Reklama berish 📢":
        await update.message.reply_text(
            "📢 Reklama xizmati bo'yicha ma'lumot:\n\n"
            "Siz platformamizda splash, banner yoki inline turdagi reklamalarni joylashtirishingiz mumkin.\n\n"
            "Batafsil ma'lumot va narxlar uchun admin bilan bog'laning:\n"
            "📞 Tel: +998 90 123 45 67\n"
            "👤 Admin: @HamkorQurilish_Admin"
        )
    elif text == "Adminga murojaat 👨‍💻":
        await update.message.reply_text(
            "👨‍💻 Savol va takliflaringiz bo'lsa admin bilan bog'laning:\n\n"
            "👤 Admin: @HamkorQurilish_Admin\n"
            "⏰ Ish vaqti: 09:00 - 18:00\n\n"
            "Iltimos, murojaatingizni yozib qoldiring, admin tez orada javob beradi."
        )

async def handle_contact(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles the shared contact and updates the database."""
    contact = update.message.contact
    phone = normalize_phone(contact.phone_number)
    telegram_id = contact.user_id

    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.phone == phone).first()
        
        if user:
            user.telegram_id = telegram_id
            await update.message.reply_text(
                "Raqamingiz muvaffaqiyatli bog'landi! Endi sayt orqali tizimga kirishingiz mumkin."
            )
            
            # Check for database-backed OTP
            if user.otp_code:
                await update.message.reply_text(
                    f"Sizning HamkorQurilish tasdiqlash kodingiz: {user.otp_code}\n\nUshbu kodni saytga kiriting."
                )
        else:
            # Create new user if not exists
            new_user = models.User(phone=phone, telegram_id=telegram_id)
            db.add(new_user)
            await update.message.reply_text(
                "Siz muvaffaqiyatli ro'yxatdan o'tdingiz! Endi sayt orqali tizimga kirishingiz mumkin."
            )
        
        db.commit()
    except Exception as e:
        db.rollback()
        logging.error(f"Error updating user: {e}")
        await update.message.reply_text("Xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.")
    finally:
        db.close()

if __name__ == '__main__':
    if not TOKEN:
        print("Xatolik: TELEGRAM_BOT_TOKEN topilmadi!")
        exit(1)
        
    application = ApplicationBuilder().token(TOKEN).build()
    
    start_handler = CommandHandler('start', start)
    contact_handler = MessageHandler(filters.CONTACT, handle_contact)
    text_handler = MessageHandler(filters.TEXT & (~filters.COMMAND), handle_text)
    
    application.add_handler(start_handler)
    application.add_handler(contact_handler)
    application.add_handler(text_handler)
    
    print("Bot ishga tushdi...")
    application.run_polling()
