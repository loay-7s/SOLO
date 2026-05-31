import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

export default {
    name: "صوت",
    aliases: ["قول"],
    description: "تحويل النص إلى صوت (تسجيل صوتي)",
    category: "tools",

    async run({ bot, message, args, reply, react }) {
        const jid = message.key.remoteJid;
        const text = args.join(" ");

        if (!text) return reply("⚠️ *اكتب النص بعد الأمر*");

        await react("🎤");

        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        const mp3File = path.join(tempPath, `tts_${Date.now()}.mp3`);
        const opusFile = path.join(tempPath, `tts_${Date.now()}.opus`);

        try {
            // تحميل الصوت من Google
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&q=${encodeURIComponent(text)}&client=tw-ob`;
            const response = await axios({ method: 'get', url, responseType: 'arraybuffer' });
            await fs.writeFile(mp3File, Buffer.from(response.data));

            // تحويل MP3 إلى OPUS (صيغة التسجيلات الصوتية)
            await execPromise(`ffmpeg -i "${mp3File}" -c:a libopus -b:a 24k "${opusFile}"`);

            // إرسال كتسجيل صوتي
            await bot.sock.sendMessage(jid, {
                audio: { url: opusFile },
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true   // دلوقتي هيشتغل
            }, { quoted: message });

            // مسح الملفات
            await fs.unlink(mp3File).catch(() => {});
            await fs.unlink(opusFile).catch(() => {});

            await react("🎤");

        } catch (error) {
            console.error(error);
            await reply("❌ *فشل توليد الصوت*");
        }
    }
};