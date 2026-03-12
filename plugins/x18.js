import fs from 'fs-extra';

export default {
    name: "اشرب",
    aliases: ["استخدام_شراب", "طاقة"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};

            if (!bankDB[cleanId] || !bankDB[cleanId].inventory) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *أنـت لـا تـمـلـك أي أغـراض فـي حـقـيـبـتـك!*" }, { quoted: m });
            }

            let userData = bankDB[cleanId];

            // 1. الفحص إذا كان يمتلك شراب الطاقة في المخزن
            if (!userData.inventory.includes("شراب الطاقة ⚡")) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا تـمـلـك [ شراب الطاقة ⚡ ] فـي حـقـيـبـتـك، اشـتـريـه مـن الـمـتـجـر أولاً!*" }, { quoted: m });
            }

            // 2. فحص إذا كان في حالة انتظار (سواء للسرقة أو للراتب)
            const now = Date.now();
            const stealCooldown = 60 * 60 * 1000; // ساعة للسرقة
            const dailyCooldown = 24 * 60 * 60 * 1000; // 24 ساعة للراتب

            const isWaitingSteal = userData.lastSteal && (now - userData.lastSteal < stealCooldown);
            const isWaitingDaily = userData.lastDaily && (now - userData.lastDaily < dailyCooldown);

            if (!isWaitingSteal && !isWaitingDaily) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *أنـت فـي كـامـل طـاقـتـك الـآن ولـا تـحـتـاج لـاسـتـهـلاك الـمـنـشـط!*" }, { quoted: m });
            }

            // 3. تنفيذ مفعول الشراب الإمبراطوري (تصفير الوقتين)
            userData.lastSteal = 0; 
            userData.lastDaily = 0; 
            userData.inventory = userData.inventory.filter(item => item !== "شراب الطاقة ⚡");

            bankDB[cleanId] = userData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "⚡", key: m.key } });

            const drinkTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ مـخـتـبـر الـطـاقـة والـتـعـزيـز ⚡ ┇★*

*⎔┄┄─── ⊱╎⌯ 🧪 ⌯╎⊰ ───┄┄⎔*

*❑ تـم اسـتـهـلاك [ شراب الطاقة ⚡ ] بـنـجـاح ↯*

*👤 الـمـسـتـخـدم : ⦓ @${userJid.split('@')[0]} ⦔*

*🔥 الـتـأثـيـر الـمـزدوج :*
*• تـم تـصـفـيـر وقـت الـانـتـظـار لـلـسـرقـة 🥷*
*• تـم تـصـفـيـر وقـت الـانـتـظـار لـلـراتـب 💸*

*⚡ الـآن.. أنـت مـسـتـعـد لـجـمـع الـمـال مـجـدداً دون قـيـود.*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*📦 حـالـة الـمـخـزن : تـم حـذف الـغـرض بـعـد الـاسـتـخـدام*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: drinkTemplate, mentions: [userJid] }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *حـدث خـطـأ أثـنـاء اسـتـخـدام الـغـرض!*" }, { quoted: m });
        }
    }
};