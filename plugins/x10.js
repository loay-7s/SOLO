import fs from 'fs-extra';

export default {
    name: "تحويل",
    aliases: ["ارسل", "ادفع"],
    category: "economy",

    async run({ sock, m, text, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            // 1. تنظيف المعرفات (لضمان وصول المال للمخزن الصحيح)
            const cleanSender = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            
            const contextInfo = m.message?.extendedTextMessage?.contextInfo;
            let target = contextInfo?.mentionedJid?.[0];

            const args = text.trim().split(/\s+/);
            const amount = parseInt(args[0]);

            // 2. التحقق من صحة المدخلات
            if (!amount || isNaN(amount) || amount <= 0) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـرجـى تـحـديـد مـبـلـغ + مـنـشـن لـلـتـحـويـل..*\n*مـثـال:(.تحويل 100 @المنشن)*" }, { quoted: m });
            }

            if (!target) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـرجـى مـنـشـن الـعـضـو الـذي تـريـد الـتـحـويـل لـه.*" }, { quoted: m });
            }

            const cleanTarget = target.split('@')[0].split(':')[0] + "@s.whatsapp.net";

            // 3. منع التحويل للنفس
            if (cleanSender === cleanTarget) {
                await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا يـمـكـنـك الـتـحـويـل لـنـفـسـك، أحـسـدك عـلـى ذكـاءك🥀*" }, { quoted: m });
            }

            // 4. قراءة قاعدة البيانات
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            
            // جلب بيانات الطرفين (مع دعم الهويات القديمة والجديدة)
            let senderData = bankDB[cleanSender] || bankDB[userJid] || { money: 0, rank: "عضو مكافح 🌱", inventory: [] };
            let targetData = bankDB[cleanTarget] || bankDB[target] || { money: 0, rank: "عضو مكافح 🌱", inventory: [] };

            // التحقق من الرصيد
            if (senderData.money < amount) {
                await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ❌ ｣ انت مـفـلـس و مـش لاقـي تـاكـل!*\n\n*رصـيـدك الـحـالـي: ⦓ ${senderData.money.toLocaleString()} 🪙 ⦔*` 
                }, { quoted: m });
            }

            // 5. تنفيذ العملية (التحويل للهوية المنظفة لضمان الظهور في .رصيدي)
            senderData.money -= amount;
            targetData.money = (targetData.money || 0) + amount;

            bankDB[cleanSender] = senderData;
            bankDB[cleanTarget] = targetData;
            
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            // 6. إرسال إيصال التحويل (بالتنسيق الثلاثي)
            await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

            const transferTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ إيـصـال تـحـويـل بـنـكـي ┇★*

*⎔┄┄─── ⊱╎⌯ 💸 ⌯╎⊰ ───┄┄⎔*

*❑ تـم تـحـويـل الـمـال بـنـجـاح ↯*

*📤 الـمـحـول : ⦓ @${userJid.split('@')[0]} ⦔*

*📥 الـمـسـتـلـم : ⦓ @${target.split('@')[0]} ⦔*

*💰 الـمـبـلـغ : ⦓ ${amount.toLocaleString()} 🪙 ⦔*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*🏦 رصـيـد الـمـسـتـلـم : ⦓ ${targetData.money.toLocaleString()} 🪙 ⦔*

*🏦 رصـيـدك الـآن : ⦓ ${senderData.money.toLocaleString()} 🪙 ⦔*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { 
                text: transferTemplate, 
                mentions: [userJid, target] 
            }, { quoted: m });

        } catch (e) {
            console.error("Transfer Error:", e);
        }
    }
};