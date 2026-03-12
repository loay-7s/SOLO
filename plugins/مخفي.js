import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: "مخفي",
    description: "عمل منشن لجميع أعضاء المجموعة برسالة.",
    
    category: "admin",

    // الصلاحيات المطلوبة
    group: true,
    admin: true,

    async run({ sock, message, reply, text, args, isDeveloper }) {
    
        const metadata = await sock.groupMetadata(message.key.remoteJid);
        const sender = metadata.participants.find(p => p.id === message.key.participant);
        const isAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';

        if (!isAdmin && !isDeveloper) {
            return reply("*❌ هذا الأمر للمشرفين فقط.*");
        }
        
        try {
            // 1. الحصول على بيانات المجموعة
            const metadata = await sock.groupMetadata(message.key.remoteJid);
            if (!metadata) {
                return reply("*❌ لا يمكن الحصول على بيانات المجموعة.*");
            }

            // 2. استخراج قائمة المشاركين
            const participants = metadata.participants.map(p => p.id);
            if (!participants || participants.length === 0) {
                return reply("*❌ لا يمكن الحصول على قائمة أعضاء المجموعة.*");
            }

            // 3. التحقق من وجود رد
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (quoted) {
                // ✅ إذا كان الرد على ملصق
                if (quoted.stickerMessage) {
                    const buffer = await downloadMedia(quoted.stickerMessage, 'sticker');
                    await sock.sendMessage(message.key.remoteJid, {
                        sticker: buffer,
                        mentions: participants
                    });
                    return;
                }
                
                // ✅ إذا كان الرد على صورة
                if (quoted.imageMessage) {
                    const buffer = await downloadMedia(quoted.imageMessage, 'image');
                    
                    // ✅ ناخد الكابتشن إذا كان موجود
                    const caption = quoted.imageMessage.caption || "";
                    
                    await sock.sendMessage(message.key.remoteJid, {
                        image: buffer,
                        caption: caption, // ⬅️ هنا الكابتشن
                        mentions: participants
                    });
                    return;
                }
                
                // ✅ إذا كان الرد على فيديو
                if (quoted.videoMessage) {
                    const buffer = await downloadMedia(quoted.videoMessage, 'video');
                    
                    // ✅ ناخد الكابتشن إذا كان موجود
                    const caption = quoted.videoMessage.caption || "";
                    
                    await sock.sendMessage(message.key.remoteJid, {
                        video: buffer,
                        caption: caption, // ⬅️ هنا الكابتشن
                        mentions: participants
                    });
                    return;
                }
                
                // ✅ إذا كان الرد على صوت
                if (quoted.audioMessage) {
                    const buffer = await downloadMedia(quoted.audioMessage, 'audio');
                    await sock.sendMessage(message.key.remoteJid, {
                        audio: buffer,
                        mimetype: quoted.audioMessage.mimetype || 'audio/mpeg',
                        ptt: false,
                        mentions: participants
                    });
                    return;
                }
            }

            // 4. تحديد النص
            let messageText = "";

            if (text) {
                messageText = text;
            } else if (quoted) {
                messageText = quoted.conversation || 
                              quoted.extendedTextMessage?.text || 
                              "";
            } else {
                return reply("💡 *طريقة الاستخدام:*\n1. اكتب `.مخفي رسالتك هنا`\n2. أو قم بالرد على رسالة/ملصق/صورة واكتب `.مخفي`");
            }
            
            if (!messageText.trim()) {
                messageText = "📢 تنبيه للجميع!";
            }

            // إرسال النص مع المنشن المخفي
            await sock.sendMessage(message.key.remoteJid, {
                text: messageText,
                mentions: participants
            });

        } catch (error) {
            console.error("Error in 'مخفي' command:", error);
            await reply(`❌ *حدث خطأ:*\n${error.message}`);
        }
    }
};

// دالة تحميل الميديا
async function downloadMedia(mediaMessage, type) {
    const stream = await downloadContentFromMessage(mediaMessage, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}