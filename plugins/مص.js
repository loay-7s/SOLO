export default {
    name: "مص",
    aliases: ["مصمص", "مصه"],
    category: "مطور",
    developer: true,

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        
        // التحقق إذا كان في منشن أو رد
        let targetJid = "";
        let targetName = "";
        
        // لو في منشن
        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            targetName = `@${targetJid.split('@')[0]}`;
        }
        // لو في رد على رسالة
        else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = m.message.extendedTextMessage.contextInfo.participant;
            targetName = `@${targetJid.split('@')[0]}`;
        }
        // لو مفيش منشن ولا رد
        else {
            await sock.sendMessage(chatId, { 
                text: "*⎔┄┄─ ⊱╎⌯ ❓ ⌯╎⊰─┄┄⎔*\n\n*┋ مين اللي عايزه يمصلك؟*\n*┋ منشنه او رد ع رسالته*\n\n*⎔┄┄─ ⊱╎⌯ ❓ ⌯╎⊰─┄┄⎔*" 
            });
            
            await sock.sendMessage(chatId, { react: { text: "🫦", key: m.key } });
            return;
        }

        // ريأكت 🫦
        await sock.sendMessage(chatId, { react: { text: "🫦", key: m.key } });

        // رسايل متنوعة بالشكل المطلوب
        const messages = [
            `*⎔┄┄─ ⊱╎⌯ 🫦 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} تعال مصمصلي يا عبدي*\n\n*⎔┄┄─ ⊱╎⌯ 🫦 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 😈 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} متيجي تمصلي*\n\n*⎔┄┄─ ⊱╎⌯ 😈 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 👅 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} مص يا عبد*\n\n*⎔┄┄─ ⊱╎⌯ 👅 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🪳 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} مص يا حشرة*\n\n*⎔┄┄─ ⊱╎⌯ 🪳 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🍆 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} زبي عايز يتدلع تعال مصه*\n\n*⎔┄┄─ ⊱╎⌯ 🍆 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🤫 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} كفاية هري وتعال مص*\n\n*⎔┄┄─ ⊱╎⌯ 🤫 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🥵 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} تعال مصه بسرعه*\n\n*⎔┄┄─ ⊱╎⌯ 🥵 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🐷 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} مص يا خنزير*\n\n*⎔┄┄─ ⊱╎⌯ 🐷 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 👄 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} شوفلك شغلانة مص*\n\n*⎔┄┄─ ⊱╎⌯ 👄 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 💦 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} مص و بلع*\n\n*⎔┄┄─ ⊱╎⌯ 💦 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 👶 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} مص يا بيبي*\n\n*⎔┄┄─ ⊱╎⌯ 👶 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🐒 ⌯╎⊰─┄┄⎔*\n\n*┋ ${targetName} مص يا قرد*\n\n*⎔┄┄─ ⊱╎⌯ 🐒 ⌯╎⊰─┄┄⎔*`,
        ];

        // اختيار رسالة عشوائية
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // إرسال الرسالة مع المنشن
        await sock.sendMessage(chatId, { 
            text: randomMessage,
            mentions: [targetJid]
        }, { quoted: m });
    }
};