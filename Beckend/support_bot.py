from aiogram.dispatcher.filters.state import State, StatesGroup
from aiogram.dispatcher import FSMContext
from aiogram.contrib.fsm_storage.memory import MemoryStorage

# Bot tokenini shu yerga qo'ying
API_TOKEN = '8415608737:AAFLd3RagklCMPYPkDzNzDYMU4Ey_1Phgo0'
# Kanal manzili
CHANNEL_ID = '@Megastroy_channel'

# Logging sozlash
logging.basicConfig(level=logging.INFO)

# State-lar yaratish
class SupportStates(StatesGroup):
    waiting_for_message = State()
    waiting_for_phone = State()

# Bot va Dispatcher obyektlarini yaratish (MemoryStorage bilan)
bot = Bot(token=API_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

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
        InlineKeyboardButton("🌐 Saytga o'tish", url='https://megastroy.uz')
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
        "Sizning murojaatingiz adminga yuboriladi. Iltimos, xabaringizni yozing:"
    )
    await SupportStates.waiting_for_message.set()

@dp.message_handler(state=SupportStates.waiting_for_message)
async def get_support_message(message: types.Message, state: FSMContext):
    await state.update_data(user_message=message.text)
    
    # Telefon raqamini so'rash (tugma orqali)
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    keyboard.add(types.KeyboardButton("📞 Telefon raqamni yuborish", request_contact=True))
    
    await message.answer(
        "Murojaatingiz qabul qilindi. Adminga siz bilan bog'lanishi uchun iltimos, telefon raqamingizni yuboring:",
        reply_markup=keyboard
    )
    await SupportStates.waiting_for_phone.set()

@dp.message_handler(content_types=['contact', 'text'], state=SupportStates.waiting_for_phone)
async def get_support_phone(message: types.Message, state: FSMContext):
    data = await state.get_data()
    user_message = data.get('user_message')
    
    if message.contact:
        phone = message.contact.phone_number
    else:
        phone = message.text

    username = f"@{message.from_user.username}" if message.from_user.username else "Noma'lum"
    full_name = message.from_user.full_name
    
    # Kanalga jo'natish
    report_text = (
        "🆕 **Yangi murojaat!**\n\n"
        f"👤 **Foydalanuvchi:** {full_name}\n"
        f"🆔 **Username:** {username}\n"
        f"📞 **Tel:** {phone}\n\n"
        f"📝 **Xabar:**\n{user_message}"
    )
    
    try:
        await bot.send_message(CHANNEL_ID, report_text, parse_mode='Markdown')
        await message.answer("Rahmat! Murojaatingiz adminga yetkazildi. Tez orada siz bilan bog'lanishadi.", reply_markup=types.ReplyKeyboardRemove())
    except Exception as e:
        logging.error(f"Error sending to channel: {e}")
        await message.answer("Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.", reply_markup=types.ReplyKeyboardRemove())
    
    await state.finish()

@dp.callback_query_handler(lambda c: c.data == 'ads_prices')
async def process_ads_prices(callback_query: types.CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
    prices_text = (
        "💰 **Reklama narxlari:**\n\n"
        "1. Asosiy sahifada banner: 100,000 so'm/hafta\n"
        "2. E'lonni TOP'ga chiqarish: 50,000 so'm/hafta\n"
        "3. Telegram kanalda e'lon: 30,000 so'm\n\n"
        "Batafsil ma'lumot uchun: @Megastroy_support_user_bot"
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
