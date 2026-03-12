import fs from 'fs-extra';

export default {
    name: "حظ",
    aliases: ["صندوق", "مقامرة"],
    category: "solo",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            
            // 1. تحديد الضحية عبر المنشن أو الرد
            const quoted = m.message?.extendedTextMessage?.contextInfo;
            let target = quoted?.participant || quoted?.mentionedJid?.[0];

            if (!target) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـرجـى مـنـشـن الـضـحـيـة الـتـي تـريـد تـجـربـة حـظـك الـأسـود عـلـيـهـا!*" }, { quoted: m });
            }
            const cleanTarget = target.split('@')[0].split(':')[0] + "@s.whatsapp.net";

            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            let userData = bankDB[cleanId] || { money: 0, inventory: [] };
            let targetData = bankDB[cleanTarget] || { money: 0 };

            // 2. التأكد من وجود الصندوق ومنع سرقة النفس
            if (!userData.inventory.includes("صندوق الحظ الأسود 📦")) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لـا تـمـلـك [ صـنـدوق الـحـظ الـأسـود 📦 ] فـي حـقـيـبـتـك!*" }, { quoted: m });
            }
            if (cleanTarget === cleanId) return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لـا يـمـكـنـك اسـتـهـداف نـفـسـك بـالـنـحـس!*" }, { quoted: m });

            // 3. استهلاك الصندوق وتفعيل الاحتمالات
            userData.inventory = userData.inventory.filter(item => item !== "صندوق الحظ الأسود 📦");
            await sock.sendMessage(chatId, { react: { text: "📦", key: m.key } });

            const winChance = Math.random() < 0.4;
            let resultMessage = "";

            if (winChance) {
                const stolenAmount = Math.floor(targetData.money * 0.15); // سرقة 15%
                targetData.money -= stolenAmount;
                userData.money += stolenAmount;
                
                resultMessage = `*❑ لـقـد ابـتـسـم لـك الـحـظ الـأسـود! ✨*\n\n*💰 الـجـائـزة : سـرقـة (15%) نـاجـحـة*\n*💸 الـمـبـلـغ الـمـكـتـسـب : ⦓ +${stolenAmount.toLocaleString()} 🪙 ⦔*\n*👤 الـضـحـيـة : ⦓ @${cleanTarget.split('@')[0]} ⦔*`;
            } else {
                const lossAmount = Math.floor(userData.money * 0.10); // خسارة 10%
                userData.money -= lossAmount;
                resultMessage = `*❑ لـقـد خـانـك الـحـظ الـأسـود! 💀*\n\n*⚠️ الـنـتـيـجـة : انـفـجـار الـصـنـدوق فـي وجـهـك*\n*📉 الـخـسـارة (10%) : ⦓ -${lossAmount.toLocaleString()} 🪙 ⦔*`;
            }

            bankDB[cleanId] = userData;
            bankDB[cleanTarget] = targetData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            const boxTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*★┇ فـتـح صـنـدوق الـحـظ الـأسـود 📦 ┇★*
*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*
${resultMessage}
*⎔┄┄─── ⊱╎⌯ 💰 ⌯╎⊰ ───┄┄⎔*
*🏦 رصـيـدك الـآن : ⦓ ${userData.money.toLocaleString()} 🪙 ⦔*
*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: boxTemplate, mentions: [cleanId, cleanTarget] }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};
