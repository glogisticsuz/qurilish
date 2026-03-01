# Google Play Store-ga yuklash bo'yicha yo'riqnoma (2024-2025)

"HamkorQurilish" ilovasini muvaffaqiyatli nashr etish uchun quyidagi qoidalarga va qadamlarga amal qilish zarur. Google Play 2024-yildan boshlab yangi talablarni joriy qildi.

## 1. Texnik talablar (Tayyor)
*   **Target API Level**: Ilovangiz hozirda **API 35** ga sozlangan. Bu 2025-yilgi eng oxirgi talabga (Android 15) to'liq javob beradi.
*   **VersionCode**: Har safar yangi `.aab` yuklaganingizda `versionCode`ni oshirib borishingiz kerak (Hozirgi oxirgi build: 6).
*   **AAB format**: Google Play faqat `.aab` formatini qabul qiladi.

## 2. Muhim qonun-qoidalar va hujjatlar

### Maxfiylik Siyosati (Privacy Policy)
*   Ilovada **Kamera** ruxsatnomasi ishlatilgani uchun, Play Console-da Maxfiylik siyosati linkini ko'rsatishingiz shart.
*   Tayyor matn: [PRIVACY_POLICY_UZ.md](file:///c:/Users/king/Desktop/yangiUstalar/MobileApp/PRIVACY_POLICY_UZ.md)

### Data Safety (Ma'lumotlar xavfsizligi) bo'limi
Play Console-da "Data Safety" so'rovnomasini to'ldirishingiz kerak. Unda quyidagilarni ko'rsatasiz:
*   **To'planadigan ma'lumotlar**: Ism, telefon raqami, rasm (Kameradan olinsa).
*   **Maqsadi**: Ilova funksionalligi, xabarlar yuborish, profilni boshqarish.
*   **Uchinchi shaxslar**: Ma'lumotlar uchinchi shaxslarga berilmasligini tasdiqlashingiz kerak.

### Ruxsatnomalar (Permissions)
Google faqat ilovaning ishlashi uchun zarur bo'lgan ruxsatnomalarni qoldirishni talab qiladi.
*   `CAMERA`: Qurilish ob'ektlarini rasmga olish uchun.
*   `READ_EXTERNAL_STORAGE`: Galereyadan rasm tanlash uchun.

## 3. Yangi akkauntlar uchun 20 ta testerning talabi
Agar Google Play Developer akkauntingiz **2023-yil 13-noyabrdan keyin** ochilgan bo'lsa (shaxsiy akkaunt):
1.  Ilovani "Closed Testing" (Yopiq test) bo'limiga yuklashingiz kerak.
2.  Kamida **20 ta tester** ilovangizni o'rnatishi va **14 kun davomida** o'chirib tashlamasligi kerak.
3.  Faqat shundan keyingina "Production" (Omma uchun) nashr etishga ruxsat beriladi.

## 4. Akkauntni tasdiqlash (Verification)
Google hozirda barcha ishlab chiquvchilardan shaxsini tasdiqlashni talab qilmoqda:
*   $25 bir martalik to'lov.
*   Pasport yoki haydovchilik guvohnomasi orqali tasdiqlash.
*   Agar tashkilot nomidan bo'lsa, D-U-N-S raqami talab qilinishi mumkin.

## 5. App Content (Ilova tarkibi)
Play Console'ning "App content" bo'limida quyidagilarni to'ldiring:
*   **Target audience**: Ilova kimlar uchun (masalan, 18+ yosh).
*   **Ads**: Ilovada reklama bormi yoki yo'q (Hozirgi holatda 'No').
*   **Content Rating**: So'rovnomadan o'tib, yosh chegarasini oling.

---
## 6. UGC Safety (Bloklash va Shikoyat)
Google Play talabiga ko'ra, foydalanuvchilar bir-birini bloklash va shikoyat qilish imkoniyatiga ega bo'lishi kerak.
*   **Bloklash**: Profil va Chat sahifalarida "Bloklash" tugmasi qo'shildi. Bloklangan foydalanuvchi e'lonlari ko'rinmaydi va u xabar yozolmaydi.
*   **Shikoyat**: "Shikoyat qilish" tugmasi orqali nojo'ya kontent haqida xabar berish mumkin.

## 7. Google Reviewers uchun kirish (App Access)
Reviewerlar ilovani tekshirishi uchun OTP kodi kutmasdan kirishlari uchun maxsus "Reviewer Account" tayyorlandi:
*   **Telefon**: `+998990001111`
*   **Tasdiqlash kodi**: `123456` (Bu raqam uchun kod har doim bir xil).
*   Buni Play Console-da "App Access" bo'limida ko'rsatishingiz kerak.

**Maslahat**: Agar biror savol bo'lsa yoki Play Console-da qaysidir bo'limda qiynalsangiz, so'rang, yordam beraman!
