# i18n Translation System for HamkorQurilish

translations = {
    "uz": {
        # Navigation
        "home": "Bosh sahifa",
        "dashboard": "Kabinet",
        "messages": "Xabarlar",
        "profile": "Profil",
        "logout": "Chiqish",
        "login": "Kirish",
        "post_ad": "E'lon berish",
        
        # Categories
        "all": "Barchasi",
        "specialists": "Ustalar",
        "equipment": "Texnika Ijarasi",
        "materials": "Qurilish Mollari",
        "foremen": "Prorablar",
        
        # Common
        "search": "Qidiruv",
        "filter": "Filtr",
        "sort": "Saralash",
        "price": "Narx",
        "location": "Joylashuv",
        "verified": "Tasdiqlangan",
        "available": "Mavjud",
        "busy": "Band",
        
        # Auth
        "phone_number": "Telefon raqam",
        "enter_code": "Kodni kiriting",
        "verify": "Tasdiqlash",
        "who_are_you": "Kimsiz?",
        "specialist": "Usta",
        "equipment_owner": "Texnika",
        "customer": "Mijoz",
        
        # Profile
        "edit_profile": "Profilni tahrirlash",
        "full_name": "To'liq ism",
        "bio": "Haqida",
        "region": "Hudud",
        "save": "Saqlash",
        "cancel": "Bekor qilish",
        
        # Dashboard
        "my_listings": "Mening e'lonlarim",
        "add_new": "Yangi qo'shish",
        "title": "Sarlavha",
        "description": "Tavsif",
        "upload_image": "Rasm yuklash",
        "publish": "Chop etish",
        
        # Messages
        "no_messages": "Hali xabarlar yo'q",
        "send": "Yuborish",
        "type_message": "Xabar yozing...",
        
        # Reviews
        "reviews": "Sharhlar",
        "rating": "Reyting",
        "leave_review": "Sharh qoldirish",
        "stars": "Yulduzlar",
        
        # Ads
        "advertisement": "Reklama",
        "sponsored": "Homiylik",
        "skip_ad": "O'tkazib yuborish",
    },
    
    "en": {
        # Navigation
        "home": "Home",
        "dashboard": "Dashboard",
        "messages": "Messages",
        "profile": "Profile",
        "logout": "Logout",
        "login": "Login",
        "post_ad": "Post Ad",
        
        # Categories
        "all": "All",
        "specialists": "Specialists",
        "equipment": "Equipment Rental",
        "materials": "Construction Materials",
        "foremen": "Foremen",
        
        # Common
        "search": "Search",
        "filter": "Filter",
        "sort": "Sort",
        "price": "Price",
        "location": "Location",
        "verified": "Verified",
        "available": "Available",
        "busy": "Busy",
        
        # Auth
        "phone_number": "Phone Number",
        "enter_code": "Enter Code",
        "verify": "Verify",
        "who_are_you": "Who are you?",
        "specialist": "Specialist",
        "equipment_owner": "Equipment",
        "customer": "Customer",
        
        # Profile
        "edit_profile": "Edit Profile",
        "full_name": "Full Name",
        "bio": "About",
        "region": "Region",
        "save": "Save",
        "cancel": "Cancel",
        
        # Dashboard
        "my_listings": "My Listings",
        "add_new": "Add New",
        "title": "Title",
        "description": "Description",
        "upload_image": "Upload Image",
        "publish": "Publish",
        
        # Messages
        "no_messages": "No messages yet",
        "send": "Send",
        "type_message": "Type a message...",
        
        # Reviews
        "reviews": "Reviews",
        "rating": "Rating",
        "leave_review": "Leave Review",
        "stars": "Stars",
        
        # Ads
        "advertisement": "Advertisement",
        "sponsored": "Sponsored",
        "skip_ad": "Skip Ad",
    },
    
    "ru": {
        # Navigation
        "home": "Главная",
        "dashboard": "Кабинет",
        "messages": "Сообщения",
        "profile": "Профиль",
        "logout": "Выход",
        "login": "Вход",
        "post_ad": "Разместить",
        
        # Categories
        "all": "Все",
        "specialists": "Специалисты",
        "equipment": "Аренда Техники",
        "materials": "Стройматериалы",
        "foremen": "Прорабы",
        
        # Common
        "search": "Поиск",
        "filter": "Фильтр",
        "sort": "Сортировка",
        "price": "Цена",
        "location": "Местоположение",
        "verified": "Проверено",
        "available": "Доступно",
        "busy": "Занято",
        
        # Auth
        "phone_number": "Номер телефона",
        "enter_code": "Введите код",
        "verify": "Подтвердить",
        "who_are_you": "Кто вы?",
        "specialist": "Специалист",
        "equipment_owner": "Техника",
        "customer": "Клиент",
        
        # Profile
        "edit_profile": "Редактировать профиль",
        "full_name": "Полное имя",
        "bio": "О себе",
        "region": "Регион",
        "save": "Сохранить",
        "cancel": "Отмена",
        
        # Dashboard
        "my_listings": "Мои объявления",
        "add_new": "Добавить",
        "title": "Заголовок",
        "description": "Описание",
        "upload_image": "Загрузить фото",
        "publish": "Опубликовать",
        
        # Messages
        "no_messages": "Нет сообщений",
        "send": "Отправить",
        "type_message": "Напишите сообщение...",
        
        # Reviews
        "reviews": "Отзывы",
        "rating": "Рейтинг",
        "leave_review": "Оставить отзыв",
        "stars": "Звезды",
        
        # Ads
        "advertisement": "Реклама",
        "sponsored": "Спонсировано",
        "skip_ad": "Пропустить",
    }
}

def get_translation(lang: str, key: str) -> str:
    """Get translation for a key in specified language"""
    return translations.get(lang, translations["uz"]).get(key, key)

def get_user_language(user) -> str:
    """Get user's preferred language, default to Uzbek"""
    if hasattr(user, 'preferred_language') and user.preferred_language:
        return user.preferred_language
    return "uz"
