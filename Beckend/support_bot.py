import logging
from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

# Bot tokenini shu yerga qo'ying
API_TOKEN = '8415608737:AAFLd3RagklCMPYPkDzNzDYMU4Ey_1Phgo0'

# Logging sozlash
logging.basicConfig(level=logging.INFO)

# Bot va Dispatcher obyektlarini yaratish
bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start', 'help'])
async def send_welcome(message: types.Message):
    """
    Start buyrug'i uchun javob
    """
    keyboard = InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        InlineKeyboardButton("👨‍💻 Adminga murojaat", callback_data='contact_admin'),
        InlineKeyboardButton("💰 Reklama narxlari", callback_data='ads_prices'),
        InlineKeyboardButton("❓ Ko'p beriladigan savollar", callback_data='faq'),
        InlineKeyboardButton("🌐 Saytga o'tish", url='https://megastroy.uz') # O'zgartirishingiz mumkin
    )
    
    await message.reply(
        "Assalomu alaykum! MegaStroy qo'llab-quvvatlash botiga xush kelibsiz.\n"
        "Sizga qanday yordam bera olamiz?",
        reply_markup=keyboard
    )

@dp.callback_query_handler(lambda c: c.data == 'contact_admin')
async def process_contact_admin(callback_query: types.CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
    await bot.send_message(
        callback_query.from_user.id,
        "👨‍💻 Adminga murojaat qilish uchun: @yangiustalar_admin (Ushbu usernameni o'zgartirishingiz mumkin)"
    )

@dp.callback_query_handler(lambda c: c.data == 'ads_prices')
async def process_ads_prices(callback_query: types.CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
    prices_text = (
        "💰 **Reklama narxlari:**\n\n"
        "1. Asosiy sahifada banner: 100,000 so'm/hafta\n"
        "2. E'lonni TOP'ga chiqarish: 50,000 so'm/hafta\n"
        "3. Telegram kanalda e'lon: 30,000 so'm\n\n"
        "To'lov usullari: Payme, Click."
    )
    await bot.send_message(callback_query.from_user.id, prices_text, parse_mode='Markdown')

@dp.callback_query_handler(lambda c: c.data == 'faq')
async def process_faq(callback_query: types.CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
    faq_text = (
        "❓ **Ko'p beriladigan savollar:**\n\n"
        "Q: Qanday qilib e'lon beraman?\n"
        "A: Ilovadagi '+' tugmasini bosing.\n\n"
        "Q: Profilni qanday tasdiqlayman?\n"
        "A: Adminga pasport rasmini yuboring."
    )
    await bot.send_message(callback_query.from_user.id, faq_text, parse_mode='Markdown')

if __name__ == '__main__':
    print("Bot ishga tushdi...")
    executor.start_polling(dp, skip_updates=True)
