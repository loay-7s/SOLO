export default {
    name: "اسم",
    description: "تغيير اسم المجموعة عبر النص أو الرد.",
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
            return reply("*｢ ❌ ｣ هـذا الأمـر مـخـصـص لـلـمـشـࢪفـيـن فـقـط.*");
        }

        // --- الجزء الثاني: منطق استخراج الاسم (نص أو ريبلاي) ---
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let newSubject = text;

        // سحب النص من الرسالة المقتبسة إذا لم يوجد نص مباشر
        if (!text && quotedMessage) {
            newSubject = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;
        }

        if (!newSubject) {
            return reply("*｢ ⚠️ ｣ يـرجـى كـتـابـة الـاسم بـعـد الأمـر أو الـرد عـلى رسـالـة بـالامـࢪ.* \n*مـثـال: .اسم 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻🍷*");
        }

        if (newSubject.length > 100) {
            return reply("*｢ ❌ ｣ الـاسم طـويـل جـداً، قـانـون واتـسـاب يـسـمـح بـ 100 حـرف فـقـط.*");
        }

        try {
            // --- الجزء الثالث: تنفيذ التغيير والتعميد ---
            await sock.groupUpdateSubject(jid, newSubject);
            
            await sock.sendMessage(jid, { react: { text: "📝", key: message.key } });
            
            const successMsg = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*✅┇ تـم تـغـيـيـر اسـم الـمـجـمـوعـة ┇✅*
*⎔┄┄─── ⊱╎⌯ 👑 ⌯╎⊰ ───┄┄⎔*

*🔥 الـاسم الـجـديـد : ⦓ ${newSubject} ⦔*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            await reply(successMsg);

        } catch (error) {
            console.error("Error in 'اسم' command:", error);
            await reply(`*｢ ❌ ｣ لازم يـكـون الـبـوت مـشـࢪف يـا عـبـيـط*`);
        }
    }
};