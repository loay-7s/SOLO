// ملف: plugins/تصفيه.js (إصدار فوري وصامت)

export default {
    name: "تصفية",
    description: "يطرد جميع أعضاء المجموعة فورًا وبصمت.",
    category: "owner", // فئة خاصة بالمطور
    
    // --- الصلاحيات المطلوبة ---
    group: true,      // يجب أن يكون في مجموعة
    developer: true,  // يجب أن يكون المستخدم مطورًا
    botAdmin: true,   // يجب أن يكون البوت مشرفًا

    async run({ sock, message, reply, handler }) {
        try {
            const groupJid = message.key.remoteJid;
            const metadata = await sock.groupMetadata(groupJid);
            const participants = metadata.participants;
            const selfJid = sock.user.id;

            // --- فلترة قائمة الضحايا ---
            const victims = participants
                .map(p => p.id)
                .filter(id => 
                    !handler.isDeveloper(id) && // ليس مطورًا
                    id !== selfJid              // ليس البوت نفسه
                );

            if (victims.length === 0) {
                // نرسل ردًا فقط إذا لم يكن هناك أحد لطرده
                return reply("✅ المجموعة نظيفة بالفعل.");
            }

            // --- تنفيذ الطرد على دفعات (بدون أي رسالة قبل البدء) ---
            for (let i = 0; i < victims.length; i += 10) {
                const batch = victims.slice(i, i + 10);
                try {
                    await sock.groupParticipantsUpdate(groupJid, batch, "remove");
                    await handler.wait(3000); // انتظار 3 ثواني بين كل دفعة
                } catch (e) {
                    console.error(`Failed to kick a batch:`, e);
                    // في حالة حدوث خطأ، نرسل رسالة للمطور
                    await reply(`⚠️ حدث خطأ أثناء طرد دفعة. قد لا تكتمل العملية.`);
                }
            }

            // --- إرسال رسالة واحدة فقط في النهاية ---
            await reply(`🎉 اكتملت التصفية. تم طرد *${victims.length}* عضوًا.`);

        } catch (error) {
            console.error("Error in 'تصفيه' command:", error);
            await reply(`❌ حدث خطأ فادح: ${error.message}`);
        }
    }
};