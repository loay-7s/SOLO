import fs from 'fs-extra';

export default {
    name: "رصيد",
    aliases: ["فحص"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            // 1. تحديد الشخص المستهدف (ريبلاي أو منشن)
            const quoted = m.message?.extendedTextMessage?.contextInfo;
            let target = quoted?.participant || quoted?.mentionedJid?.[0];

            if (!target) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـرجـى مـنـشـن الـشـخـص أو الـرد عـلـى رسـالـتـه لـفـحص رصـيـده.*" }, { quoted: m });
            }

            const cleanUser = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            const cleanTarget = target.split('@')[0].split(':')[0] + "@s.whatsapp.net";

            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            
            let checkerData = bankDB[cleanUser] || { money: 0, rank: "عضو مكافح 🌱", inventory: [] };
            let targetData = bankDB[cleanTarget] || { money: 0, rank: "عضو مكافح 🌱", inventory: [] };

            // 🟢 [تحديث الأدوات الجديدة]: فحص فيروس التشفير 🦠
            const now = Date.now();
            if (targetData.virus && (now - targetData.virus < 24 * 60 * 60 * 1000)) {
                await sock.sendMessage(chatId, { react: { text: "⚠️", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ❗ ｣ خـطـأ فـي الـنـظـام: تـعـذر الـوصـول لـقـاعـدة بـيـانـات الـعـمـيـل!*\n\n*⚠️ الـسـبـب: الـحـسـاب مـصـاب بـ [ فيروس التشفير 🦠 ]*` 
                }, { quoted: m });
            }

            // 2. رسوم الاستعلام (20 عملة)
            const fee = 20;

            if (cleanUser !== cleanTarget) {
                if (checkerData.money < fee) {
                    await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
                    return await sock.sendMessage(chatId, { 
                        text: `*｢ ❌ ｣ عـذراً.. تـكـلـفـة الـإسـتـعـلام هـي ⦓ ${fee} ⦔ عـمـلات، وأنـت لا تـمـلـكـهـا!*` 
                    }, { quoted: m });
                }
                checkerData.money -= fee;
                bankDB[cleanUser] = checkerData;
                fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });
            }

            // 3. تجهيز البيانات للعرض
            const inventory = (targetData.inventory && targetData.inventory.length > 0) 
                ? targetData.inventory.join(' ، ') 
                : "خالية 📭";
            
            const formattedMoney = (targetData.money || 0).toLocaleString('en-US');
            const targetId = target.split('@')[0];

            await sock.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            // 4. الاستمارة الاحترافية (3 أجزاء)
            const balanceTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ تـقـريـر الـتـجـسـس الـمـالـي 🕵️ ┇★*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*👤 الـمُـسـتـهـدف : ⦓ @${targetId} ⦔*

*💰 الـرصـيـد : ⦓ ${formattedMoney} 🪙 ⦔*

*📈 الـرتـبـة : ⦓ ${targetData.rank} ⦔*

*📦 الـمـخـزن : ⦓ ${inventory} ⦔*

*⎔┄┄─── ⊱╎⌯ 🪙 ⌯╎⊰ ───┄┄⎔*

*⚠️ تـم خـصـم رسـوم : ⦓ ${fee} ⦔ عـمـلـة*
*🏦 رصـيـدك الـحـالـي : ⦓ ${checkerData.money.toLocaleString()} ⦔*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { 
                text: balanceTemplate, 
                mentions: [userJid, target] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};