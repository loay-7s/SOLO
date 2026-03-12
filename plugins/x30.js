import fs from 'fs-extra';

export default {
    name: "هدية",
    aliases: ["منحة"],
    category: "mythology",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            let userSoul = soulsDB[cleanId];

            if (!userSoul) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *يـجـب أن تـمـلـك روحـاً أولـاً لـتـسـتـلـم الـهـديـة! اسـتـخـدم أمـر .روحي*" }, { quoted: m });
            }

            // 1. نظام الـكول داون (6 ساعات)
            const now = Date.now();
            const cooldownTime = 6 * 60 * 60 * 1000; 

            if (userSoul.lastGift && (now - userSoul.lastGift < cooldownTime)) {
                const timeLeft = Math.ceil((cooldownTime - (now - userSoul.lastGift)) / (60 * 60 * 1000));
                await sock.sendMessage(chatId, { react: { text: "⏳", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ⏳ ｣ لـقـد اسـتـلـمـت هـديـتـك مـؤخـراً..*\n\n*⚠️ عـد بـعـد ⦓ ${timeLeft} ⦔ سـاعـات لـتـفـقـد هـديـة الـنـظـام مـرة أخـرى.*` 
                }, { quoted: m });
            }

            // 2. نظام الاحتمالات
            const getPointsByLuck = () => {
                const rand = Math.random() * 100;
                if (rand < 40) return Math.floor(Math.random() * 3) + 1; // 1-3 (نسبة 40%)
                if (rand < 75) return Math.floor(Math.random() * 3) + 4; // 4-6 (نسبة 35%)
                if (rand < 95) return Math.floor(Math.random() * 2) + 7; // 7-8 (نسبة 20%)
                return 10; // 10 نقاط (نسبة 5% فقط)
            };

            const gainedXP = getPointsByLuck();
            userSoul.xp += gainedXP;
            userSoul.lastGift = now;

            // تحديث الرتبة
            if (userSoul.xp >= 20 && userSoul.rank === "باهتة 🌫️") userSoul.rank = "مستيقظة 👁️";
            else if (userSoul.xp >= 50 && userSoul.rank === "مستيقظة 👁️") userSoul.rank = "متوهجة 🔥";
            else if (userSoul.xp >= 100 && userSoul.rank === "متوهجة 🔥") userSoul.rank = "أسطورية 👑";

            fs.writeJsonSync(soulsPath, soulsDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "🎁", key: m.key } });

            // ✅ تحويل JID إلى LID للمنشن
            const mentionId = cleanId.replace('@s.whatsapp.net', '@lid');
            const displayNumber = cleanId.split('@')[0];

            // 3. بناء استمارة الهدية بتصميم جديد
            const giftTemplate = `
*───━━━⊱  🎁  ⊰━━━───*
   *⌬ هـديـة الـنـظـام الـيـومـيـة ⌬*
*───━━━⊱  ✨ 🎮  ⊰━━━───*

*👤 الـمُـسـتـلـم : ⦓ @${displayNumber} ⦔*

*🌀 الـجـوائـز : ⦓ +${gainedXP} ⦔ نـقـطـة XP*
*🎰 نـوع الـحـظ : ⦓ ${gainedXP > 8 ? "أسـطـوري 🌟" : gainedXP > 4 ? "نـادر 💎" : "عـادي 🌀"} ⦔*

*⎔┄┄─── ⊱╎⌯ 📊 ⌯╎⊰ ───┄┄⎔*

*📊 إجـمـالـي الـطـاقـة : ⦓ ${userSoul.xp} ⦔ XP*
*🏅 الـرتـبـة الـحـالـيـة : ⦓ ${userSoul.rank} ⦔*

*───━━━⊱  💠  ⊰━━━───*
*الـقـدر يـبـتـسـم لـلـمـثـابـريـن..*
*اسـتـخـدم هـذه الـطـاقـة لـتـعـزيـز كـيـانـك الـروحـي*
*───━━━⊱  🏮  ⊰━━━───*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            return await sock.sendMessage(chatId, { 
                text: giftTemplate, 
                mentions: [mentionId] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(chatId, { text: "❌ حدث خطأ في نظام الهدية" }, { quoted: m });
        }
    }
};