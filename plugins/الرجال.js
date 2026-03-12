import fs from 'fs-extra';
import path from 'path';

export default {
    name: "الرجال",
    aliases: ["men", "رجال"],
    description: "يرسل فيديو الرجال",
    category: "fun",
    group: false,

    async run({ bot, message, args, isGroup, reply, react }) {
        const jid = message.key.remoteJid;

        await react("❕");

        try {
            // مسار الفيديو
            const videoPath = path.join(process.cwd(), 'media', 'men.mp4');

            // التحقق من وجود الفيديو
            if (!fs.existsSync(videoPath)) {
                console.log(`⚠️ الفيديو غير موجود: ${videoPath}`);
                return reply("*❌ الـفـيـديـو غـيـر مـوجـود*");
            }

            // إرسال الفيديو فقط (بدون نص)
            await bot.sendMessage(jid, {
                video: fs.readFileSync(videoPath),
                mimetype: 'video/mp4',
                caption: '*𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻*' // كابتشن فاضي عشان ما يبعتش نص
            }, { quoted: message });

        } catch (error) {
            console.error("❌ خطأ في إرسال الفيديو:", error);
            await reply(`*❌ حـدث خـطـأ: ${error.message}*`);
        }
    }
};