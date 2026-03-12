import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    name: "كشف",
    description: "كشف محتوى رسائل المشاهدة مرة واحدة",
    async run({ sock, message, reply }) {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return reply("*⚠️ يـࢪجـى الـࢪد عـلـى ࢪسـالة عـࢪض مـࢪة واحـدة لـ كـشـفـهـا.*");
        }

        // 🏷️ دالة استخراج الوسائط سواء داخل ViewOnce أو عادي
        function extractMedia(msg) {
            if (!msg) return null;

            // الحالة 1: الشكل التقليدي
            if (msg.viewOnceMessage || msg.viewOnceMessageV2 || msg.viewOnceMessageV2Extension) {
                const container =
                    msg.viewOnceMessage?.message ||
                    msg.viewOnceMessageV2?.message ||
                    msg.viewOnceMessageV2Extension?.message;

                if (!container) return null;

                return extractMedia(container); // نعيد الفحص داخلها
            }

            // الحالة 2: شكل واتساب الجديد (زي اللي عندك)
            if (msg.imageMessage?.viewOnce || msg.videoMessage?.viewOnce || msg.audioMessage?.viewOnce) {
                return msg; 
            }

            // لو مش ViewOnce
            return null;
        }

        const mediaMsg = extractMedia(quoted);

        if (!mediaMsg) {
            return reply("*❌ هـذه لـيـسـت رسـالـة 'عـࢪض مـࢪة واحـدة'.*");
        }

        // 📌 تحديد نوع الوسائط
        const type = mediaMsg.imageMessage ? "image"
                   : mediaMsg.videoMessage ? "video"
                   : mediaMsg.audioMessage ? "audio"
                   : null;

        if (!type) return reply("*❌ لم أتعرف على نوع الوسائط.*");

        try {
            // تحميل الوسائط
            const stream = await downloadContentFromMessage(
                mediaMsg.imageMessage || mediaMsg.videoMessage || mediaMsg.audioMessage,
                type
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            // إرسالها حسب النوع
            if (type === "image") {
                return sock.sendMessage(message.key.remoteJid, { image: buffer });
            }
            if (type === "video") {
                return sock.sendMessage(message.key.remoteJid, { video: buffer });
            }
            if (type === "audio") {
                return sock.sendMessage(message.key.remoteJid, { audio: buffer, mimetype: "audio/mpeg" });
            }

        } catch (err) {
            console.error(err);
            reply("❌ حدث خطأ أثناء كشف الوسائط: " + err.message);
        }
    }
};