import logging
import traceback
import os
import telebot
import html
from telebot import types
from dotenv import load_dotenv

# Environment variables
load_dotenv()
API_TOKEN = os.getenv('SUPPORT_BOT_TOKEN')
raw_channel_id = os.getenv('SUPPORT_CHANNEL_ID', '@HamkorQurilish_murojat')
ADMIN_ID = os.getenv('SUPPORT_ADMIN_ID')

# Convert ADMIN_ID to int if available
if ADMIN_ID:
    try:
        ADMIN_ID = int(ADMIN_ID)
    except:
        logging.error(f"Invalid ADMIN_ID: {ADMIN_ID}")

# Try to convert to int if it's a numeric ID (starts with -100)
try:
    if raw_channel_id.startswith('-') or raw_channel_id.isdigit():
        CHANNEL_ID = int(raw_channel_id)
    else:
        CHANNEL_ID = raw_channel_id
except:
    CHANNEL_ID = raw_channel_id

# Logging sozlash
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

bot = telebot.TeleBot(API_TOKEN)

# Foydalanuvchi holatlarini saqlash uchun lug'at
user_data = {}

def get_main_keyboard():
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    keyboard.add(
        types.KeyboardButton("👨‍💻 Adminga murojaat"),
        types.KeyboardButton("💰 Reklama narxlari"),
        types.KeyboardButton("❓ Ko'p beriladigan savollar"),
        types.KeyboardButton("🏠 Bosh menyu")
    )
    return keyboard

@bot.message_handler(commands=['start', 'help'])
@bot.message_handler(func=lambda m: m.text == "🏠 Bosh menyu")
def send_welcome(message):
    chat_id = message.chat.id
    # Har safardan start bosilganda holatni tozalash
    user_data.pop(chat_id, None)
    
    keyboard = types.InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        types.InlineKeyboardButton("👨‍💻 Adminga murojaat", callback_data='contact_admin'),
        types.InlineKeyboardButton("💰 Reklama narxlari", callback_data='ads_prices'),
        types.InlineKeyboardButton("❓ Ko'p beriladigan savollar", callback_data='faq'),
        types.InlineKeyboardButton("🌐 Saytga o'tish", url='https://hamkorqurilish.uz')
    )
    
    try:
        bot.send_message(
            chat_id,
            "Assalomu alaykum! <b>HamkorQurilish</b> qo'llab-quvvatlash botiga xush kelibsiz.\n\n"
            "Sizga qanday yordam bera olamiz?\n"
            "Pastdagi tugmalardan birini tanlang yoki menyudan foydalaning:",
            reply_markup=get_main_keyboard(),
            parse_mode='HTML'
        )
        # Hamda inline klaviaturani ham yuboramiz
        bot.send_message(
            chat_id,
            "Bo'limni tanlang:",
            reply_markup=keyboard,
            parse_mode='HTML'
        )
    except Exception as e:
        logging.error(f"Error in start command: {e}")

@bot.message_handler(func=lambda m: m.text == "👨‍💻 Adminga murojaat")
def handle_contact_btn(message):
    process_contact_admin_core(message.chat.id)

@bot.callback_query_handler(func=lambda call: call.data == 'contact_admin')
def process_contact_admin(call):
    bot.answer_callback_query(call.id)
    process_contact_admin_core(call.message.chat.id)

def process_contact_admin_core(chat_id):
    msg = bot.send_message(
        chat_id,
        "📝 Iltimos, murojaatingiz <b>mavzusini</b> (sarlavhasini) kiriting:",
        parse_mode='HTML',
        reply_markup=types.ReplyKeyboardRemove() # Murojaat paytida menyuni yopamiz
    )
    bot.register_next_step_handler(msg, get_subject)

def get_subject(message):
    chat_id = message.chat.id
    if message.text == '/start':
        send_welcome(message)
        return

    user_data[chat_id] = {'subject': message.text}
    msg = bot.send_message(chat_id, "ℹ️ Endi murojaat haqida <b>batafsil</b> ma'lumot qoldiring:", parse_mode='HTML')
    bot.register_next_step_handler(msg, get_details)

def get_details(message):
    chat_id = message.chat.id
    if message.text == '/start':
        send_welcome(message)
        return

    if chat_id not in user_data:
        bot.send_message(chat_id, "Xatolik yuz berdi. Iltimos, /start buyrug'idan boshlang.")
        return

    user_data[chat_id]['details'] = message.text
    
    # Telefon raqamini so'rash
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    keyboard.add(types.KeyboardButton("📞 Telefon raqamni yuborish", request_contact=True))
    
    msg = bot.send_message(
        chat_id,
        "📞 Oxirgi qadam: Siz bilan bog'lanishimiz uchun <b>telefon raqamingizni</b> yuboring (pastdagi tugmani bosing yoki o'zingiz yozing):",
        reply_markup=keyboard,
        parse_mode='HTML'
    )
    bot.register_next_step_handler(msg, get_phone_and_finalize)

def get_phone_and_finalize(message):
    chat_id = message.chat.id
    if message.text == '/start':
        send_welcome(message)
        return

    if chat_id not in user_data:
        bot.send_message(chat_id, "Xatolik yuz berdi. Iltimos, /start buyrug'idan boshlang.")
        return

    # Escaping all user inputs for HTML security
    subject = html.escape(user_data[chat_id]['subject'])
    details = html.escape(user_data[chat_id]['details'])
    
    if message.contact:
        phone = html.escape(message.contact.phone_number)
    else:
        phone = html.escape(message.text)

    username = f"@{html.escape(message.from_user.username)}" if message.from_user.username else "Noma'lum"
    full_name = html.escape(message.from_user.full_name)
    
    # Kanalga jo'natish uchun chiroylik maket
    report_text = (
        "🚀 <b>YANGI MUROJAAT!</b>\n"
        "━━━━━━━━━━━━━━━━━━\n"
        f"📂 <b>Mavzu:</b> {subject}\n"
        f"📝 <b>Batafsil:</b> {details}\n\n"
        "👤 <b>Foydalanuvchi ma'lumotlari:</b>\n"
        f"  └ <b>Ism:</b> {full_name}\n"
        f"  └ <b>Username:</b> {username}\n"
        f"  └ <b>Tel:</b> <code>{phone}</code>\n"
        f"  └ <b>ID:</b> <code>{chat_id}</code>\n"
        "━━━━━━━━━━━━━━━━━━"
    )
    
    sent_to_channel = False
    sent_to_admin = False
    error_details = []

    # Send to Channel
    try:
        logging.info(f"Attempting to send report to Channel {CHANNEL_ID}")
        bot.send_message(CHANNEL_ID, report_text, parse_mode='HTML')
        sent_to_channel = True
        logging.info("Sent to Channel successfully")
    except Exception as e:
        error_details.append(f"Kanal: {str(e)}")
        logging.error(f"Error sending to channel: {e}")

    # Send to Admin (if configured)
    if ADMIN_ID:
        try:
            logging.info(f"Attempting to send report to Admin {ADMIN_ID}")
            bot.send_message(ADMIN_ID, report_text, parse_mode='HTML')
            sent_to_admin = True
            logging.info("Sent to Admin successfully")
        except Exception as e:
            error_details.append(f"Admin: {str(e)}")
            logging.error(f"Error sending to admin: {e}")

    if sent_to_channel or sent_to_admin:
        bot.send_message(
            chat_id,
            "✅ Rahmat! Murojaatingiz adminga muvaffaqiyatli yetkazildi.\n"
            "Tez orada siz bilan bog'lanishadi.",
            reply_markup=get_main_keyboard(),
            parse_mode='HTML'
        )
    else:
        detailed_error = "\n".join(error_details)
        bot.send_message(
            chat_id,
            f"❌ <b>Xatolik yuz berdi:</b> Murojaat yetkazilmadi.\n\n"
            f"<b>Sababi:</b>\n{detailed_error}\n\n"
            f"Iltimos, bot kanalda admin ekanligini va ruxsatlar borligini tekshiring.",
            parse_mode='HTML',
            reply_markup=get_main_keyboard()
        )
    # Cleanup user state
    user_data.pop(chat_id, None)

@bot.message_handler(func=lambda message: message.reply_to_message is not None and message.from_user.id == ADMIN_ID)
def handle_admin_reply(message):
    try:
        # Get the original report text from the message being replied to
        original_text = message.reply_to_message.text or message.reply_to_message.caption
        
        if not original_text:
            return

        # Try to find the User ID in the text
        # Format: ID: 123456789
        import re
        match = re.search(r'ID:\s*(\d+)', original_text)
        
        if match:
            user_chat_id = int(match.group(1))
            reply_text = f"<b>🔔 Admindan javob keldi:</b>\n\n{html.escape(message.text)}"
            
            bot.send_message(user_chat_id, reply_text, parse_mode='HTML')
            bot.reply_to(message, "✅ Javob foydalanuvchiga yuborildi.")
        else:
            bot.reply_to(message, "❌ Xatolik: Xabardan foydalanuvchi ID si topilmadi.")
            
    except Exception as e:
        logging.error(f"Error in handle_admin_reply: {e}")
        bot.reply_to(message, f"❌ Xatolik: {e}")

@bot.message_handler(func=lambda m: m.text == "💰 Reklama narxlari")
@bot.callback_query_handler(func=lambda call: call.data == 'ads_prices')
def process_ads_prices(target):
    # Handle both Message and CallbackQuery
    chat_id = target.chat.id if hasattr(target, 'chat') else target.from_user.id
    if hasattr(target, 'id') and not hasattr(target, 'chat'): # CallbackQuery
        bot.answer_callback_query(target.id)

    prices_text = (
        "📊 <b>Reklama xizmatlari va narxlari:</b>\n\n"
        "🏷 <b>Splash Screen (Ilova ochilganda):</b>\n"
        "   └ 150,000 so'm / haftasiga\n\n"
        "🚩 <b>Asosiy sahifa (Banner):</b>\n"
        "   └ 100,000 so'm / haftasiga\n\n"
        "🔝 <b>E'lonni TOP'ga chiqarish:</b>\n"
        "   └ 50,000 so'm / haftasiga\n\n"
        "📢 <b>Telegram kanalda post:</b>\n"
        "   └ 30,000 so'm (bir martalik)\n\n"
        "💡 <i>Barcha narxlar kelishiladi.</i> Murojaat uchun tepada 'Adminga murojaat' tugmasini bosing."
    )
    bot.send_message(chat_id, prices_text, parse_mode='HTML', reply_markup=get_main_keyboard())

@bot.message_handler(func=lambda m: m.text == "❓ Ko'p beriladigan savollar")
@bot.callback_query_handler(func=lambda call: call.data == 'faq')
def process_faq(target):
    chat_id = target.chat.id if hasattr(target, 'chat') else target.from_user.id
    if hasattr(target, 'id') and not hasattr(target, 'chat'):
        bot.answer_callback_query(target.id)

    faq_text = (
        "❓ <b>Ko'p beriladigan savollar:</b>\n\n"
        "<b>Q: Qanday qilib usta sifatida ro'yxatdan o'taman?</b>\n"
        "<b>A:</b> Ilovani yuklab oling, profil bo'limida 'Mutaxassis' rolini tanlang.\n\n"
        "<b>Q: E'lon berish bepulmi?</b>\n"
        "<b>A:</b> Oddiy e'lonlar bepul, pullik xizmatlar orqali ko'proq mijoz topishingiz mumkin.\n\n"
        "<b>Q: To'lovlarni qanday amalga oshiraman?</b>\n"
        "<b>A:</b> Hozirda Payme va Click tizimlari orqali (tez orada)."
    )
    bot.send_message(chat_id, faq_text, parse_mode='HTML', reply_markup=get_main_keyboard())

if __name__ == '__main__':
    logging.info("Bot ishga tushirildi (Telebot)...")
    bot.remove_webhook()
    bot.infinity_polling()
