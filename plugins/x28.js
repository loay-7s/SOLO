import fs from 'fs-extra';

export default {
    name: "اثير",
    aliases: ["العدم", "نفي"],
    category: "mythology",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';

        try {
            const senderId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            
            const senderSoul = soulsDB[senderId];
            if (!senderSoul || !senderSoul.name.includes("الأثير")) {
                return await sock.sendMessage(chatId, { text: "*⚠️ هـذا الـبُـعـد مـحـظـور عـلـيـك.. وحـده [ الـأثـيـر 🌌 ] مـن يـتـحـكـم فـي بـوابـات الـعـدم!*" }, { quoted: m });
            }

            const cooldownTime = 6 * 60 * 60 * 1000; 
            const now = Date.now();
            if (senderSoul.lastEther && (now - senderSoul.lastEther < cooldownTime)) {
                const timeLeft = Math.ceil((cooldownTime - (now - senderSoul.lastEther)) / (60 * 60 * 1000));
                return await sock.sendMessage(chatId, { text: `*⏳ بـوابـة الـعـدم مـغـلـقـة حـالـيـاً.. يـرجـى الـانـتـظـار ⦓ ${timeLeft} ⦔ سـاعـات.*` }, { quoted: m });
            }

            if (senderSoul.isFrozen && now < senderSoul.freezeExpiry) {
                return await sock.sendMessage(chatId, { text: "*｢ 🧊 ｣ كـيـانـك الـأثـيـري مـتـجـمـد.. لـا يـمـكـنـك فـتـح بـوابـة الـعـدم!*" }, { quoted: m });
            }

            const ctx = m.message?.extendedTextMessage?.contextInfo;
            let shadow = ctx?.mentionedJid?.[0] || ctx?.participant || m.quoted?.sender;

            if (!shadow) return await sock.sendMessage(chatId, { text: "*👤 يـرجـى الـرد أو الـمـنـشـن لـنـفـي الـخـصـم والـاسـتـحـواذ عـلـى قـدرتـه.*" }, { quoted: m });

            const cleanTarget = shadow.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let targetSoul = soulsDB[cleanTarget];

            if (!targetSoul) return await sock.sendMessage(chatId, { text: "*📍 لـا يـوجـد جـوهر لـنـفـيـه هـنـا.*" }, { quoted: m });

            // ⭐ ميزة الاستحواذ المؤقت (3 ساعات)
            senderSoul.copiedAbility = targetSoul.name; // نسخ اسم الروح
            senderSoul.copyExpiry = now + (3 * 60 * 60 * 1000); // تنتهي بعد 3 ساعات

            // نفي الخصم (تجميد 3 ساعات)
            targetSoul.isFrozen = true;
            targetSoul.freezeExpiry = now + (3 * 60 * 60 * 1000); 
            senderSoul.lastEther = now;

            fs.writeJsonSync(soulsPath, soulsDB, { spaces: 2 });
            await sock.sendMessage(chatId, { react: { text: "🌌", key: m.key } });

            // ✅ تحويل JIDs إلى LIDs للمنشن
            const senderMention = senderId.replace('@s.whatsapp.net', '@lid');
            const targetMention = cleanTarget.replace('@s.whatsapp.net', '@lid');
            
            const senderDisplay = senderId.split('@')[0];
            const targetDisplay = cleanTarget.split('@')[0];

            const copyTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*🌌┇ مـراسـم الـنـفـي والـاسـتـحـواذ ┇🌌*
*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*👤 الـمُـسـتـهدف : ⦓ @${targetDisplay} ⦔*

*🧊 الـحـالـة : ⦓ مـنـفـي إلـى الـعـدم ⦔ (3 سـاعـات)*
*🎭 الـتـقـمـص : ⦓ اسـتـحـواذ عـلـى قـدرات الـخـصـم ⦔*

*⎔┄┄─── ⊱╎⌯ 🛡️ ⌯╎⊰ ───┄┄⎔*

*📑 سـجـل الـأثـيـر : لـقـد سـرقت جـوهر [ ${targetSoul.name.split(' ')[1]} ].. يـمـكـنـك الـآن اسـتـخـدام قـواه لـمـدة 3 سـاعـات!*

*⎔┄┄─── ⊱╎⌯ 🏮 ⌯╎⊰ ───┄┄⎔*

*💠 " وجـودك مـلـكي الـآن.. سـأعـيـش بـروحـك بـيـنـمـا تـتـعـفـن أنـت فـي الـفـراغ! "*

~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            return await sock.sendMessage(chatId, { 
                text: copyTemplate,
                mentions: [targetMention, senderMention] // ✅ منشن بشكل صحيح
            }, { quoted: m });

        } catch (e) { 
            console.error(e);
            await sock.sendMessage(chatId, { text: "❌ حدث خطأ في نظام الأثير" }, { quoted: m });
        }
    }
};