import fs from 'fs-extra';

export default {
    name: "رصيدي",
    aliases: ["فلوسي", "محفظتي", "ثروتي"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            // 1. تنظيف المعرف للبحث في الملف
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";

            // 2. قراءة البيانات
            const bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            const userData = bankDB[cleanId] || bankDB[userJid] || { money: 0, rank: "عضو مكافح 🌱", inventory: [] };

            // 🟢 [تحديث التشفير]: فحص إذا كان حساب المستخدم نفسه "متفيرس" 🦠
            const now = Date.now();
            if (userData.virus && (now - userData.virus < 24 * 60 * 60 * 1000)) {
                await sock.sendMessage(chatId, { react: { text: "⚠️", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*\n\n*⚠️ تـنـبـيـه أمنـي : تـعـذر قـراءة بـيـانـات الـحـسـاب!*\n\n*┛── ℹ️ الـسـبـب: حـسـابـك مـصـاب بـ [ فيروس التشفير 🦠 ]*\n*🔒 جـمـيـع بـيـانـاتـك مـحـجـوبـة حـالـيـاً لـأغـراض الـتـأمـيـن.*\n\n*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*` 
                }, { quoted: m });
            }
            
            // تجهيز عرض المشتريات (الحقيبة)
            const inventory = (userData.inventory && userData.inventory.length > 0) 
                ? userData.inventory.join(' ، ') 
                : "خالية 📭";

            const formattedMoney = (userData.money || 0).toLocaleString('en-US');
            const shadowId = userJid.split('@')[0];

            // 3. تفاعل الرياكت
            await sock.sendMessage(chatId, { react: { text: "💳", key: m.key } });

            // 4. الاستمارة الشخصية (مقسمة لـ 3 أجزاء)
            const balanceTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ كـشـف الـحـساب الـمـالـي 💰 ┇★*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*👤 الـعـمـيـل : ⦓ @${shadowId} ⦔*

*💰 الـرصـيـد : ⦓ ${formattedMoney} 🪙 ⦔*

*📈 الـرتـبـة : ⦓ ${userData.rank} ⦔*

*⎔┄┄─── ⊱╎⌯ 🎒 ⌯╎⊰ ───┄┄⎔*

*❑ مـحـتـويـات الـحقـيـبـة ↯*

*📦 الـمـخـزن : ⦓ ${inventory} ⦔*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { 
                text: balanceTemplate, 
                mentions: [userJid] 
            }, { quoted: m });

        } catch (e) {
            console.error("Error in Balance Command:", e);
        }
    }
};