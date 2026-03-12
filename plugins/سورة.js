import axios from 'axios';
import fs from 'fs';
import path from 'path';

// متغير خارج الدالة ليعمل كقفل عام للبوت
let isProcessing = false;

export default {
    name: "سورة",
    aliases: ["قران", "قرآن"],
    category: "إسلاميات",

    async run({ bot, message, args }) {
        const chatId = message.key.remoteJid;
        const query = args.join(" ").trim();

        if (!query) {
            return bot.sendMessage(chatId, { text: `*﴿ اكـتـب اسـم الـسـوࢪة (.سورة الفاتحة) ﴾*` });
        }

        // نظام الكول داون (منع السبام)
        if (isProcessing) {
            return bot.sendMessage(chatId, { 
                text: `*⚠️ الـبـوت يـقـوم بـ تـحـمـيـل سـوࢪة أخـࢪى حـالـيـاً. إنـتـظـر حـتـى يـنـتـهـي.*` 
            }, { quoted: message });
        }

        const surahs = ["الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"];

        try {
            let surahNumber;
            const cleanQuery = query.replace(/^ال/g, '').replace(/[أإآ]/g, 'ا').replace(/ة$/g, 'ه');

            surahNumber = surahs.findIndex(s => {
                const cleanName = s.replace(/^ال/g, '').replace(/[أإآ]/g, 'ا').replace(/ة$/g, 'ه');
                return cleanName === cleanQuery;
            }) + 1;

            if (surahNumber === 0) {
                surahNumber = surahs.findIndex(s => {
                    const cleanName = s.replace(/^ال/g, '').replace(/[أإآ]/g, 'ا').replace(/ة$/g, 'ه');
                    return cleanName.includes(cleanQuery);
                }) + 1;
            }

            if (surahNumber <= 0 || surahNumber > 114) throw new Error("NOT_FOUND");

            // منع سورة البقرة بسبب حجمها
            if (surahNumber === 2) {
                return bot.sendMessage(chatId, { 
                    text: `*⚠️ سـوࢪة الـبـقـࢪة عـمـلاقـة جـداً ويـسـتـحـيـل إࢪسـالـهـا عـبـࢪ الـواتـسـاب بـسـبـب حـجـمـهـا.*` 
                }, { quoted: message });
            }

            // تفعيل القفل فور التأكد من اسم السورة
            isProcessing = true;
            await bot.sendMessage(chatId, { react: { text: "📖", key: message.key } });

            const res = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
            const data = res.data.data;
            const surahName = data.name.replace('سُورَةُ ', '');
            
            let firstAyah = data.ayahs[0].text;
            if (surahNumber !== 1 && surahNumber !== 9) {
                firstAyah = firstAyah.replace(/^(بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ)/, '').trim();
                if (firstAyah === "") firstAyah = data.ayahs[1].text;
            }

            const formattedNumber = surahNumber.toString().padStart(3, '0');
            const audioUrl = `https://download.quranicaudio.com/quran/yasser_ad-dussary/${formattedNumber}.mp3`;
            const filePath = path.join(process.cwd(), `surah_${chatId}.mp3`);

            let description = `          *♕ سُـورَةُ ${surahName} ♕*\n\n`;
            description += `*⎯⎯⎯⎯⎯⎯  📖⎯⎯⎯⎯⎯⎯*\n\n`;
            description += `*❀ الترتيب في المصحف : رقم ${data.number}*\n`;
            description += `*✿ الآيات : ${data.numberOfAyahs} آية*\n`;
            description += `*✪ النزول : ${data.revelationType === 'Meccan' ? 'مكية 🕋' : 'مدنية 🕌'}*\n\n`;
            description += `*⎯⎯⎯⎯⎯⎯  📖⎯⎯⎯⎯⎯⎯*\n`;
            description += `*✪ تبدأ بـ*\n`;
            description += `*﴿ ${firstAyah} ﴾*\n\n`;
            description += `*⎯⎯⎯⎯⎯⎯  📖⎯⎯⎯⎯⎯⎯*\n\n`;
            description += `*🎧 بـ صـوت الـقـاࢪئ : \`ياسر الدوسري\`*\n\n`;
            description += `*⎯⎯⎯⎯⎯⎯  💎⎯⎯⎯⎯⎯⎯*`;

            await bot.sendMessage(chatId, { text: description }, { quoted: message });

            const response = await axios({ method: 'GET', url: audioUrl, responseType: 'stream' });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => { writer.close(); resolve(); });
                writer.on('error', reject);
            });

            const audioBuffer = fs.readFileSync(filePath);
            await bot.sendMessage(chatId, { 
                audio: audioBuffer, 
                mimetype: 'audio/mpeg', 
                ptt: false 
            }, { quoted: message });

            await bot.sendMessage(chatId, { react: { text: "✅", key: message.key } });

            // فك القفل بعد الإرسال الناجح
            isProcessing = false;

            setTimeout(() => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, 20000);

        } catch (error) {
            console.error(error);
            // فك القفل في حالة حدوث خطأ حتى لا يتوقف الأمر للأبد
            isProcessing = false;
            bot.sendMessage(chatId, { text: "*❌ تـأكـد مـن اسـم الـسـوࢪة.*" });
        }
    }
};