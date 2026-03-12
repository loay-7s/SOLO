export default {
    name: "هل",
    category: "fun",
    async run({ sock, m, text }) {
        // تحديد المعرفات مباشرة من الرسالة لتجنب أخطاء التعريف
        const chatId = m.key.remoteJid;
        const userJid = m.key.participant || m.key.remoteJid;

        // --- الجزء الأول: التحقق من وجود سؤال ---
        if (!text || text.trim() === "") {
            return await sock.sendMessage(chatId, { 
                text: "｢ ⚠️ ｣ *اسـأل سـؤالـاً بـعـد الـأمـر.. مـثـال: .هل سأصبح غنياً؟*" 
            }, { quoted: m });
        }

        // --- الجزء الثاني: منطق الإجابات العشوائية ---
        const answers = [
            "نعم، وبكل تأكيد! ✅",
            "في أحلامك فقط يا صديقي.. 😴",
            "مستحيل، حتى لو انطبقت السماء على الأرض. ❌",
            "قطعت الشك باليقين.. الإجابة هي نعم! 🔥",
            "لا أعتقد ذلك، ابحث عن حلم آخر. 🌊",
            "منطقيا فـ انا اتفق يب نعم⚡"
        ];
        const selectedAnswer = answers[Math.floor(Math.random() * answers.length)];

        // --- الجزء الثالث: استمارة الرد (3 أجزاء) ---
        const response = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*

*⎔┄┄─── ⊱╎⌯ 🕯️ ⌯╎⊰ ───┄┄⎔*

*❓ الـسـؤال : ⦓ ${text.trim()} ⦔*

*✨ الـإجـابـة : ⦓ ${selectedAnswer} ⦔*

*⎔┄┄── ⊱╎⌯ 🃏 ⌯╎⊰ ──┄┄⎔*`.trim();

        await sock.sendMessage(chatId, { 
            text: response, 
            mentions: [userJid] 
        }, { quoted: m });
    }
};