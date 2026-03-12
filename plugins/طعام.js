export default {
    name: "نبات",
    aliases: ["فواكه", "خضار", "طعام", "plant"],
    description: "لعبة تخمين الفواكه والخضار والطعام",
    category: "games",
    group: true,

    async run({ bot, message, args, isGroup, reply, react }) {
        const chatId = message.key.remoteJid;

        if (!isGroup) {
            return reply("*❌ هـذه الـلـعـبـة تـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        // 1. منع السبام: التحقق إذا كانت هناك فعالية قائمة بالفعل
        global.plantGame = global.plantGame || {};
        
        // لو في فعالية قديمة منتهية الصلاحية، امسحها
        if (global.plantGame[chatId] && global.plantGame[chatId].expiry < Date.now()) {
            delete global.plantGame[chatId];
        }
        
        if (global.plantGame[chatId]) {
            return reply("*⚠️ يـوجـد فـعـالـيـة لـم يـتـم حـلـهـا ، أجـب عـلـيـهـا اولاً.*");
        }

        // 2. عمل ريأكت بـ 🌱
        await react("🌱");

        // 🌍 جميع الفواكه والخضار والطعام المدعومة في واتساب
        const plants = [
            // 🍎 فواكه (19)
            { name: "تفاح", emoji: "🍎" },
            { name: "موز", emoji: "🍌" },
            { name: "برتقال", emoji: "🍊" },
            { name: "ليمون", emoji: "🍋" },
            { name: "عنب", emoji: "🍇" },
            { name: "فراولة", emoji: "🍓" },
            { name: "كرز", emoji: "🍒" },
            { name: "اناناس", emoji: "🍍" },
            { name: "مانجو", emoji: "🥭" },
            { name: "كيوي", emoji: "🥝" },
            { name: "بطيخ", emoji: "🍉" },
            { name: "شمام", emoji: "🍈" },
            { name: "خوخ", emoji: "🍑" },
            { name: "اجاص", emoji: "🍐" },
            { name: "افوكادو", emoji: "🥑" },
            { name: "جوز الهند", emoji: "🥥" },
            { name: "توت", emoji: "🫐" },
            { name: "زيتون", emoji: "🫒" },
            { name: "كستناء", emoji: "🌰" },

            // 🥦 خضار (18)
            { name: "جزر", emoji: "🥕" },
            { name: "خيار", emoji: "🥒" },
            { name: "طماطم", emoji: "🍅" },
            { name: "فلفل", emoji: "🌶️" },
            { name: "فلفل رومي", emoji: "🫑" },
            { name: "بصل", emoji: "🧅" },
            { name: "ثوم", emoji: "🧄" },
            { name: "بطاطس", emoji: "🥔" },
            { name: "ذرة", emoji: "🌽" },
            { name: "بازلاء", emoji: "🫛" },
            { name: "فاصوليا", emoji: "🫘" },
            { name: "باذنجان", emoji: "🍆" },
            { name: "قرع", emoji: "🎃" },
            { name: "بروكلي", emoji: "🥦" },
            { name: "خس", emoji: "🥬" },
            { name: "بقدونس", emoji: "🌿" },
            { name: "فطر", emoji: "🍄" },
            { name: "زنجبيل", emoji: "🫚" },

            // 🍞 مخبوزات (7)
            { name: "خبز", emoji: "🍞" },
            { name: "كرواسون", emoji: "🥐" },
            { name: "بسكويت", emoji: "🍪" },
            { name: "كعك", emoji: "🍰" },
            { name: "دونات", emoji: "🍩" },
            { name: "بيتزا", emoji: "🍕" },
            { name: "برجر", emoji: "🍔" },

            // 🍜 وجبات سريعة (8)
            { name: "هوت دوج", emoji: "🌭" },
            { name: "شاورما", emoji: "🥙" },
            { name: "تاكو", emoji: "🌮" },
            { name: "بوريتو", emoji: "🌯" },
            { name: "سوشي", emoji: "🍣" },
            { name: "معكرونة", emoji: "🍝" },
            { name: "بطاطس مقلية", emoji: "🍟" },
            { name: "دجاج", emoji: "🍗" },

            // 🍦 حلويات (9)
            { name: "ايس كريم", emoji: "🍦" },
            { name: "مصاصة", emoji: "🍭" },
            { name: "حلوى", emoji: "🍬" },
            { name: "كيك", emoji: "🎂" },
            { name: "فطيرة", emoji: "🥧" },
            { name: "شربات", emoji: "🍧" },
            { name: "مثلجات", emoji: "🍨" },
            { name: "بودنغ", emoji: "🍮" },

            // 🥚 ألبان وبيض (5)
            { name: "بيض", emoji: "🥚" },
            { name: "جبن", emoji: "🧀" },
            { name: "لبن", emoji: "🥛" },
            { name: "زبادي", emoji: "🍦" },
            { name: "زبدة", emoji: "🧈" },

            // 🥩 لحوم (5)
            { name: "لحم", emoji: "🥩" },
            { name: "سمك", emoji: "🐟" },
            { name: "جمبري", emoji: "🍤" },
            { name: "كباب", emoji: "🥓" },
            { name: "سجق", emoji: "🌭" },

            // 🍯 أطعمة متنوعة (7)
            { name: "عسل", emoji: "🍯" },
            { name: "مربى", emoji: "🍯" },
            { name: "شوربة", emoji: "🍲" },
            { name: "سلطة", emoji: "🥗" },
            { name: "فشار", emoji: "🍿" },
            { name: "فول سوداني", emoji: "🥜" },

            // 🥤 مشروبات (8)
            { name: "قهوة", emoji: "☕" },
            { name: "شاي", emoji: "🍵" },
            { name: "عصير", emoji: "🧃" },
            { name: "كولا", emoji: "🥤" },
            { name: "ماء", emoji: "💧" },
            { name: "حليب", emoji: "🥛" },
            { name: "شوكولاتة", emoji: "🍫" }
        ];

        // اختيار نبات عشوائي
        const randomPlant = plants[Math.floor(Math.random() * plants.length)];

        // 3. تصميم الفعالية
        const design = `
*★┇‏فـعـالـيـة نـبـات┇‏★*
*⎔┄┄── ⊱╎⌯🏮⌯╎⊰ ──┄┄⎔*

*⌠📜⌡ الـشـرح ↯*
*❑ أسرع واحد يكتب اسم النبات/الطعام يفوز 🍃*

*⎈┆الـطـعـام 🌱:*
     
                      *〖 ${randomPlant.emoji} 〗*

*⎈┆الـمـقـدم 💎 :〖 SOLO 〗*

*⎔┄┄── ⊱╎⌯🏮⌯╎⊰ ──┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

        await bot.sendMessage(chatId, { text: design }, { quoted: message });

        // 4. تخزين الفعالية في الذاكرة
        global.plantGame = global.plantGame || {};
        global.plantGame[chatId] = {
            answer: randomPlant.name,
            emoji: randomPlant.emoji,
            active: true,
            winner: null,
            expiry: Date.now() + 60000, // 60 ثانية
            timer: setTimeout(() => {
                if (global.plantGame[chatId]) {
                    // إرسال رسالة انتهاء الوقت
                    bot.sendMessage(chatId, { 
                        text: `*╭─━━━━━━━━━━━━━━━─╮*
       *◈ ⌛ انـتـهـاء الـوقـت ◈*
*╰─━━━━━━━━━━━━━━━─╯*

*✅┇ الإجـابة الصحيحة : ⦓ ${global.plantGame[chatId].answer} ⦔*

*⛓️‍💥┇ لـم يـفـز أحـد هـذه الـمـرة*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`
                    });
                    delete global.plantGame[chatId];
                }
            }, 60000)
        };
    }
};