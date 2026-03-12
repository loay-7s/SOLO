// ملف: plugins/حذف.js

export default {
    name: "حذف",
    aliases: ["del", "delete"],
    description: "حذف رسالة معينة بالرد عليها.",
    category: "admin",
    usage: ".حذف (بالرد على رسالة)",
    
    group: true,     // يعمل في المجموعات فقط
   
    async run({ sock, message, reply, isDeveloper }) {
        // --- التحقق من صلاحيات المستخدم (مشرف أو مطور) ---
        // استخدمنا نفس طريقة أمر الإدمن بالظبط
        const metadata = await sock.groupMetadata(message.key.remoteJid);
        const sender = metadata.participants.find(p => p.id === (message.key.participant || message.participant));
        const isAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';

        if (!isAdmin && !isDeveloper) {
            return reply("*❌ الامـࢪ ده لـلـمـشـࢪفـيـن بـس يـحـبـي.*");
        }

        try {
            // تحديد الرسالة المراد حذفها من الرد (نفس منطق التارجت في أمر الإدمن)
            const quoted = message.message?.extendedTextMessage?.contextInfo;
            
            if (!quoted || !quoted.stanzaId) {
                return reply("*❌ يـعـم هـو اي هـبـد وخـلاص؟ مـا تـࢪد ؏ الـرسـالـة الـلـي انـت عـايـز تـحـذفـهـا*");
            }

            // تنفيذ الحذف باستخدام بيانات الرد
            const key = {
                remoteJid: message.key.remoteJid,
                fromMe: quoted.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net',
                id: quoted.stanzaId,
                participant: quoted.participant
            };

            await sock.sendMessage(message.key.remoteJid, { delete: key });

        } catch (error) {
            console.error("Error in 'حذف' command:", error);
            // التعامل مع خطأ لو البوت مش أدمن بنفس ستايلك
            if (error.message.includes('not-admin') || error.message.includes('forbidden')) {
                await reply("*❌ طـب يـعـنـي اقـنـعـنـي ازاي احـذف و انـا مـش مـشـࢪف يـا عـبـيـط؟*");
            } else {
                await reply(`❌ حدث خطأ: ${error.message}`);
            }
        }
    }
};