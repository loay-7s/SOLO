import fs from 'fs-extra';

export default {
    name: "رادار",
    aliases: ["تعقب", "الحيتان"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanUserId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};

            let userData = bankDB[cleanUserId] || { inventory: [] };

            if (!userData.inventory.includes("رادار التعقب 🔍")) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا تـمـلـك [ رادار التعقب 🔍 ] فـي حـقـيـبـتـك!*" }, { quoted: m });
            }

            // تحويل JID إلى LID للمنشن
            const formattedDB = {};
            Object.keys(bankDB).forEach(key => {
                const newKey = key.includes('@s.whatsapp.net') ? key.replace('@s.whatsapp.net', '@lid') : key;
                formattedDB[newKey] = bankDB[key];
            });

            // تصفية وترتيب أغنى الأعضاء
            let whales = Object.entries(formattedDB)
                .filter(([id]) => id !== cleanUserId.replace('@s.whatsapp.net', '@lid'))
                .map(([id, data]) => ({ 
                    id, 
                    money: data.money || 0
                }))
                .sort((a, b) => b.money - a.money);

            if (whales.length === 0) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *الـرادار لـم يـرصـد أي أهداف ثـريـة حـالـيـاً!*" }, { quoted: m });
            }

            await sock.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            // --- [ الجزء الأول: الحوت الأكبر (المركز الأول) ] ---
            const top1 = whales[0];
            let targetMsg = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ نـظـام تـعـقـب الـحـيـتـان الـراداري 🔍 ┇★*

*⎔┄┄─── ⊱╎⌯ 🐋 ⌯╎⊰ ───┄┄⎔*

*🐋 الـحـوت الأكـبـر :*

*👤 الـعـضـو الـمـوقـࢪ : ⦓ @${top1.id.split('@')[0]} ⦔*

*💰 الـثـروة : ⦓ ${top1.money.toLocaleString()} 🪙 ⦔*

*⎔┄┄─── ⊱╎⌯ 🌊 ⌯╎⊰ ───┄┄⎔*

*❑ [ قـائـمـة الـحـيـتـان ] 🐳↯*
*──────────────────────*\n`;

            // --- [ الجزء الثاني: باقي الحيتان ] ---
            const topRest = whales.slice(0, 5); // نجيب أول 5
            const medals = ["🥇", "🥈", "🥉", "🐳", "🐋"];
            
            topRest.forEach((whale, index) => {
                targetMsg += `${medals[index]} *#${index + 1}* | @${whale.id.split('@')[0]}\n`;
                targetMsg += `└─ *الـثـروة:* ${whale.money.toLocaleString()} 🪙\n\n`;
            });

            targetMsg += `*⎔┄┄─── ⊱╎⌯ 🛰️ ⌯╎⊰ ───┄┄⎔*

*⚠️ تـم اسـتـهـلاك [ رادار التعقب 🔍 ] مـن حـقـيـبـتك*
*💡 نـصـيـحـة : هـؤلاء هـم أفـضـل أهـداف لـصـنـدوق الـحـظ!*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            // استهلاك الرادار وحفظ البيانات
            userData.inventory = userData.inventory.filter(item => item !== "رادار التعقب 🔍");
            bankDB[cleanUserId] = userData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            const mentions = topRest.map(w => w.id);

            return await sock.sendMessage(chatId, { 
                text: targetMsg, 
                mentions: mentions
            }, { quoted: m });

        } catch (e) { 
            console.error(e);
            await sock.sendMessage(chatId, { text: "❌ حدث خطأ في نظام الرادار" }, { quoted: m });
        }
    }
};