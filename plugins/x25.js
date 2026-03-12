import fs from 'fs-extra';

export default {
    name: "اقتفاء",
    aliases: ["كشف_الطاقة"],
    category: "mythology",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';

        try {
            // تثبيت معرف المرسل
            const senderId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            const senderSoul = soulsDB[senderId];
            const now = Date.now();
            
            // ⭐ فحص الصلاحية (البدوي الأصلي أو الأثير المستحوذ)
            const isBedouin = senderSoul?.name.includes("البدوي");
            const isEtherWithBedouin = senderSoul?.name.includes("الأثير") && 
                                      senderSoul?.copiedAbility?.includes("البدوي") && 
                                      now < senderSoul?.copyExpiry;

            if (!senderSoul || (!isBedouin && !isEtherWithBedouin)) {
                return await sock.sendMessage(chatId, { text: "*⚠️ هـذا الأمـر مـحـرم عـلـيـك.. وحـده [ الـبـدوي 🐪 ] مـن يـجـيـد قـراءة الـأثـر!*" }, { quoted: m });
            }

            // فحص التجميد (القفل الجليدي)
            if (senderSoul.isFrozen && now < senderSoul.freezeExpiry) {
                const minutesLeft = Math.ceil((senderSoul.freezeExpiry - now) / (60 * 1000));
                await sock.sendMessage(chatId, { react: { text: "🧊", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ 🧊 ｣ روحـك مـتـجـمـدة ومـسـلـوبـة الـقـوة..*\n\n*⚠️ لـا يـمـكـنـك قـراءة الـأثـر والـروح مـقـيـدة.. انـتـظـر ⦓ ${minutesLeft} ⦔ دقـيـقـة.*` 
                }, { quoted: m });
            } else if (senderSoul.isFrozen && now >= senderSoul.freezeExpiry) {
                senderSoul.isFrozen = false;
                delete senderSoul.freezeExpiry;
            }

            // استخراج المنشن الصحيح
            const ctx = m.message?.extendedTextMessage?.contextInfo;
            let shadow =
                ctx?.mentionedJid?.[0] ||
                ctx?.participant ||
                m.quoted?.sender;
            
            if (!shadow) return await sock.sendMessage(chatId, { text: "*👤 يـرجـى الـرد عـلـى رسـالـة الـخـصـم أو عـمـل مـنـشـن لـاقتـفـاء أثـره.*" }, { quoted: m });

            const cleanTarget = shadow.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let targetSoul = soulsDB[cleanTarget];

            if (!targetSoul) return await sock.sendMessage(chatId, { text: "*📍 لـا يـوجـد أثـر روحي لـهـذا الـكـائـن فـي سـجـلـاتـنـا بـعـد.*" }, { quoted: m });

            // ريأكت الجمل
            await sock.sendMessage(chatId, { react: { text: "🐪", key: m.key } });

            // 3. بناء الاستمارة بنفس النصوص دون تغيير
            const trackingTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*👣┇ رادار الاقـتـفاء الـبـدوي ┇👣*
*⎔┄┄─── ⊱╎⌯ 🌙 ⌯╎⊰ ───┄┄⎔*

*👤 الـهـدف : ⦓ @${cleanTarget.split('@')[0]} ⦔*

*🔮 الـروح الـكـامـنـة : ⦓ ${targetSoul.name} ⦔*

*📊 الـتـطـور : ⦓ ${targetSoul.rank} ⦔*

*⎔┄┄─── ⊱╎⌯ 🛡️ ⌯╎⊰ ───┄┄⎔*

*🌀 الـهـالـة الـمـنـبـعـثـة : ${targetSoul.aura}*

*⚡ نـقـاط طـاقـة الـ XP : ⦓ ${targetSoul.xp} ⦔*

*❑ رتـبـة الـقـوة : ⦓ ${targetSoul.rank.split(' ')[0]} ⦔*

*⎔┄┄─── ⊱╎⌯ 🏮 ⌯╎⊰ ───┄┄⎔*

*📜 الـنـبـوءة الـمـكـتـوبـة :*
*« ${targetSoul.desc} »*

~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            // الإرسال مع تثبيت المنشن فعليًا
            return await sock.sendMessage(chatId, { 
                text: trackingTemplate,
                contextInfo: {
                    mentionedJid: [cleanTarget, senderId]
                }
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(chatId, { text: "*❌ فـشـل الـرادار فـي تـحـديـد الـمـوقـع.*" });
        }
    }
};