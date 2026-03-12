import fs from 'fs-extra';

export default {
    name: "تشفير",
    aliases: ["فيروس", "هجوم_برمجي"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const quoted = m.message?.extendedTextMessage?.contextInfo;
            let target = quoted?.participant || quoted?.mentionedJid?.[0];

            if (!target) return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـرجـى الـرد عـلـى رسـالـة الـضـحـيـة لـحـقـن الـفـيـروس!*" }, { quoted: m });

            const cleanUser = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            const cleanTarget = target.split('@')[0].split(':')[0] + "@s.whatsapp.net";

            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            let userData = bankDB[cleanUser] || { inventory: [] };
            let targetData = bankDB[cleanTarget] || { money: 0, inventory: [] };

            // 1. فحص الملكية
            if (!userData.inventory.includes("فيروس التشفير 🦠")) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا تـمـلـك [ فيروس التشفير 🦠 ] فـي حـقـيـبـتـك!*" }, { quoted: m });
            }

            // 2. حقن الفيروس (صلاحية 24 ساعة)
            targetData.virus = Date.now(); 
            
            // 3. استهلاك الأداة من المهاجم
            userData.inventory = userData.inventory.filter(item => item !== "فيروس التشفير 🦠");

            bankDB[cleanUser] = userData;
            bankDB[cleanTarget] = targetData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "🦠", key: m.key } });

            const virusTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*
*★┇ هـجـوم فـيـروسـي مـشـفـر 🦠 ┇★*
*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*👤 الـمُـهـاجـم : ⦓ @${userJid.split('@')[0]} ⦔*
*🎯 الـضـحـيـة : ⦓ @${target.split('@')[0]} ⦔*

*⚠️ الـتـأثـيـر : تـم تـشـفـيـر حـسـاب الـضـحـيـة بـنـجـاح!*
*🔒 لـن يـتـمـكـن أحـد مـن رؤيـة رصـيـده لـمـدة 24 سـاعـة.*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: virusTemplate, mentions: [userJid, target] }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};