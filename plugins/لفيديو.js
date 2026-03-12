import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execPromise = promisify(exec);

export default {
    name: "لفيديو",
    aliases: ["فيديو", "tovideo", "mp4"],
    description: "تحويل الملصق المتحرك إلى فيديو",
    developer: false,

    async run({ message, reply, handler, sock }) {
        try {
            // 1. التحقق من وجود رد على ملصق متحرك
            const quoted = message.message?.extendedTextMessage?.contextInfo;
            const stickerMessage = quoted?.quotedMessage?.stickerMessage;

            if (!stickerMessage) {
                return reply("*⚠️ يـرجـى الـرد عـلـى مـلـصـق مـتـحـرك لـتـحـويـلـه إلي فـيـديـو.*");
            }

            if (stickerMessage.isAnimated === false) {
                return reply("*⚠️ هـذا الـمـلـصـق ثـابـت، اسـتـخـدم أمـر (.لصورة) بـدلاً مـن .لفيديو.*");
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
            const outputPath = join(tmpdir(), `${fileName}.mp4`);

            // 4. حفظ الملف مؤقتاً
            await fs.writeFile(inputPath, buffer);

            // 5. عملية التحويل باستخدام magick (التي نجحت معك)
            try {
                await execPromise(`magick "${inputPath}" "${outputPath}"`);
            } catch (e) {
                // محاولة احتياطية بـ ffmpeg
                await execPromise(`ffmpeg -i "${inputPath}" -pix_fmt yuv420p "${outputPath}" -y`);
            }

            // 6. قراءة الفيديو الناتج وإرساله
            const videoBuffer = await fs.readFile(outputPath);

            await sock.sendMessage(message.key.remoteJid, {
                video: videoBuffer,
                caption: "𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀: 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 🌑 𝑺𝑼𝑵𝑮",
                mimetype: 'video/mp4'
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