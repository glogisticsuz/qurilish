import React from 'react';
import { GlassCard } from '../components/UIComponents';
import { ShieldCheck, ArrowLeft, Camera, ShieldAlert, Users, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-3xl mx-auto py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-accent/40 hover:text-primary mb-8 transition-colors uppercase tracking-widest text-xs"
                >
                    <ArrowLeft size={16} /> Ortga qaytish
                </button>

                <h1 className="text-4xl font-heading font-black mb-8">Maxfiylik Siyosati</h1>
                <p className="text-accent/60 mb-8">Oxirgi yangilangan sana: 1-mart, 2026-yil</p>

                <GlassCard className="p-8 border-primary/10 space-y-10 text-accent/80 leading-relaxed">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white mb-2">
                            <ShieldCheck className="text-primary" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-wider">Umumiy ma'lumot</h2>
                        </div>
                        <p>
                            "HamkorQurilish" jamoasi sizning maxfiyligingizni hurmat qiladi va himoya qiladi. Ushbu Maxfiylik siyosati bizning mobil ilovamiz va veb-saytimiz orqali qanday ma'lumotlar to'planishi va foydalanilishi haqida ma'lumot beradi.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white mb-2">
                            <Camera className="text-primary" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-wider">1. Kamera va Galereya</h2>
                        </div>
                        <p>
                            Ilovadan foydalanish jarayonida biz quyidagi hollarda ruxsat so'rashimiz mumkin:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Kamera:</strong> Profil rasmini yuklash, qurilish ob'ektlari rasmlarini olish yoki xabarlarda rasm yuborish uchun foydalaniladi. Kamera faqat foydalanuvchi buyrug'i bilan ishlaydi.</li>
                            <li><strong>Galereya:</strong> Qurilmangiz xotirasidagi rasmlarni tanlash uchun foydalaniladi.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white mb-2">
                            <ShieldAlert className="text-primary" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-wider">2. Ma'lumotlar xavfsizligi</h2>
                        </div>
                        <p>
                            Sizning shaxsiy ma'lumotlaringiz xavfsiz serverlarda saqlanadi. Biz ma'lumotlaringizni himoya qilish uchun zamonaviy shifrlash usullaridan foydalanamiz.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white mb-2">
                            <Users className="text-primary" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-wider">3. UGC Safety (Foydalanuvchi xavfsizligi)</h2>
                        </div>
                        <p>
                            Ilovada foydalanuvchilar bir-birini bloklash va nojo'ya kontent ustidan shikoyat qilish imkoniyatiga ega. Biz har qanday nojo'ya kontentni 24 soat ichida ko'rib chiqamiz.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white mb-2">
                            <Phone className="text-primary" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-wider">4. Bog'lanish</h2>
                        </div>
                        <p>
                            Agar savollaringiz bo'lsa, ilova ichidagi qo'llab-quvvatlash botimiz orqali murojaat qilishingiz mumkin.
                        </p>
                    </section>

                    <div className="footer pt-8 border-t border-primary/10 text-center text-sm opacity-50">
                        <strong>HamkorQurilish</strong> — Qurilishda ishonchli hamkoringiz.
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
