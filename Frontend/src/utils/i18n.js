// i18n Translation System for HamkorQurilish Frontend

const translations = {
    uz: {
        // Navigation
        home: "Bosh sahifa",
        dashboard: "Kabinet",
        messages: "Xabarlar",
        profile: "Profil",
        logout: "Chiqish",
        login: "Kirish",
        postAd: "E'lon berish",

        // Categories
        all: "Barchasi",
        specialists: "Ustalar",
        equipment: "Texnika Ijarasi",
        materials: "Qurilish Mollari",
        foremen: "Prorablar",

        // Common
        search: "Qidiruv",
        filter: "Filtr",
        sort: "Saralash",
        price: "Narx",
        location: "Joylashuv",
        verified: "Tasdiqlangan",
        available: "Mavjud",
        busy: "Band",
        loading: "Yuklanmoqda...",

        // Auth
        phoneNumber: "Telefon raqam",
        enterCode: "Kodni kiriting",
        verify: "Tasdiqlash",
        whoAreYou: "Kimsiz?",
        specialist: "Usta",
        equipmentOwner: "Texnika",
        customer: "Mijoz",

        // Profile
        editProfile: "Profilni tahrirlash",
        fullName: "To'liq ism",
        bio: "Haqida",
        region: "Hudud",
        save: "Saqlash",
        cancel: "Bekor qilish",

        // Dashboard
        myListings: "Mening e'lonlarim",
        addNew: "Yangi qo'shish",
        title: "Sarlavha",
        description: "Tavsif",
        uploadImage: "Rasm yuklash",
        publish: "Chop etish",

        // Messages
        noMessages: "Hali xabarlar yo'q",
        send: "Yuborish",
        typeMessage: "Xabar yozing...",

        // Reviews
        reviews: "Sharhlar",
        rating: "Reyting",
        leaveReview: "Sharh qoldirish",
        stars: "Yulduzlar",
    },

    en: {
        // Navigation
        home: "Home",
        dashboard: "Dashboard",
        messages: "Messages",
        profile: "Profile",
        logout: "Logout",
        login: "Login",
        postAd: "Post Ad",

        // Categories
        all: "All",
        specialists: "Specialists",
        equipment: "Equipment Rental",
        materials: "Construction Materials",
        foremen: "Foremen",

        // Common
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        price: "Price",
        location: "Location",
        verified: "Verified",
        available: "Available",
        busy: "Busy",
        loading: "Loading...",

        // Auth
        phoneNumber: "Phone Number",
        enterCode: "Enter Code",
        verify: "Verify",
        whoAreYou: "Who are you?",
        specialist: "Specialist",
        equipmentOwner: "Equipment",
        customer: "Customer",

        // Profile
        editProfile: "Edit Profile",
        fullName: "Full Name",
        bio: "About",
        region: "Region",
        save: "Save",
        cancel: "Cancel",

        // Dashboard
        myListings: "My Listings",
        addNew: "Add New",
        title: "Title",
        description: "Description",
        uploadImage: "Upload Image",
        publish: "Publish",

        // Messages
        noMessages: "No messages yet",
        send: "Send",
        typeMessage: "Type a message...",

        // Reviews
        reviews: "Reviews",
        rating: "Rating",
        leaveReview: "Leave Review",
        stars: "Stars",
    },

    ru: {
        // Navigation
        home: "Главная",
        dashboard: "Кабинет",
        messages: "Сообщения",
        profile: "Профиль",
        logout: "Выход",
        login: "Вход",
        postAd: "Разместить",

        // Categories
        all: "Все",
        specialists: "Специалисты",
        equipment: "Аренда Техники",
        materials: "Стройматериалы",
        foremen: "Прорабы",

        // Common
        search: "Поиск",
        filter: "Фильтр",
        sort: "Сортировка",
        price: "Цена",
        location: "Местоположение",
        verified: "Проверено",
        available: "Доступно",
        busy: "Занято",
        loading: "Загрузка...",

        // Auth
        phoneNumber: "Номер телефона",
        enterCode: "Введите код",
        verify: "Подтвердить",
        whoAreYou: "Кто вы?",
        specialist: "Специалист",
        equipmentOwner: "Техника",
        customer: "Клиент",

        // Profile
        editProfile: "Редактировать профиль",
        fullName: "Полное имя",
        bio: "О себе",
        region: "Регион",
        save: "Сохранить",
        cancel: "Отмена",

        // Dashboard
        myListings: "Мои объявления",
        addNew: "Добавить",
        title: "Заголовок",
        description: "Описание",
        uploadImage: "Загрузить фото",
        publish: "Опубликовать",

        // Messages
        noMessages: "Нет сообщений",
        send: "Отправить",
        typeMessage: "Напишите сообщение...",

        // Reviews
        reviews: "Отзывы",
        rating: "Рейтинг",
        leaveReview: "Оставить отзыв",
        stars: "Звезды",
    }
};

// Get current language from localStorage, default to Uzbek
export const getCurrentLanguage = () => {
    return localStorage.getItem('language') || 'uz';
};

// Set language
export const setLanguage = (lang) => {
    localStorage.setItem('language', lang);
    window.location.reload(); // Reload to apply changes
};

// Translation hook
export const useTranslation = () => {
    const lang = getCurrentLanguage();

    const t = (key) => {
        return translations[lang]?.[key] || translations.uz[key] || key;
    };

    return { t, lang, setLanguage };
};

export default translations;
