// ملف: plugins/شات.js (لفتح وقفل دردشة المجموعة)

export default {
    name: "شات",
    aliases: ["chat"], // يمكن استخدام .شات أو .جروب
    description: "يفتح أو يقفل الدردشة في المجموعة. الاستخدام: .شات فتح | .شات قفل",
    category: "admin",

    // الصلاحيات الأساسية
    group: true,     // يعمل في المجموعات فقط
    botAdmin: true,  // يتطلب أن يكون البوت مشرفًا

    async run({ sock, message, reply, args, isDeveloper }) {
        const subCommand = args[0]?.toLowerCase();

        // --- التحقق من الصلاحيات (مشرف أو مطور) ---
        const metadata = await sock.groupMetadata(message.key.remoteJid);
        const sender = metadata.participants.find(p => p.id === message.key.participant);
        const isAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';

        if (!isAdmin && !isDeveloper) {
            return reply("*❌ هذا الأمر للمشرفين فقط.*");
        }

        // --- منطق الأوامر الفرعية ---
        switch (subCommand) {
            case "قفل":
            case "close": {
                try {
                    // استدعاء دالة Baileys لقفل المجموعة
                    await sock.groupSettingUpdate(message.key.remoteJid, 'announcement');
                    await reply("*🔒 تم قفل الدردشة, الآن يمكن للمشرفين فقط إرسال الرسائل.*");
                } catch (error) {
                    console.error("Error locking chat:", error);
                    await reply(`❌ حدث خطأ أثناء قفل الدردشة: ${error.message}`);
                }
                break;
            }

            case "فتح":
            case "open": {
                try {
                    // استدعاء دالة Baileys لفتح المجموعة
                    await sock.groupSettingUpdate(message.key.remoteJid, 'not_announcement');
                    await reply("*🔓 تم فتح الدردشة, الآن يمكن لجميع الأعضاء إرسال الرسائل.*");
                } catch (error) {
                    console.error("Error unlocking chat:", error);
                    await reply(`*❌ حدث خطأ أثناء فتح الدردشة:* ${error.message}`);
                }
                break;
            }

            default: {
                // رسالة مساعدة إذا لم يتم تحديد أمر فرعي صحيح
                const helpMessage = `
*❌استخدام غير صحيح.*

*الأوامر المتاحة:*

- *.شات قفل* (لقفل الدردشة)
- *.شات فتح* (لفتح الدردشة)
                `;
                await reply(helpMessage.trim());
                break;
            }
        }
    }
};