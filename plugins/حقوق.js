import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import webpmux from "node-webpmux";

export default {
    name: "حقوق",
    aliases: ["wm", "take"],
    description: "تعديل حقوق الملصق (ثابت/متحرك) بخط مميز وتوثيق رسمي",
    category: "sticker",

    async run({ bot, message, text, reply }) {
        const jid = message.key.remoteJid;
        
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quoted) return reply(`*ࢪد عـلـى مـلـصـق عـشـان احـط حـقـوقـك عـلـيـه🍷..*\n*(.حقوق)*`);

        await bot.sendMessage(jid, { react: { text: "🍷", key: message.key } });

        try {
            let [packname, author] = text ? text.split('|') : [];
            packname = packname?.trim() || '';
            author = author?.trim() || '';

            const stream = await downloadContentFromMessage(quoted, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const img = new webpmux.Image();
            await img.load(buffer);

            let exifData = {};

            // 🔥 حالة 1: لو مفيش نص بعد الأمر → حقوق البوت الأسطورية (Publisher فقط)
            if (!text) {
                exifData = {
                    "sticker-pack-id": `solo-verify-${Date.now()}`,
                    "sticker-pack-publisher": `╔══════════════════╗
║ 𓆩🍷𓆪『𝑺𝑶𝑳𝑶★𝑩𝑶𝑻』𓆩🍷𓆪  ║
╠══════════════════╣
║ 𝑩𝑶𝑹𝑵 𝑭𝑹𝑶𝑴 𝑪𝑶𝑫𝑬 ║
║ 𝑩𝑼𝑰𝑳𝑻 𝑭𝑶𝑹 𝑳𝑬𝑮𝑬𝑵𝑫𝑺 ║
╠══════════════════╣
   ⚝ 𝑼𝑵𝑲𝑵𝑶𝑾𝑵 ⚝   ║
╚══════════════════╝`,
                    "emojis": []
                };
            }
            // 🔥 حالة 2: لو كتب .حقوق كلمة (بدون |) → تكون Pack name
            else if (text && !text.includes('|')) {
                exifData = {
                    "sticker-pack-id": `solo-verify-${Date.now()}`,
                    "sticker-pack-name": packname,
                    "emojis": []
                };
            }
            // 🔥 حالة 3: لو كتب .حقوق كلمة | كلمة → تكون Pack name و Publisher
            else if (text && text.includes('|')) {
                exifData = {
                    "sticker-pack-id": `solo-verify-${Date.now()}`,
                    "sticker-pack-name": packname,
                    "sticker-pack-publisher": author,
                    "emojis": []
                };
            }

            const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(exifData), "utf-8");
            const exifFinal = Buffer.concat([exifHeader, jsonBuffer]);
            exifFinal.writeUIntLE(jsonBuffer.length, 14, 4);
            
            img.exif = exifFinal;
            const finalSticker = await img.save(null);

            const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN: 𝐒𝐎𝐋𝐎 𝐁𝐎𝐓\nORG: SOLO Team\nTEL;type=CELL;waid=6283833432570:+62 838-3343-2570\nEND:VCARD";
            const fakeQuoted = {
                key: { remoteJid: jid, fromMe: false, participant: "0@s.whatsapp.net", id: "SOLO_WM_VERIFIED" },
                message: { contactMessage: { displayName: "𝐒𝐎𝐋𝐎 𝐁𝐎𝐓", vcard } }
            };

            await bot.sendMessage(jid, {
                sticker: finalSticker,
                contextInfo: {
                    externalAdReply: {
                        title: "𝐒𝐎𝐋𝐎 𝐁𝐎𝐓",
                        body: "𝑺𝒖𝒏𝒈 𝑷𝒐𝒘𝒆𝒓𝒆𝒅",
                        mediaType: 1,
                        thumbnailUrl: "https://telegra.ph/file/48d30d1e39b977717f917.jpg",
                        sourceUrl: "https://whatsapp.com/biz/",
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