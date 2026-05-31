export default {
    name: "بوسه",
    aliases: ["kiss", "بوسة"],
    category: "العاب",
    group: true,

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;

        // تحديد الهدف (منشن أو رد)
        let targetJid = "";
        let targetNumber = "";

        // لو في منشن
        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            targetNumber = targetJid.split('@')[0];
        }
        // لو في رد على رسالة
        else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = m.message.extendedTextMessage.contextInfo.participant;
            targetNumber = targetJid.split('@')[0];
        }
        // لو مفيش منشن ولا رد
        else {
            await sock.sendMessage(chatId, { 
                text: "*⎔┄┄─ ⊱╎⌯ ❓ ⌯╎⊰─┄┄⎔*\n\n*┋ مـيـن الـلـي عـاوزه يـتـبـاس؟*  \n*┋ مـنـشـنـه او رد ع رسـالتـه*\n\n*⎔┄┄─ ⊱╎⌯ ❓ ⌯╎⊰─┄┄⎔*" 
            });
            await sock.sendMessage(chatId, { react: { text: "💋", key: m.key } });
            return;
        }

        // منع البوسة للنفس
        const senderJid = userJid;
        if (targetJid === senderJid) {
            return await sock.sendMessage(chatId, { 
                text: "*⎔┄┄─ ⊱╎⌯ 😳 ⌯╎⊰─┄┄⎔*\n\n*┋ يـسـطـا انـت هـتـبـوس نـفـسـك؟ يـا عـمـي جـرب تـبـوس نـفـسـك فـي الـمـرايـة الاول*\n\n*⎔┄┄─ ⊱╎⌯ 😳 ⌯╎⊰─┄┄⎔*", 
                mentions: [targetJid] 
            }, { quoted: m });
        }

        await sock.sendMessage(chatId, { react: { text: "💋", key: m.key } });

        // رسائل بوسة باللهجة المصرية 100%
        const messages = [
            `*⎔┄┄─ ⊱╎⌯ 💋 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ تـعـالـى خـد بـوسـة مـن الـبـوت*\n\n*⎔┄┄─ ⊱╎⌯ 💋 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 😘 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ الـبـوت بـاسـك عـلـى خـدك، مـتـكـسـفــيـش*\n\n*⎔┄┄─ ⊱╎⌯ 😘 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 💏 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ الـبـوت بـاسـك بـوسـة مـتـدلـعـة*\n\n*⎔┄┄─ ⊱╎⌯ 💏 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🫣 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ احـلـى بـوسـة👄*\n\n*⎔┄┄─ ⊱╎⌯ 🫣 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 💕 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ الـبـوت قـالـك انـتِ حـبـيـبـتـي وبـاسـك قـدام الـكـل*\n\n*⎔┄┄─ ⊱╎⌯ 💕 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 😚 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ رمـيـت لـك بـوسـة مـن بـعـيـد مـتـخـفـيــش مـحـدش شـاف*\n\n*⎔┄┄─ ⊱╎⌯ 😚 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🌸 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ بـوسـة هـاديـة ونـاعـمـة عـشـان مـتـتـكـسـفـيــش💋*\n\n*⎔┄┄─ ⊱╎⌯ 🌸 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🫶 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ الـبـوت بـاسـك وقـالـك وحـشـتـيـنـي*\n\n*⎔┄┄─ ⊱╎⌯ 🫶 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ ✨ ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ بـوسـة سـحـريـة مـن الـبـوت تـخـلـيـك تـحـمـر🤭*\n\n*⎔┄┄─ ⊱╎⌯ ✨ ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 💖 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ الـبـوت بـاسـك بـكـل حـب ومـتـخـفـيـش احـنـا لـوحـدنـا*\n\n*⎔┄┄─ ⊱╎⌯ 💖 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 🥰 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ خـد بـوسـة ولا اروع وانت مـغـمـض*\n\n*⎔┄┄─ ⊱╎⌯ 🥰 ⌯╎⊰─┄┄⎔*`,
            
            `*⎔┄┄─ ⊱╎⌯ 😳 ⌯╎⊰─┄┄⎔*\n\n*┋ ⦓ @${targetNumber} ⦔ البوت بـاسـك واتـكـسـف مـعـاك*\n\n*⎔┄┄─ ⊱╎⌯ 😳 ⌯╎⊰─┄┄⎔*`,
        ];

        // اختيار رسالة عشوائية
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // إرسال الرسالة مع المنشن
        await sock.sendMessage(chatId, { 
            text: randomMessage,
            mentions: [targetJid]
        }, { quoted: m });

        await sock.sendMessage(chatId, { react: { text: "💋", key: m.key } });
    }
};