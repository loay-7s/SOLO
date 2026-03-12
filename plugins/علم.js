import fs from "fs";

const flagsData = [
    { flag: "🇸🇦", name: "السعودية", difficulty: "سهل" },
    { flag: "🇪🇬", name: "مصر", difficulty: "سهل" },
    { flag: "🇮🇶", name: "العراق", difficulty: "سهل" },
    { flag: "🇩🇿", name: "الجزائر", difficulty: "متوسط" },
    { flag: "🇲🇦", name: "المغرب", difficulty: "سهل" },
    { flag: "🇸🇾", name: "سوريا", difficulty: "سهل" },
    { flag: "🇹🇳", name: "تونس", difficulty: "متوسط" },
    { flag: "🇯🇴", name: "الاردن", difficulty: "متوسط" },
    { flag: "🇦🇪", name: "الامارات", difficulty: "سهل" },
    { flag: "🇱🇧", name: "لبنان", difficulty: "متوسط" },
    { flag: "🇾🇪", name: "اليمن", difficulty: "سهل" },
    { flag: "🇴🇲", name: "عمان", difficulty: "متوسط" },
    { flag: "🇶🇦", name: "قطر", difficulty: "متوسط" },
    { flag: "🇧🇭", name: "البحرين", difficulty: "سهل" },
    { flag: "🇰🇼", name: "الكويت", difficulty: "سهل" },
    { flag: "🇵🇸", name: "فلسطين", difficulty: "سهل" },
    { flag: "🇱🇾", name: "ليبيا", difficulty: "متوسط" },
    { flag: "🇸🇩", name: "السودان", difficulty: "متوسط" },
    { flag: "🇲🇷", name: "موريتانيا", difficulty: "صعب" },
    { flag: "🇸🇴", name: "الصومال", difficulty: "متوسط" },
    { flag: "🇩🇯", name: "جيبوتي", difficulty: "صعب" },
    { flag: "🇰🇲", name: "جزر القمر", difficulty: "صعب" },
    { flag: "🇫🇷", name: "فرنسا", difficulty: "سهل" },
    { flag: "🇩🇪", name: "المانيا", difficulty: "سهل" },
    { flag: "🇮🇹", name: "ايطاليا", difficulty: "سهل" },
    { flag: "🇪🇸", name: "اسبانيا", difficulty: "سهل" },
    { flag: "🇬🇧", name: "بريطانيا", difficulty: "سهل" },
    { flag: "🇷🇺", name: "روسيا", difficulty: "سهل" },
    { flag: "🇵🇹", name: "البرتغال", difficulty: "متوسط" },
    { flag: "🇳🇱", name: "هولندا", difficulty: "متوسط" },
    { flag: "🇧🇪", name: "بلجيكا", difficulty: "متوسط" },
    { flag: "🇨🇭", name: "سويسرا", difficulty: "متوسط" },
    { flag: "🇸🇪", name: "السويد", difficulty: "متوسط" },
    { flag: "🇳🇴", name: "النرويج", difficulty: "متوسط" },
    { flag: "🇬🇷", name: "اليونان", difficulty: "متوسط" },
    { flag: "🇦🇹", name: "النمسا", difficulty: "متوسط" },
    { flag: "🇺🇦", name: "اوكرانيا", difficulty: "متوسط" },
    { flag: "🇵🇱", name: "بولندا", difficulty: "متوسط" },
    { flag: "🇩🇰", name: "الدنمارك", difficulty: "متوسط" },
    { flag: "🇨🇿", name: "التشيك", difficulty: "صعب" },
    { flag: "🇷🇴", name: "رومانيا", difficulty: "صعب" },
    { flag: "🇭🇷", name: "كرواتيا", difficulty: "متوسط" },
    { flag: "🇯🇵", name: "اليابان", difficulty: "سهل" },
    { flag: "🇨🇳", name: "الصين", difficulty: "سهل" },
    { flag: "🇰🇷", name: "كوريا الجنوبية", difficulty: "سهل" },
    { flag: "🇮🇳", name: "الهند", difficulty: "سهل" },
    { flag: "🇮🇩", name: "اندونيسيا", difficulty: "متوسط" },
    { flag: "🇵🇰", name: "باكستان", difficulty: "متوسط" },
    { flag: "🇮🇷", name: "ايران", difficulty: "متوسط" },
    { flag: "🇹🇷", name: "تركيا", difficulty: "سهل" },
    { flag: "🇻🇳", name: "فيتنام", difficulty: "صعب" },
    { flag: "🇹🇭", name: "تايلاند", difficulty: "متوسط" },
    { flag: "🇲🇾", name: "ماليزيا", difficulty: "متوسط" },
    { flag: "🇵🇭", name: "الفلبين", difficulty: "متوسط" },
    { flag: "🇧🇩", name: "بنجلاديش", difficulty: "صعب" },
    { flag: "🇰🇿", name: "كازاخستان", difficulty: "صعب" },
    { flag: "🇸🇬", name: "سنغافورة", difficulty: "صعب" },
    { flag: "🇺🇸", name: "الولايات المتحدة الامريكية", difficulty: "سهل" },
    { flag: "🇨🇦", name: "كندا", difficulty: "سهل" },
    { flag: "🇲🇽", name: "المكسيك", difficulty: "سهل" },
    { flag: "🇨🇺", name: "كوبا", difficulty: "متوسط" },
    { flag: "🇯🇲", name: "جامايكا", difficulty: "متوسط" },
    { flag: "🇵🇦", name: "بنما", difficulty: "صعب" },
    { flag: "🇨🇷", name: "كوستاريكا", difficulty: "صعب" },
    { flag: "🇬🇹", name: "جواتيمالا", difficulty: "صعب" },
    { flag: "🇭🇹", name: "هايتي", difficulty: "صعب جدا" },
    { flag: "🇩🇴", name: "جمهورية الدومينيكان", difficulty: "صعب جدا" },
    { flag: "🇧🇷", name: "البرازيل", difficulty: "سهل" },
    { flag: "🇦🇷", name: "الارجنتين", difficulty: "سهل" },
    { flag: "🇨🇱", name: "تشيلي", difficulty: "متوسط" },
    { flag: "🇨🇴", name: "كولومبيا", difficulty: "متوسط" }
];

export default {
    name: "علم",
    aliases: ["اعلام", "flag"],
    description: "فعالية الأعلام الإمبراطورية",
    async run({ sock, m }) {
        const chatId = m.key.remoteJid;

        // منع تكرار الفعالية
        if (global.flag && global.flag[chatId]) {
            return sock.sendMessage(chatId, { text: "⚠️ *هناك علم قائم بالفعل! أجب عليه أولاً.*" }, { quoted: m });
        }

        try {
            const item = flagsData[Math.floor(Math.random() * flagsData.length)];

            await sock.sendMessage(chatId, { react: { text: "🚩", key: m.key } });

            const questionMsg = `
*★┇‏فـعـالية أعـ🏴ـلام الـ🌎ـدول┇‏★*
*⎔┄┄── ⊱╎⌯🏮⌯╎⊰ ──┄┄⎔*

*⌠📜⌡ ا̍ڶـــــڜــــڔحۡ ↯*
*❑ المقدم سيضع علم و عليك قول اسم الدولة.*
 

*⎈┆العـ🏴ـلم :〖 ${item.flag} 〗*


*⎈┆المقـ5k⤹ـدم 💎:〖SOLO〗*

*⎈┆الـصـنـف :〖 ${item.difficulty} 〗*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*

*⏱┇ الوقت: 30 ثانية*

*⎔┄┄── ⊱╎⌯🏮⌯╎⊰ ──┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            const sentMsg = await sock.sendMessage(chatId, { text: questionMsg }, { quoted: m });

            global.flag = global.flag || {};
            global.flag[chatId] = {
                answer: item.name,
                active: true,
                winner: null,
                timer: setTimeout(async () => {
                    if (global.flag[chatId]) {
                        await sock.sendMessage(chatId, { 
                            text: `*⏱┇ انتهى الوقت!*\n*✅┇ الإجابة الصحيحة هي: ⦓ ${item.name} ⦔*` 
                        });
                        delete global.flag[chatId];
                    }
                }, 30000)
            };

        } catch (err) {
            console.error(err);
        }
    }
};