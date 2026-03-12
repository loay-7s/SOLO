import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import webpmux from "node-webpmux";

export default {
    name: "حقوق",
    aliases: ["wm", "take"],
    description: "تعديل حقوق الملصق (ثابت/متحرك) بخط مميز وتوثيق رسمي",
    category: "sticker",

    async run({ bot, message, text, reply }) {
        const jid = message.key.remoteJid;
        
        // 1. التحقق من الرد على ملصق
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quoted) return reply(`*ࢪد عـلـى مـلـصـق عـشـان احـط حـقـوقـك عـلـيـه🍷..*
        *(.حقوق 𝒀𝑶𝑼𝑹 𝑼𝑵𝑪𝑳𝑬 | 𝑼𝑵𝑲𝑵𝑶𝑾𝑵)*`);

        // 🔥 التفاعل برمز الكأس
        await bot.sendMessage(jid, { react: { text: "🍷", key: message.key } });

        try {
            // 2. إعداد النصوص بالخط المميز
            let [packname, author] = text ? text.split('|') : [];
            packname = packname?.trim() || '𝒀𝑶𝑼𝑹 𝑼𝑵𝑪𝑳𝑬'; // خط مميز للحزمة
            
            // ✨ التعديل المطلوب: إذا مفيش | يبقى author فاضي
            if (text && !text.includes('|')) {
                author = ''; // بدون ببلشر
            } else {
                author = author?.trim() || '𝑼𝑵𝑲𝑵𝑶𝑾𝑵'; // خط مميز للمؤلف
            }

            // 3. تحميل الملصق (يدعم الثابت والمتحرك)
            const stream = await downloadContentFromMessage(quoted, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. تعديل بيانات EXIF باستخدام webpmux
            const img = new webpmux.Image();
            await img.load(buffer);

            const exifData = {
                "sticker-pack-id": `solo-verify-${Date.now()}`,
                "sticker-pack-name": packname,
                "sticker-pack-publisher": author,
                "emojis": ["🍷", "⚡️"]
            };

            // إذا كان author فاضي، نحذفه من البيانات
            if (!author) {
                delete exifData["sticker-pack-publisher"];
            }

            const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(exifData), "utf-8");
            const exifFinal = Buffer.concat([exifHeader, jsonBuffer]);
            exifFinal.writeUIntLE(jsonBuffer.length, 14, 4);
            
            img.exif = exifFinal;
            const finalSticker = await img.save(null);

            // 🛠️ التوثيق الرسمي (بدون روابط مجموعات)
            const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN: 𝐒𝐎𝐋𝐎 𝐁𝐎𝐓\nORG: SOLO Team\nTEL;type=CELL;waid=6283833432570:+62 838-3343-2570\nEND:VCARD";
            const fakeQuoted = {
                key: { remoteJid: jid, fromMe: false, participant: "0@s.whatsapp.net", id: "SOLO_WM_VERIFIED" },
                message: { contactMessage: { displayName: "𝐒𝐎𝐋𝐎 𝐁𝐎𝐓", vcard } }
            };

            // 🚀 الإرسال مع التوثيق النظيف وشعار واتساب
            await bot.sendMessage(jid, {
                sticker: finalSticker,
                contextInfo: {
                    externalAdReply: {
                        title: "𝐒𝐎𝐋𝐎 𝐁𝐎𝐓", // اسم مميز
                        body: "𝑺𝒖𝒏𝒈 𝑷𝒐𝒘𝒆𝒓𝒆𝒅",
                        mediaType: 1,
                        thumbnailUrl: "https://telegra.ph/file/48d30d1e39b977717f917.jpg",
                        sourceUrl: "https://whatsapp.com/biz/", // رابط رسمي عام
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: fakeQuoted });

        } catch (error) {
            console.error(error);
            reply("❌ حدث خطأ، تأكد من تثبيت node-webpmux.");
        }
    }
};