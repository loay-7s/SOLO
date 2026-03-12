import fs from 'fs-extra';

export default {
    name: "قارن",
    aliases: ["مقارنة", "من_الأقوى"],
    category: "fun",

    async run({ sock, m, reply, args, userJid }) {
        const chatId = m.key.remoteJid;
        
        // 1. استخراج المنشنات بدقة
        const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let p1, p2;

        if (mentions.length === 1) {
            p1 = userJid;
            p2 = mentions[0];
        } else if (mentions.length >= 2) {
            p1 = mentions[0];
            p2 = mentions[1];
        } else {
            // --- [ الجزء الأول: دليل الاستخدام ] ---
            const helpMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
    *⌬ دَلـيـل نِـظـام الـمُـقـارنـات ⌬*
*───━━━⊱  📖 📖  ⊰━━━───*

*❑ [ طُـرق الاسـتـخـدام ] 📑↯*
*──────────────────────*
*❶ مُـقـارنـة نـفـسـك مـع الـعـضـو:*
*☜ ( .قارن @منشن )*

*❷ مُـقـارنـة عـضـويـن بـبـعـضـهـم:*
*☜ ( .قارن @منشن @منشن )*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*⚠️ تـنـبـيـه: الـنـظـام يـعـتمد عـلى الـعـشوائية*
*والـقـدر الـمـحـتـوم فـي تـقـديـر الـنـتـائـج!*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();
            return reply(helpMsg);
        }

        if (p1 === p2) return reply("*｢ ⚠️ ｣ الـنـظـام: لا يـمـكـن لـلـعـضـو مـنـافـسـه نـفـسـه.!*");

        await sock.sendMessage(chatId, { react: { text: "⚔️", key: m.key } });

        const allMentions = [p1, p2];
        const stats = [
            { label: "الـقـوة الـبـدنـيـة", icon: "⚔️" },
            { label: "مـسـتـوى الـذكـاء", icon: "🧠" },
            { label: "نـسـبـة الـحـظ", icon: "🍀" },
            { label: "الـجـمـال والـكـاريـزمـا", icon: "💎" },
            { label: "الـسـرعـة والـخـفـة", icon: "⚡" },
            { label: "الـسـمـاجة والـبـرودة", icon: "🧊" },
            { label: "قـوة الـتـسـلـيـك", icon: "🎭" }
        ];

        let score1 = 0, score2 = 0;
        let details = "";

        // --- [ الجزء الثاني: تـحـلـيـل الـمـواجـهـة ] ---
        stats.forEach(stat => {
            const v1 = Math.floor(Math.random() * 100) + 1;
            const v2 = Math.floor(Math.random() * 100) + 1;
            details += `*${stat.icon} ${stat.label}*\n`;
            details += `┝ ⦓ @${p1.split('@')[0]} ⦔ ➔ ⦓ ${v1}% ⦔\n`;
            details += `┝ ⦓ @${p2.split('@')[0]} ⦔ ➔ ⦓ ${v2}% ⦔\n`;
            details += `┕───────────────────\n\n`;
            if (v1 > v2) score1++; else if (v2 > v1) score2++;
        });

        // --- [ الجزء الثالث: إعـلان الـنـتـيـجـة والتعليقات الساخرة ] ---
        
        // مصفوفات التعليقات
        const winComments = [
            "واضح إن الفرق في المستوى زي الفرق بين السماء والأرض! 🔥",
            "سحق تام! هل أنت متأكد أن هذا الخصم من رتبتك؟ 👑",
            "أداء أسطوري، لقد جعلت خصمك يبكي في الزاوية! 🏆",
            "الهيبة تتحدث.. لا عزاء للبقية! ✨"
        ];
        const loseComments = [
            "يا ساتر.. انصحك تروح تبيع خضار أحسن من المقارنة! 🤡",
            "هزيمة نكراء، روح نام وادعي إن النظام ينسى الفضيحة دي! 💤",
            "السماجة عندك غطت على القوة، مبروك الخسارة! 🧊",
            "تحتاج تدريب 100 سنة ضوئية عشان توصل للمستوى ده! 🐢"
        ];

        let winnerBanner = "";
        let roasting = "";

        if (score1 > score2) {
            winnerBanner = `*👑 الـمُـنـتـصـر : ⦓ @${p1.split('@')[0]} ⦔*`;
            roasting = `*💬 تـعـلـيـق الـنـظـام:* \n*⦓ @${p1.split('@')[0]} ⦔ : ${winComments[Math.floor(Math.random() * winComments.length)]}*\n\n*⦓ @${p2.split('@')[0]} ⦔ : ${loseComments[Math.floor(Math.random() * loseComments.length)]}*`;
        } else if (score2 > score1) {
            winnerBanner = `*👑 الـمُـنـتـصـر : ⦓ @${p2.split('@')[0]} ⦔*`;
            roasting = `*💬 تـعـلـيـق الـنـظـام:* \n*⦓ @${p2.split('@')[0]} ⦔ : ${winComments[Math.floor(Math.random() * winComments.length)]}*\n\n*⦓ @${p1.split('@')[0]} ⦔ : ${loseComments[Math.floor(Math.random() * loseComments.length)]}*`;
        } else {
            winnerBanner = `*🤝 الـنـتـيـجـة : تـعـادل الأبـاطـرة!*`;
            roasting = `*💬 تـعـلـيـق الـنـظـام: مـسـتـوى الـسـمـاجـة والـقـوة مـتـعـادل.. نـتـيـجـة مـريـبـة! 🤨*`;
        }

        const resultMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
    *⌬ نِـظـام الـمـقـارنـة الـمـلـكـي ⌬*
*───━━━⊱  ⚔️ 🛡️  ⊰━━━───*

*❑ [ تـحـلـيـل الـبـيـانـات الـشـامـل ] 📊↯*
*──────────────────────*
${details}

*❑ [ الـخُـلاصـة الـنـهـائـيـة ] 🏆↯*
*──────────────────────*
*🔴 الـطـرف الأول : ⦓ ${score1} نـقـاط ⦔*

*🔵 الـطـرف الـثـانـي : ⦓ ${score2} نـقـاط ⦔*

${winnerBanner}

*──────────────────────*
${roasting}

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

        await sock.sendMessage(chatId, { text: resultMsg, mentions: allMentions }, { quoted: m });
    }
};
