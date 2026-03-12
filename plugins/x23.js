import fs from 'fs-extra';

export default {
    name: "تعدين",
    aliases: ["منجم"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};

            let userData = bankDB[cleanId] || { money: 0, inventory: [], lastMine: 0 };

            // 1. التأكد من وجود مجمع التعدين في الحقيبة
            if (!userData.inventory.includes("مجمع التعدين ⛏️")) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا تـمـلـك [ مـجـمـع الـتـعـديـن ⛏️ ] لـتـسـتـخـرج الـعـمـلات!*" }, { quoted: m });
            }

            // 2. فحص وقت التعدين (كل 4 ساعات)
            const now = Date.now();
            const miningCooldown = 4 * 60 * 60 * 1000; // 4 ساعات
            const timePassed = now - (userData.lastMine || 0);

            if (timePassed < miningCooldown) {
                const remaining = miningCooldown - timePassed;
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                
                await sock.sendMessage(chatId, { react: { text: "⏳", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ⏳ ｣ المـناجم لا تـزال تـعـمـل.. يـرجـى الانـتـظـار!*\n\n*يـمـكـنـك الـاسـتـلام بـعـد: ⦓ ${hours} سـاعـة و ${minutes} دقـيـقـة ⦔*` 
                }, { quoted: m });
            }

            // 3. إضافة الأرباح
            const miningProfit = 250;
            userData.money += miningProfit;
            userData.lastMine = now;

            bankDB[cleanId] = userData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "⛏️", key: m.key } });

            const miningTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ مـركـز تـعـديـن الـعـمـلات الـرقـمـيـة ⛏️ ┇★*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ تـم اسـتـخـراج الأربـاح بـنـجـاح ↯*

*💰 الـعـائد : ⦓ +${miningProfit} 🪙 ⦔*
*🏦 رصـيـدك الـآن : ⦓ ${userData.money.toLocaleString()} 🪙 ⦔*

*⎔┄┄─── ⊱╎⌯ ⚙️ ⌯╎⊰ ───┄┄⎔*

*ℹ️ المـجمع يـولـد الأربـاح تـلقـائـيـاً كـل 4 سـاعـات*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: miningTemplate }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};