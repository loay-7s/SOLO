export default {
    name: "وصف",
    description: "تغيير وصف المجموعة عبر النص أو الرد.",
    category: "admin",
    group: true, 

    async run({ sock, message, reply, text, isDeveloper }) {
        const jid = message.key.remoteJid;

        // --- الجزء الأول: التحقق من السلطة ---
        const metadata = await sock.groupMetadata(jid);
        const senderId = message.key.participant || message.participant;
        const sender = metadata.participants.find(p => p.id === senderId);
        const isAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';

        if (!isAdmin && !isDeveloper) {
            return reply("*｢ ❌ ｣ هـذا الأمـر مـخـصـص لـلـمـشـࢪفـين فـقـط.*");
        }

        // --- الجزء الثاني: منطق استخراج الوصف (نص أو ريبلاي) ---
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let newDescription = text;

        if (!text && quotedMessage) {
            newDescription = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;
        }

        if (!newDescription) {
            return reply("*｢ ⚠️ ｣ يـرجـى كـتـابـة الـوصف بـعـد الأمـر أو الـرد عـلى رسـالـة بالأمـࢪ.* \n*مـثـال: .وصف 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 𝑰𝑺 𝑴𝒀 𝑼𝑵𝑪𝑳𝑬*");
        }

        try {
            // --- الجزء الثالث: التنفيذ والتعميد بالاستمارة الإمبراطورية ---
            await sock.groupUpdateDescription(jid, newDescription);
            
            await sock.sendMessage(jid, { react: { text: "📝", key: message.key } });
            
            const successMsg = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*✅┇ تـم تـغـيـيـر وصـف الـمـجـمـوعـة ┇✅*
*⎔┄┄─── ⊱╎⌯ 👑 ⌯╎⊰ ───┄┄⎔*

*🔥 الـوصـف الـجـديـد : ⦓ ${newDescription} ⦔*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            await reply(successMsg);

        } catch (error) {
            console.error("Error in 'وصف' command:", error);
            await reply(`*❌ لازم يـكـون الـبـوت مـشـࢪف يـا عـبـيـط*`);
        }
    }
};