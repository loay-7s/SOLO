import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execPromise = promisify(exec);

export default {
    name: "لصورة",
    aliases: ["لصوره"],
    description: "تحويل الملصق الثابت إلى صورة",
    developer: false,

    async run({ message, reply, handler, sock }) {
        try {
            // 1. التحقق من وجود رد على ملصق
            const quoted = message.message?.extendedTextMessage?.contextInfo;
            const stickerMessage = quoted?.quotedMessage?.stickerMessage;

            if (!stickerMessage) {
                return reply("*⚠️ يـرجـى الـرد عـلـى مـلـصـق ثـابـت لـتـحـويـلـه إلـى صـورة!*");
            }

            // التعديل المطلوب: إذا كان الملصق متحركاً يرفض التحويل لصورة
            if (stickerMessage.isAnimated === true) {
                return reply("*⚠️ هـذا الـمـلـصـق مـتـحـرك، اسـتـخـدم أمـر (.لفيديو) بـدلاً مـن .لصورة.*");
            }

            // 2. إرسال رياكت الانتظار
            await sock.sendMessage(message.key.remoteJid, { react: { text: "📥", key: message.key } });

            // 3. تنزيل بيانات الملصق
            const buffer = await handler.downloadMedia({
                message: quoted.quotedMessage
            });

            if (!buffer) return reply("*❌ فـشـل تـنـزيـل الـمـلـصـق!*");

            const fileName = `solo_convert_${Date.now()}`;
            const inputPath = join(tmpdir(), `${fileName}.webp`);
            const outputPath = join(tmpdir(), `${fileName}.png`);

            // 4. حفظ الملف مؤقتاً
            await fs.writeFile(inputPath, buffer);

            // 5. عملية التحويل باستخدام magick
            try {
                await execPromise(`magick "${inputPath}" "${outputPath}"`);
            } catch (e) {
                // محاولة احتياطية بـ ffmpeg
                await execPromise(`ffmpeg -i "${inputPath}" "${outputPath}" -y`);
            }

            // 6. قراءة الصورة الناتجة وإرسالها
            const imageBuffer = await fs.readFile(outputPath);

            await sock.sendMessage(message.key.remoteJid, {
                image: imageBuffer,
                caption: "𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀: 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 🌑 𝑺𝑼𝑵𝑮"
            }, { quoted: message });

            // 7. إرسال رياكت النجاح وتنظيف الملفات
            await sock.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
            
            await fs.unlink(inputPath).catch(() => {});
            await fs.unlink(outputPath).catch(() => {});

        } catch (err) {
            console.error(err);
            reply("*❌ حـدث خـطأ أثـنـاء الـتـحـويـل..*");
        }
    }
};