import fs from 'fs-extra';

export default {
    name: "تشويش",
    aliases: ["عطل", "تعطيل"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            const quoted = m.message?.extendedTextMessage?.contextInfo;
            let target = quoted?.participant || quoted?.mentionedJid?.[0];

            if (!target) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـرجـى مـنـشـن الـشـخـص أو الـرد عـلـى رسـالـتـه لـتـشـويـشـه!*" }, { quoted: m });
            }

            const cleanTarget = target.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};

            let userData = bankDB[cleanId] || { inventory: [] };

            // التأكد من وجود جهاز التشويش في حقيبة المهاجم
            if (!userData.inventory.includes("جهاز التشويش 📡")) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا تـمـلـك [ جهاز التشويش 📡 ] فـي حـقـيـبـتـك!*" }, { quoted: m });
            }

            // تنفيذ التشويش لمدة 6 ساعات (6 * 60 * 60 * 1000)
            const duration = 6 * 60 * 60 * 1000;
            bankDB[cleanTarget] = bankDB[cleanTarget] || { money: 0, inventory: [] };
            bankDB[cleanTarget].jamTime = Date.now() + duration;

            // حذف الجهاز من حقيبة المهاجم
            userData.inventory = userData.inventory.filter(item => item !== "جهاز التشويش 📡");
            bankDB[cleanId] = userData;

            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "📡", key: m.key } });

            const jamTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*
*★┇ هـجـوم تـعـطـيـل الـأنـظـمـة 📡 ┇★*
*⎔┄┄─── ⊱╎⌯ 🚫 ⌯╎⊰ ───┄┄⎔*
*❑ تـم تـفـعـيـل الـتـشـويـش بـنـجـاح ↯*
*👤 الـمـسـتـهـدف : ⦓ @${target.split('@')[0]} ⦔*
*⏳ الـمـدة : 6 سـاعـات كـامـلـة*
*⚠️ الـتـأثـيـر : شـلل تـام فـي الـسـرقـة والـحـقـيـبـة والـبنك*
*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*
*ℹ️ تـم اسـتـهـلاك [ جهاز التشويش 📡 ] مـن حـقـيـبـتـك*
*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: jamTemplate, mentions: [target] }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};