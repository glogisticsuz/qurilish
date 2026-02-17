import logging
from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
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
    waiting_for_subject = State()
    waiting_for_details = State()
    waiting_for_phone = State()

# Bot va Dispatcher obyektlarini yaratish (MemoryStorage bilan)
bot = Bot(token=API_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

@dp.message_handler(commands=['start', 'help'], state="*")
async def send_welcome(message: types.Message, state: FSMContext):
    """
    Start buyrug'i uchun javob
    """
    await state.finish()
    keyboard = InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        InlineKeyboardButton("👨‍💻 Adminga murojaat", callback_data='contact_admin'),
        InlineKeyboardButton("💰 Reklama narxlari", callback_data='ads_prices'),
        InlineKeyboardButton("❓ Ko'p beriladigan savollar", callback_data='faq'),
        InlineKeyboardButton("🌐 Saytga o'tish", url='https://megastroy.uz')
    )
    
    await message.reply(
        "Assalomu alaykum! **MegaStroy** qo'llab-quvvatlash botiga xush kelibsiz.\n\n"
        "Sizga qanday yordam bera olamiz?\n"
        "Pastdagi tugmalardan birini tanlang:",
        reply_markup=keyboard,
        parse_mode='Markdown'
    )

@dp.callback_query_handler(lambda c: c.data == 'contact_admin', state="*")
async def process_contact_admin(callback_query: types.CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
    await bot.send_message(
        callback_query.from_user.id,
        "📝 Iltimos, murojaatingiz **mavzusini** (sarlavhasini) kiriting:"
    )
    await SupportStates.waiting_for_subject.set()

@dp.message_handler(state=SupportStates.waiting_for_subject)
async def get_subject(message: types.Message, state: FSMContext):
    await state.update_data(subject=message.text)
    await message.answer("ℹ️ Endi murojaat haqida **batafsil** ma'lumot qoldiring:")
    await SupportStates.waiting_for_details.set()

@dp.message_handler(state=SupportStates.waiting_for_details)
async def get_details(message: types.Message, state: FSMContext):
    await state.update_data(details=message.text)
    
    # Telefon raqamini so'rash
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    keyboard.add(KeyboardButton("📞 Telefon raqamni yuborish", request_contact=True))
    
    await message.answer(
        "📞 Oxirgi qadam: Siz bilan bog'lanishimiz uchun **telefon raqamingizni** yuboring (pastdagi tugmani bosing yoki o'zingiz yozing):",
        reply_markup=keyboard
    )
    await SupportStates.waiting_for_phone.set()

@dp.message_handler(content_types=['contact', 'text'], state=SupportStates.waiting_for_phone)
async def get_phone_and_finalize(message: types.Message, state: FSMContext):
    data = await state.get_data()
    subject = data.get('subject')
    details = data.get('details')
    
    if message.contact:
        phone = message.contact.phone_number
    else:
        phone = message.text

    username = f"@{message.from_user.username}" if message.from_user.username else "Noma'lum"
    full_name = message.from_user.full_name
    
    # Kanalga jo'natish uchun chiroylik maket
    report_text = (
        "🚀 **YANGI MUROJAAT!**\n"
        "━━━━━━━━━━━━━━━━━━\n"
        f"📂 **Mavzu:** {subject}\n"
        f"📝 **Batafsil:** {details}\n\n"
        "👤 **Foydalanuvchi ma'lumotlari:**\n"
        f"  └ **Ism:** {full_name}\n"
        f"  └ **Username:** {username}\n"
        f"  └ **Tel:** `{phone}`\n"
        "━━━━━━━━━━━━━━━━━━"
    )
    
    try:
        await bot.send_message(CHANNEL_ID, report_text, parse_mode='Markdown')
        await message.answer(
            "✅ Rahmat! Murojaatingiz adminga muvaffaqiyatli yetkazildi.\n"
            "Tez orada siz bilan bog'lanishadi.",
            reply_markup=ReplyKeyboardRemove()
        )
    except Exception as e:
        logging.error(f"Error sending to channel: {e}")
        await message.answer(
            "❌ Xatolik yuz berdi. Iltimos, birozdan so'ng qayta urinib ko'ring yoki admin bilan to'g'ridan-to'g'ri bog'laning.",
            reply_markup=ReplyKeyboardRemove()
        )
    
    await state.finish()

@dp.callback_query_handler(lambda c: c.data == 'ads_prices', state="*")
async def process_ads_prices(callback_query: types.CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
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
    await bot.send_message(callback_query.from_user.id, prices_text, parse_mode='Markdown')

@dp.callback_query_handler(lambda c: c.data == 'faq', state="*")
async def process_faq(callback_query: types.CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
    faq_text = (
        "❓ **Ko'p beriladigan savollar:**\n\n"
        "**Q: Qanday qilib usta sifatida ro'yxatdan o'taman?**\n"
        "A: Ilovani yuklab oling, profil bo'limida 'Mutaxassis' rolini tanlang.\n\n"
        "**Q: E'lon berish bepulmi?**\n"
        "A: Oddiy e'lonlar bepul, pullik xizmatlar orqali ko'proq mijoz topishingiz mumkin.\n\n"
        "**Q: To'lovlarni qanday amalga oshiraman?**\n"
        "A: Hozirda Payme va Click tizimlari orqali (tez orada)."
    )
    await bot.send_message(callback_query.from_user.id, faq_text, parse_mode='Markdown')

if __name__ == '__main__':
    print("Bot muvaffaqiyatli ishga tushdi...")
    executor.start_polling(dp, skip_updates=True)
