
export default {
    name: "سحب",
    description: "يسحب جميع المشرفين من المجموعة ما عدا المطورين والبوت نفسه.",
    category: "إدارة",
    usage: ".سحب",
    group: true,
    developer: true,

    async run({ sock, message, reply, handler }) {
        try {
            const groupJid = message.key.remoteJid;
            const metadata = await sock.groupMetadata(groupJid);
            const participants = metadata.participants || [];

            // --- الحل النهائي باستخدام phoneNumber ---

            // 1. الحصول على رقم هاتف البوت النظيف (JID)
            const botPhoneNumberJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // 2. الحصول على رقم هاتف منشئ المجموعة (Owner's PN)
            const ownerPhoneNumberJid = metadata.ownerPn;

            // --- فلترة المشرفين بناءً على رقم الهاتف الفعلي ---
            const adminsToDemote = participants
                .filter(p => {
                    // خاصية phoneNumber هي رقم الهاتف الحقيقي للمشارك
                    const participantPhoneNumber = p.phoneNumber;

                    return (
                        p.admin && // هو مشرف
                        !handler.isDeveloper(participantPhoneNumber) && // تحقق من المطور باستخدام رقم الهاتف
                        participantPhoneNumber !== ownerPhoneNumberJid && // ليس منشئ المجموعة
                        participantPhoneNumber !== botPhoneNumberJid // **ليس البوت نفسه**
                    );
                })
                .map(p => p.id); // نستخدم .id للسحب لأن هذا هو المعرف المطلوب في groupParticipantsUpdate

            if (!adminsToDemote.length) {
                return reply("✅ لا يوجد مشرفين يمكن سحبهم (باستثناء المطورين، منشئ المجموعة، والبوت).");
            }

            await sock.groupParticipantsUpdate(groupJid, adminsToDemote, "demote");
            
            reply(`⬇️ تم بنجاح سحب الصلاحيات من ${adminsToDemote.length} مشرفًا.`);

        } catch (err) {
            console.error("خطأ في أمر سحب المشرفين:", err);
            reply("❌ حدث خطأ أثناء تنفيذ الأمر. تأكد من أن البوت مشرف في المجموعة.");
        }
    }
};