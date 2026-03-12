import axios from 'axios';

export default {
    name: "تقويم",
    aliases: ["عمرة", "صلاة", "مواقيت"],
    category: "خدمات",

    async run({ sock, m, args }) {
        const chatId = m.key.remoteJid;
        
        if (!args.length) {
            await sock.sendMessage(chatId, { 
                text: `*⎔┄┄─ ⊱╎⌯ 🕌 ⌯╎⊰─┄┄⎔*\n\n*┋ أسـتـخـدام أمـر الـتـقـويـم ┋*\n\n*⎔┄┄─── ⊱╎⌯ 📍 ⌯╎⊰ ───┄┄⎔*\n\n*┋ .تـقـويـم [اسـم الـمـديـنـة]*\n\n*┋ أمـثـلـة:*\n.تـقـويـم الـقـاهـرة\n.تـقـويـم نـيـويـورك\n.تـقـويـم لـنـدن\n.تـقـويـم سـوهـاج\n\n*⎔┄┄─ ⊱╎⌯ 🕌 ⌯╎⊰─┄┄⎔*` 
            });
            return;
        }

        let city = args.join(' ').trim();
        
        await sock.sendMessage(chatId, { react: { text: "🕌", key: m.key } });

        try {
            await sock.sendMessage(chatId, { 
                text: `*⎔┄┄─ ⊱╎⌯ 🔍 ⌯╎⊰─┄┄⎔*\n\n*┋ جـاري جـلـب مـواقـيـت الـصـلاة لـ:*\n*┋ ⦓ ${city} ⦔*\n\n*⎔┄┄─ ⊱╎⌯ 🔍 ⌯╎⊰─┄┄⎔*` 
            });

            // دالة تحويل الوقت من 24 ساعة إلى 12 ساعة مع ص/م
            function convertTo12Hour(time) {
                const [hour, minute] = time.split(':').map(Number);
                const period = hour >= 12 ? 'م' : 'ص';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
            }

            // استخدام API Aladhan مع طريقة حساب الهيئة المصرية (method=5)
            // method=5 هي طريقة الهيئة العامة المصرية للمساحة (نفس timesprayer)
            const response = await axios.get(`http://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=&method=5`);
            
            const data = response.data.data;
            const timings = data.timings;
            
            // تحويل جميع الأوقات
            const fajrTime = convertTo12Hour(timings.Fajr);
            const sunriseTime = convertTo12Hour(timings.Sunrise);
            const dhuhrTime = convertTo12Hour(timings.Dhuhr);
            const asrTime = convertTo12Hour(timings.Asr);
            const maghribTime = convertTo12Hour(timings.Maghrib);
            const ishaTime = convertTo12Hour(timings.Isha);

            const date = data.date.readable;
            const hijri = data.date.hijri;
            const weekday = data.date.hijri.weekday.ar || data.date.gregorian.weekday.en;

            const prayerText = 
                `*⎔┄┄─ ⊱╎⌯ 🕋 ⌯╎⊰─┄┄⎔*\n\n` +
                `*┋ مـواقـيـت الـصـلاة ┋*\n` +
                `*┋ (طريقة الهيئة المصرية)*\n\n` +
                `*⎔┄┄─── ⊱╎⌯ 📍 ⌯╎⊰ ───┄┄⎔*\n\n` +
                `*┋ الـمـديـنـة : ⦓ ${city} ⦔*\n\n` +
                `*⎔┄┄─── ⊱╎⌯ 📅 ⌯╎⊰ ───┄┄⎔*\n\n` +
                `*┋ الـتـاريـخ : ⦓ ${date} ⦔*\n` +
                `*┋ الـهـجـري : ⦓ ${hijri.date} ⦔*\n` +
                `*┋ الـيـوم : ⦓ ${weekday} ⦔*\n\n` +
                `*⎔┄┄─── ⊱╎⌯ 🕋 ⌯╎⊰ ───┄┄⎔*\n\n` +
                `*┋ الـفـجـر : ⦓ ${fajrTime} ⦔*\n` +
                `*┋ الـشـروق : ⦓ ${sunriseTime} ⦔*\n` +
                `*┋ الـظـهـر : ⦓ ${dhuhrTime} ⦔*\n` +
                `*┋ الـعـصـر : ⦓ ${asrTime} ⦔*\n` +
                `*┋ الـمـغـرب : ⦓ ${maghribTime} ⦔*\n` +
                `*┋ الـعـشـاء : ⦓ ${ishaTime} ⦔*\n\n` +
                `*⎔┄┄─── ⊱╎⌯ ✨ ⌯╎⊰ ───┄┄⎔*\n\n` +
                `*┋ 𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 ┋*\n` +
                `*⎔┄┄─ ⊱╎⌯ 🕋 ⌯╎⊰─┄┄⎔*`;

            await sock.sendMessage(chatId, { text: prayerText });
            await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.log(error);
            
            const errorText = 
                `*⎔┄┄─ ⊱╎⌯ ❌ ⌯╎⊰─┄┄⎔*\n\n` +
                `*┋ حـدث خـطـأ فـي جـلـب مـواقـيـت الـصـلاة*\n\n` +
                `*⎔┄┄─── ⊱╎⌯ 💡 ⌯╎⊰ ───┄┄⎔*\n\n` +
                `*┋ تـأكـد مـن كـتـابـة اسـم الـمـديـنـة صـحـيـحـا*\n` +
                `*┋ مـثـال: .تـقـويـم الـقـاهـرة*\n` +
                `*┋ .تـقـويـم لـنـدن*\n` +
                `*┋ .تـقـويـم سـوهـاج*\n` +
                `*┋ .تـقـويـم طـوكـيـو*\n` +
                `*┋ .تـقـويـم نـيـويـورك*\n\n` +
                `*⎔┄┄─ ⊱╎⌯ ❌ ⌯╎⊰─┄┄⎔*`;

            await sock.sendMessage(chatId, { text: errorText });
        }
    }
};