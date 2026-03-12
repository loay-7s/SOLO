import fs from 'fs-extra';

export default {
    name: "حرق",
    aliases: ["زفير_التنين"],
    category: "mythology",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';

        try {
            const senderId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            const senderSoul = soulsDB[senderId];
            const now = Date.now();

            // 1. التحقق من الصلاحية (التنين الأصلي أو الأثير المستحوذ)
            const isDragon = senderSoul?.name.includes("التنين");
            const isEtherWithDragon = senderSoul?.name.includes("الأثير") && 
                                     senderSoul?.copiedAbility?.includes("التنين") && 
                                     now < senderSoul?.copyExpiry;

            if (!senderSoul || (!isDragon && !isEtherWithDragon)) {
                return await sock.sendMessage(chatId, { text: "*⚠️ هـذا الـلـهـب سـيـحـرقـك.. وحـده [ الـتـنـيـن 🔥 ] مـن يـتـحـكـم فـي زفـيـر الـحـرق!*" }, { quoted: m });
            }

            // ⭐ فحص التجميد (القفل الجليدي)
            if (senderSoul.isFrozen && now < senderSoul.freezeExpiry) {
                const minutesLeft = Math.ceil((senderSoul.freezeExpiry - now) / (60 * 1000));
                await sock.sendMessage(chatId, { react: { text: "🧊", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ 🧊 ｣ روحـك مـتـجـمـدة ومـسـلـوبـة الـقـوة..*\n\n*⚠️ لـا يـمـكـنـك نـفـث الـلـهـب والـروح مـقـيـدة.. انـتـظـر ⦓ ${minutesLeft} ⦔ دقـيـقـة.*` 
                }, { quoted: m });
            }

            // نظام الانتظار (6 ساعات)
            const cooldownTime = 6 * 60 * 60 * 1000; 
            if (senderSoul.lastBurn && (now - senderSoul.lastBurn < cooldownTime)) {
                const timeLeft = Math.ceil((cooldownTime - (now - senderSoul.lastBurn)) / (60 * 60 * 1000));
                return await sock.sendMessage(chatId, { text: `*⏳ لـا يـزال نـفـسك بـارداً.. يـرجـى الـانـتـظـار ⦓ ${timeLeft} ⦔ سـاعـات لـإعـادة نـفـث الـلـهـب.*` }, { quoted: m });
            }

            // 2. تحديد الهدف (نظام الاقتفاء)
            const ctx = m.message?.extendedTextMessage?.contextInfo;
            let shadow = ctx?.mentionedJid?.[0] || ctx?.participant || m.quoted?.sender;

            if (!shadow) return await sock.sendMessage(chatId, { text: "*👤 يـرجـى الـرد عـلـى رسـالـة الـخـصـم أو عـمـل مـنـشـن لـحـرقـه.*" }, { quoted: m });

            const cleanTarget = shadow.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let targetSoul = soulsDB[cleanTarget];

            if (!targetSoul) return await sock.sendMessage(chatId, { text: "*📍 هـذا الـكـائـن لـا يـمـلـك روحـاً لـتـحـتـرق بـعـد.*" }, { quoted: m });

            // 3. تنفيذ الحرق والتجميد
            const burnAmount = Math.floor(targetSoul.xp * 0.05);
            targetSoul.xp -= burnAmount;
            
            targetSoul.isFrozen = true;
            targetSoul.freezeExpiry = now + (1 * 60 * 60 * 1000); 

            senderSoul.lastBurn = now;
            fs.writeJsonSync(soulsPath, soulsDB, { spaces: 2 });

            const targetId = cleanTarget.split('@')[0];
            await sock.sendMessage(chatId, { react: { text: "🔥", key: m.key } });

            // 4. بناء الاستمارة
            const burnTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*🔥┇ زفـيـر الـتـنـيـن الـمُـحـرق ┇🔥*
*⎔┄┄─── ⊱╎⌯ 🐲 ⌯╎⊰ ───┄┄⎔*

*👤 الـمُـحـتـرق : ⦓ @${targetId} ⦔*

*📉 الـخـسـارة : ⦓ ${burnAmount} ⦔ XP (5%)*

*🧊 الـحـالـة : ⦓ روح مـتـجـمـدة لـمـدة سـاعـة ⦔*

*⎔┄┄─── ⊱╎⌯ 🛡️ ⌯╎⊰ ───┄┄⎔*

*📊 طـاقـة الـهـدف الـآن : ⦓ ${targetSoul.xp} ⦔ XP*

*⏳ يـنـتـهـي الـتـجمـيـد : ⦓ بـعـد 60 دقيقة ⦔*

*⎔┄┄─── ⊱╎⌯ 🏮 ⌯╎⊰ ───┄┄⎔*

*💠 " نـاري لـا تـكـتـفـي بـأكـل جـسـدك.. بـل تـجـمـد روحـك وتـسـلـب قـوتـك.. كـن عـبـرة لـغـيـرك! " 🔥*

~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            return await sock.sendMessage(chatId, { 
                text: burnTemplate,
                contextInfo: { mentionedJid: [cleanTarget, senderId] }
            }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};