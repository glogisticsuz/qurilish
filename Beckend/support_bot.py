import logging
import traceback
import os
import telebot
import html
import re
from telebot import types
from dotenv import load_dotenv

# Environment variables
load_dotenv()
# Using the token provided by the user
API_TOKEN = os.getenv('SUPPORT_BOT_TOKEN', '8352876595:AAHmlIRmwKV4-MQU-BerYb8mIgQqNJnQhTc')
raw_channel_id = os.getenv('SUPPORT_CHANNEL_ID', '@HamkorQurilish_murojat')
ADMIN_ID = os.getenv('SUPPORT_ADMIN_ID', '816849899')

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
        types.KeyboardButton("📝 Murojaat qoldirish"),
        types.KeyboardButton("📢 Reklama berish")
    )
    keyboard.add(types.KeyboardButton("ℹ️ Ma'lumot"))
    return keyboard

def get_cancel_keyboard():
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(types.KeyboardButton("🔙 Bekor qilish"))
    return keyboard

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    chat_id = message.chat.id
    logging.info(f"Support Bot: Received /start from {chat_id}")
    user_data.pop(chat_id, None)
    
    bot.send_message(
        chat_id,
        "Assalomu alaykum! <b>HamkorQurilish</b> qo'llab-quvvatlash botiga xush kelibsiz. ✨\n\n"
        "Quyidagi tugmalardan birini tanlang:",
        parse_mode='HTML',
        reply_markup=get_main_keyboard()
    )

@bot.message_handler(func=lambda message: message.text == "📝 Murojaat qoldirish")
def start_report(message):
    chat_id = message.chat.id
    msg = bot.send_message(
        chat_id,
        "📂 Iltimos, murojaatingiz <b>mavzusini</b> (sarlavhasini) yozing:\n\n"
        "<i>Masalan: Taklif, Shikoyat yoki Xatolik haqida.</i>",
        parse_mode='HTML',
        reply_markup=get_cancel_keyboard()
    )
    bot.register_next_step_handler(msg, get_subject)

@bot.message_handler(func=lambda message: message.text == "📢 Reklama berish")
def start_ads(message):
    chat_id = message.chat.id
    bot.send_message(
        chat_id,
        "📢 <b>Reklama xizmati</b>\n\n"
        "Platformamizda reklama berish bo'yicha ma'lumot olish uchun quyidagi mavzuni tanlab xabar qoldiring yoki to'g'ridan-to'g'ri admin bilan bog'laning.\n\n"
        "Murojaat qoldirish tugmasini bosib, mavzuga 'REKLAMA' deb yozishingiz mumkin.",
        parse_mode='HTML',
        reply_markup=get_main_keyboard()
    )

@bot.message_handler(func=lambda message: message.text == "ℹ️ Ma'lumot")
def info_msg(message):
    bot.send_message(
        message.chat.id,
        "💡 <b>HamkorQurilish Bot</b>\n\n"
        "Ushbu bot orqali siz loyiha ma'muriyatiga o'z murojaatlaringizni, "
        "takliflaringizni yoki reklama bo'yicha so'rovlaringizni yuborishingiz mumkin.",
        parse_mode='HTML'
    )

def get_subject(message):
    chat_id = message.chat.id
    text = message.text

    if text == "🔙 Bekor qilish" or text == "/start":
        send_welcome(message)
        return

    user_data[chat_id] = {'subject': text}
    msg = bot.send_message(
        chat_id, 
        "ℹ️ Endi murojaat haqida <b>batafsil</b> ma'lumot yozing:", 
        parse_mode='HTML',
        reply_markup=get_cancel_keyboard()
    )
    bot.register_next_step_handler(msg, get_details)

def get_details(message):
    chat_id = message.chat.id
    text = message.text

    if text == "🔙 Bekor qilish" or text == "/start":
        send_welcome(message)
        return

    if chat_id not in user_data:
        send_welcome(message)
        return

    user_data[chat_id]['details'] = text
    
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    keyboard.add(types.KeyboardButton("📞 Telefon raqamni yuborish", request_contact=True))
    keyboard.add(types.KeyboardButton("🔙 Bekor qilish"))
    
    msg = bot.send_message(
        chat_id,
        "📞 Oxirgi qadam: Siz bilan bog'lanishimiz uchun <b>telefon raqamingizni</b> yuboring (pastdagi tugmani bosing yoki o'zingiz yozing):",
        reply_markup=keyboard,
        parse_mode='HTML'
    )
    bot.register_next_step_handler(msg, get_phone_and_finalize)

def get_phone_and_finalize(message):
    chat_id = message.chat.id
    
    if message.text == "🔙 Bekor qilish" or message.text == "/start":
        send_welcome(message)
        return

    if chat_id not in user_data:
        send_welcome(message)
        return

    subject = html.escape(user_data[chat_id]['subject'])
    details = html.escape(user_data[chat_id]['details'])
    
    if message.contact:
        phone = html.escape(message.contact.phone_number)
    else:
        phone = html.escape(message.text)

    username = f"@{html.escape(message.from_user.username)}" if message.from_user.username else "-"
    full_name = html.escape(message.from_user.full_name)
    
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
    
    # Send to Channel and Admin
    targets = [raw_channel_id, ADMIN_ID]
    success = False
    for target in targets:
        if not target: continue
        try:
            bot.send_message(target, report_text, parse_mode='HTML')
            success = True
        except Exception as e:
            logging.error(f"Error sending to {target}: {e}")

    if success:
        bot.send_message(
            chat_id,
            "✅ Rahmat! Murojaatingiz adminga muvaffaqiyatli yetkazildi.\n"
            "Tez orada siz bilan bog'lanishadi.",
            reply_markup=get_main_keyboard(),
            parse_mode='HTML'
        )
    else:
        bot.send_message(
            chat_id, 
            "❌ Xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.",
            reply_markup=get_main_keyboard()
        )
    
    user_data.pop(chat_id, None)

@bot.message_handler(func=lambda message: message.reply_to_message is not None)
def handle_admin_reply(message):
    if str(message.from_user.id) != str(ADMIN_ID):
        return

    try:
        original_text = message.reply_to_message.text or message.reply_to_message.caption
        if not original_text: return

        match = re.search(r'ID:\s*(\d+)', original_text)
        if match:
            user_chat_id = int(match.group(1))
            reply_text = f"<b>🔔 Admindan javob keldi:</b>\n\n{html.escape(message.text)}"
            bot.send_message(user_chat_id, reply_text, parse_mode='HTML')
            bot.reply_to(message, "✅ Javob foydalanuvchiga yuborildi.")
        else:
            bot.reply_to(message, "❌ Foydalanuvchi ID si topilmadi.")
    except Exception as e:
        logging.error(f"Error in admin reply: {e}")

if __name__ == '__main__':
    logging.info("Support Bot ishga tushirildi...")
    bot.remove_webhook()
    bot.infinity_polling()
