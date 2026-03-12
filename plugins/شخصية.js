export default {
    name: "شخصية",
    aliases: ["حلل"],
    category: "fun",
    group: true,

    async run({ sock, m }) {
        const chatId = m.key.remoteJid;

        try {
            // 1. تحديد الضحية (الهدف)
            let target = m.mentionedJid?.[0] || m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            if (!target) {
                target = m.sender || m.key.participant || chatId;
            }

            // 2. تفاعل الريأكت
            await sock.sendMessage(chatId, { react: { text: "🧬", key: m.key } });

            // 3. بنك الالقاب الضخم (بدون همزات)
            const titles = [
                "الزاحف المحترف", "فخر الجروب", "ملك الدراما", "الهادئ المستفز", "المسالم الغلاب", 
                "الشرير الكيوت", "عم الناس", "المنسحب تكتيكيا", "المفلس دائما", "وزير الضحك", 
                "الغامض المريب", "سيد الاندومي", "قائد المزهرية", "المنحوس بالفطرة", "ابو لسان طويل", 
                "الطيوب بزيادة", "المثقف المزيف", "رئيس عصابة الريكوردات", "اسطورة النوم", "الجلاد",
                "عاشق الاكل", "ملك السيناريوهات", "ابو قلب ابيض", "المكتئب السعيد", "الخجول المنحرف",
                "صاحب اطول سين", "عدو المنشنات", "موزع الاستيكرات", "الداعم الصامت", "المحقق كونان",
                "كائن النوتيلا", "مختفي دايما", "راعي المشاكل", "قاصف الجبهات", "حكيم الجروب",
                "الباحث عن الشهرة", "الكيوت المزيف", "برنس الجيل", "ضحكة الجروب", "المنسي",
                "ملك الهبد", "الاسطورة الحية", "صائد المنشنات", "مختل عقليا (بهزار)", "بطل العالم في القلق"
            ];

            const advices = [
                "محتاج تغير نوع الشامبو بتاعك", "اعتزل الجروب ده عشان كرامتك", "بطل تفكر في الشخص ده خلاص", 
                "نام بدري وهتبقى زي الفل", "روح كل وشغل فيلم احسن لك", "متحاولش تشغل دماغك عشان هي صيدلية", 
                "محتاج غسيل ومكوة من جوه", "انت محتاج تطلع رحلة لزحل", "بطل زحف الجو شتا", 
                "محتاج شاحن لقلبك", "انت صح وكل الناس دي غلط", "خليك زي ما انت انت قمر", 
                "الزم حدودك مع التلاجة شوية", "بطل تراقب الستوري بتاعته", "افتح محفظتك وشوف الفراغ",
                "روح اتعلم طبخ احسن لك", "السكوت صدقة في حالتك دي", "امسح الواتساب ونام",
                "محتاج خروجة في مكان فيه هوا", "بطل تسمع اغاني حزينة", "اضحك الدنيا مش مستاهلة",
                "حاول تبعد عن الناس السلبية", "اشتري لنفسك هدية النهاردة"
            ];

            // 4. الحسابات العشوائية
            const intelligence = Math.floor(Math.random() * 101);
            const kindness = Math.floor(Math.random() * 101);
            const crawling = Math.floor(Math.random() * 101); 
            const madness = Math.floor(Math.random() * 101); 
            const romance = Math.floor(Math.random() * 101); 
            const beauty = Math.floor(Math.random() * 101);  
            const malice = Math.floor(Math.random() * 101); 

            const randomTitle = titles[Math.floor(Math.random() * titles.length)];
            const randomAdvice = advices[Math.floor(Math.random() * advices.length)];

            // 5. تجهيز المنشن
            const targetId = target.split('@')[0];

            // 6. الاستمارة
            const analysis = `
*╭─━━━━━━━━━━━━━━━─╮*
       *🔍 تـحـلـيـل الـشـخـصـيـة 🔍*
*╰─━━━━━━━━━━━━━━━─╯*

*👤 الـشـخـصـيـة:* @${targetId}

*🎭 الـلـقـب:* *{ ${randomTitle} }*


*📊 الـنـسـب الـمـئـويـة:*

*🧠 الذكاء:* ${intelligence}%
*😇 الطيبة:* ${kindness}%
*🌷 الرومانسية:* ${romance}%
*💎 الجمال:* ${beauty}%
*🥸 الخباثة:* ${malice}%
*🐍 الزحف:* ${crawling}%
*🥴 الجنون:* ${madness}%


*💡 نصيحة عمك سونغ:*

> *${randomAdvice}*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            await sock.sendMessage(chatId, { 
                text: analysis, 
                mentions: [target] 
            }, { quoted: m });

        } catch (e) {
            console.error("Error in Personality Command:", e);
        }
    }
};