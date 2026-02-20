import React from 'react';
import { GlassCard } from '../components/UIComponents';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
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

                <h1 className="text-4xl font-heading font-black mb-8">Foydalanish shartlari</h1>

                <GlassCard className="p-8 border-primary/10 space-y-6 text-accent/80 leading-relaxed">
                    <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <ShieldAlert className="text-primary shrink-0" size={24} />
                        <p className="font-bold text-white">
                            Platforma faqat axborot almashish maydonidir. Shartnomaviy majburiyatlar va to'lovlar uchun javobgarlik bevosita tomonlar zimmasidadir.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">1. Umumiy qoidalar</h2>
                        <p>
                            HamkorQurilish platformasi qurilish xizmatlari va texnika ijarasi bo'yicha e'lonlar joylashtirish uchun mo'ljallangan.
                            Biz usta va mijoz o'rtasidagi kelishuvlarda qatnashmaymiz.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">2. Mas'uliyat</h2>
                        <p>
                            Foydalanuvchilar o'z profillarida ko'rsatilgan ma'lumotlarning to'g'riligi uchun shaxsan javobgardirlar.
                            Bajarilgan ish sifati va to'lov xavfsizligi yuzasidan barcha majburiyatlar bevosita ijrochi va buyurtmachi o'rtasida tartibga solinadi.
                        </p>
                    </section>
                </GlassCard>
            </div>
        </div>
    );
};

export default Terms;
