import axios from 'axios';

export default {
    name: "ترجمة",
    aliases: ["ترجم", "tr", "translate"],
    category: "tools",

    async run({ bot, message, args, reply }) {
        const jid = message.key.remoteJid;
        
        // خريطة الـ 100 لغة (الأكثر شمولاً)
        const languageMap = {
            'انجليزي': 'en', 'انجلش': 'en', 'إنجليزي': 'en', 'إنجليزية': 'en', 'انجيلزي': 'en',
            'الماني': 'de', 'ألماني': 'de', 'ألمانية': 'de', 'المانية': 'de',
            'فرنسي': 'fr', 'فرنساوي': 'fr', 'فرنسية': 'fr', 'فرنساوى': 'fr',
            'اسباني': 'es', 'أسباني': 'es', 'أسبانية': 'es', 'اسبانية': 'es',
            'تركي': 'tr', 'تركية': 'tr',
            'ايطالي': 'it', 'إيطالي': 'it', 'ايطالية': 'it',
            'روسي': 'ru', 'روسية': 'ru',
            'صيني': 'zh-CN', 'صينية': 'zh-CN',
            'ياباني': 'ja', 'يابانية': 'ja',
            'هندي': 'hi', 'هندية': 'hi',
            'كوري': 'ko', 'كورية': 'ko',
            'برتغالي': 'pt', 'برتغالية': 'pt',
            'هولندي': 'nl', 'هولندية': 'nl',
            'يوناني': 'el', 'يونانية': 'el',
            'عبري': 'he', 'عبرية': 'he',
            'فارسي': 'fa', 'فارسية': 'fa',
            'بولندي': 'pl', 'بولندية': 'pl',
            'فيتنامي': 'vi', 'فيتنامية': 'vi',
            'تايلاندي': 'th', 'تايلاندية': 'th',
            'اندونيسي': 'id', 'إندونيسي': 'id',
            'ماليزي': 'ms', 'ماليزية': 'ms',
            'سويدي': 'sv', 'سويدية': 'sv',
            'نرويجي': 'no', 'نرويجية': 'no',
            'دنماركي': 'da', 'دنماركية': 'da',
            'فنلندي': 'fi', 'فنلندية': 'fi',
            'روماني': 'ro', 'رومانية': 'ro',
            'مجري': 'hu', 'مجرية': 'hu',
            'اوكراني': 'uk', 'أوكراني': 'uk',
            'بنغالي': 'bn', 'بنغالية': 'bn',
            'بنجابي': 'pa', 'بنجابية': 'pa',
            'تاميلي': 'ta', 'تاميلية': 'ta',
            'اردو': 'ur', 'أردو': 'ur',
            'سواحيلي': 'sw', 'سواحيلية': 'sw',
            'تشيكي': 'cs', 'تشيكية': 'cs',
            'صربي': 'sr', 'صربية': 'sr',
            'بلغاري': 'bg', 'بلغارية': 'bg',
            'كرواتي': 'hr', 'كرواتية': 'hr',
            'سلوفاكي': 'sk', 'سلوفاكية': 'sk',
            'ليتواني': 'lt', 'ليتوانية': 'lt',
            'لاتفي': 'lv', 'لاتفية': 'lv',
            'استوني': 'et', 'إستونية': 'et',
            'سلوفيني': 'sl', 'سلوفينية': 'sl',
            'ايسلندي': 'is', 'أيسلندية': 'is',
            'الباني': 'sq', 'ألباني': 'sq',
            'ارمني': 'hy', 'أرميني': 'hy',
            'اذربيجاني': 'az', 'أذربيجاني': 'az',
            'جورجي': 'ka', 'جورجية': 'ka',
            'باسكي': 'eu', 'باسكية': 'eu',
            'بيلاروسي': 'be', 'بيلاروسية': 'be',
            'كاتالوني': 'ca', 'كاتالونية': 'ca',
            'إسبرانتو': 'eo', 'اسبرانتو': 'eo',
            'جاليكي': 'gl', 'جاليكية': 'gl',
            'غوجاراتي': 'gu', 'جوجراتي': 'gu',
            'هايتي': 'ht', 'هايتية': 'ht',
            'ايرلندي': 'ga', 'أيرلندي': 'ga',
            'كانادا': 'kn', 'كانادية': 'kn',
            'لاتيني': 'la', 'لاتينية': 'la',
            'مقدوني': 'mk', 'مقدونية': 'mk',
            'مالطي': 'mt', 'مالطية': 'mt',
            'ماوري': 'mi', 'ماورية': 'mi',
            'ويلزي': 'cy', 'ويلزية': 'cy',
            'يديشية': 'yi', 'يديشي': 'yi',
            'افريكاني': 'af', 'أفريكاني': 'af',
            'امهري': 'am', 'أمهري': 'am',
            'عربي': 'ar', 'عربية': 'ar',
            'كازاخي': 'kk', 'كازاخية': 'kk',
            'خميري': 'km', 'خميرية': 'km',
            'لاوي': 'lo', 'لاوية': 'lo',
            'مالايالامي': 'ml', 'مالايالامية': 'ml',
            'منغولي': 'mn', 'منغولية': 'mn',
            'ميانماري': 'my', 'ميانمارية': 'my',
            'نيبالي': 'ne', 'نيبالية': 'ne',
            'سنغالي': 'si', 'سنغالية': 'si',
            'صومالي': 'so', 'صومالية': 'so',
            'تاجيكي': 'tg', 'تاجيكية': 'tg',
            'اوزبكي': 'uz', 'أوزبكي': 'uz',
            'زولو': 'zu', 'زولوي': 'zu'
        };

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let textToTranslate = "";
        let targetLang = "ar";

        // تنظيف المدخلات للبحث عن اللغة
        let firstArg = args[0]?.replace(/[إأآا]/g, 'ا'); 
        let foundLang = Object.keys(languageMap).find(key => key.replace(/[إأآا]/g, 'ا') === firstArg);

        if (foundLang) {
            targetLang = languageMap[foundLang];
            args.shift();
        } else if (args[0] && args[0].length === 2) {
            targetLang = args[0].toLowerCase();
            if (targetLang === "eg") targetLang = "en";
            args.shift();
        }

        if (quoted) {
            textToTranslate = quoted.conversation || quoted.extendedTextMessage?.text || "";
        } else {
            textToTranslate = args.join(" ");
        }

        if (!textToTranslate) {
            return reply("*⚠️ رد على رسالة أو اكتب نصاً لترجمته، مـثـال:(.ترجم انجليزي)*");
        }

        try {
            await bot.sendMessage(jid, { react: { text: "⚡", key: message.key } });

            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
            const translatedText = res.data[0].map(item => item[0]).join("");

            await bot.sendMessage(jid, { 
                text: `*${translatedText}*` 
            }, { quoted: message });

        } catch (error) {
            reply("*❌ حدث خطأ، تأكد من اسم اللغة أو النص.*");
        }
    }
};