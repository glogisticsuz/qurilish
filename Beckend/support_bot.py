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
raw_channel_id = os.getenv('SUPPORT_CHANNEL_ID', '@Megastroy_channel')

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

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    chat_id = message.chat.id
    # Har safardan start bosilganda holatni tozalash
    user_data.pop(chat_id, None)
    
    keyboard = types.InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        types.InlineKeyboardButton("👨‍💻 Adminga murojaat", callback_data='contact_admin'),
        types.InlineKeyboardButton("💰 Reklama narxlari", callback_data='ads_prices'),
        types.InlineKeyboardButton("❓ Ko'p beriladigan savollar", callback_data='faq'),
        types.InlineKeyboardButton("🌐 Saytga o'tish", url='https://megastroy.uz')
    )
    
    try:
        bot.reply_to(
            message,
            "Assalomu alaykum! <b>MegaStroy</b> qo'llab-quvvatlash botiga xush kelibsiz.\n\n"
            "Sizga qanday yordam bera olamiz?\n"
            "Pastdagi tugmalardan birini tanlang:",
            reply_markup=keyboard,
            parse_mode='HTML'
        )
    except Exception as e:
        logging.error(f"Error in start command: {e}")

@bot.callback_query_handler(func=lambda call: call.data == 'contact_admin')
def process_contact_admin(call):
    chat_id = call.message.chat.id
    bot.answer_callback_query(call.id)
    msg = bot.send_message(
        chat_id,
        "📝 Iltimos, murojaatingiz <b>mavzusini</b> (sarlavhasini) kiriting:",
        parse_mode='HTML'
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
        "━━━━━━━━━━━━━━━━━━"
    )
    
    try:
        logging.info(f"Attempting to send report to {CHANNEL_ID}")
        bot.send_message(CHANNEL_ID, report_text, parse_mode='HTML')
        logging.info("Report sent successfully to channel")
        bot.send_message(
            chat_id,
            "✅ Rahmat! Murojaatingiz adminga muvaffaqiyatli yetkazildi.\n"
            "Tez orada siz bilan bog'lanishadi.",
            reply_markup=types.ReplyKeyboardRemove(),
            parse_mode='HTML'
        )
    except Exception as e:
        error_msg = html.escape(str(e))
        logging.error(f"Error sending to channel: {traceback.format_exc()}")
        bot.send_message(
            chat_id,
            f"❌ <b>Xatolik yuz berdi:</b> Bot kanalga xabar yubora olmadi.\n\n"
            f"<b>Sababi:</b> {error_msg}\n\n"
            f"Iltimos, bot @Megastroy_channel kanalida <b>Admin</b> ekanligini va xabar yuborish huquqi borligini tekshiring.",
            parse_mode='HTML',
            reply_markup=types.ReplyKeyboardRemove()
        )
    finally:
        user_data.pop(chat_id, None)

@bot.callback_query_handler(func=lambda call: call.data == 'ads_prices')
def process_ads_prices(call):
    bot.answer_callback_query(call.id)
    prices_text = (
        "📊 **Reklama xizmatlari va narxlari:**\n\n"
        "🏷 **Splash Screen (Ilova ochilganda):**\n"
        "   └ 150,000 so'm / haftasiga\n\n"
        "🚩 **Asosiy sahifa (Banner):**\n"
        "   └ 100,000 so'm / haftasiga\n\n"
        "🔝 **E'lonni TOP'ga chiqarish:**\n"
        "   └ 50,000 so'm / haftasiga\n\n"
        "📢 **Telegram kanalda post:**\n"
        "   └ 30,000 so'm (bir martalik)\n\n"
        "💡 *Barcha narxlar kelishiladi.* Murojaat uchun tepada 'Adminga murojaat' tugmasini bosing."
    )
    bot.send_message(call.from_user.id, prices_text, parse_mode='Markdown')

@bot.callback_query_handler(func=lambda call: call.data == 'faq')
def process_faq(call):
    bot.answer_callback_query(call.id)
    faq_text = (
        "❓ **Ko'p beriladigan savollar:**\n\n"
        "**Q: Qanday qilib usta sifatida ro'yxatdan o'taman?**\n"
        "**A:** Ilovani yuklab oling, profil bo'limida 'Mutaxassis' rolini tanlang.\n\n"
        "**Q: E'lon berish bepulmi?**\n"
        "**A:** Oddiy e'lonlar bepul, pullik xizmatlar orqali ko'proq mijoz topishingiz mumkin.\n\n"
        "**Q: To'lovlarni qanday amalga oshiraman?**\n"
        "**A:** Hozirda Payme va Click tizimlari orqali (tez orada)."
    )
    bot.send_message(call.from_user.id, faq_text, parse_mode='Markdown')

if __name__ == '__main__':
    logging.info("Bot ishga tushirildi (Telebot)...")
    bot.remove_webhook()
    bot.infinity_polling()
