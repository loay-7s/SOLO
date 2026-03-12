export default {
    name: "احسب",
    aliases: ["حاسبة", "calc"],
    category: "tools",

    async run({ sock, m, text }) {
        const chatId = m.key.remoteJid;

        // --- الجزء الأول: التحقق من المدخلات ---
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "｢ ⚠️ ｣ *يـࢪجـى إدخـال الـعـمـلـيـة الـحـسـابـيـة.. مـثـال: .احسب 5×5*" 
            }, { quoted: m });
        }

        try {
            // --- الجزء الثاني: منطق الحساب المطور ---
            // تحويل الرموز × و ÷ إلى رموز برمجية ليفهمها المحرك
            let operation = text
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/[^-()\d/*+.]/g, ''); // تنظيف لزيادة الأمان
            
            // التأكد من وجود عملية حسابية بعد التنظيف
            if (!operation) throw new Error("Invalid");

            const result = new Function(`return ${operation}`)();

            // التحقق إذا كانت النتيجة رقمية صالحة
            if (isNaN(result) || !isFinite(result)) throw new Error("Math Error");

            // --- الجزء الثالث: استمارة النتيجة (3 أجزاء) ---
            const response = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*➕┇ الـحـاسـبـة ┇➖*
*⎔┄┄─── ⊱╎⌯ ⚙️ ⌯╎⊰ ───┄┄⎔*

*🔢 الـمـسـألـة : ⦓ ${text} ⦔*

*✨ الـنـتـيـجـة الـنـهـائـيـة : ⦓ ${result} ⦔*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            await sock.sendMessage(chatId, { react: { text: "🔢", key: m.key } });
            
            await sock.sendMessage(chatId, { 
                text: response 
            }, { quoted: m });

        } catch (e) {
            // معالجة الأخطاء الرياضية (مثل القسمة على صفر)
            await sock.sendMessage(chatId, { 
                text: "｢ ❌ ｣ *عـمـلـيـة حـسـابـيـة غـيـر صـحـيـحـة!*" 
            }, { quoted: m });
        }
    }
};