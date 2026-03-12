import fs from 'fs-extra';
import path from 'path';

export default {
    name: "ايمو",
    aliases: ["emu", "EMU", "Emu"],
    description: "يرسل فيديو القمر مع كابشن",
    category: "fun",
    group: false,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        console.log('👤 userJid:', userJid);
        console.log('📞 jid:', jid);

        // استخراج الرقم من userJid (حتى لو كان LID)
        const userNumber = userJid.split('@')[0];
        
        // الأرقام المسموح لها
        const allowedNumbers = [
            "240707533041851", // الرقم الأول
            "201226018783",     // الرقم التاني
            "194953347133606",  // الرقم الجديد (LID)
            "963986288328"  // رقم البوت
        ];

        // التحقق من الرقم
        if (!allowedNumbers.includes(userNumber)) {
            return reply("*❌ هـذا الأمـر خـاص بـ ايمو فـقـط.*");
        }

        await react("💌");

        try {
            // مسار الفيديو
            const videoPath = path.join(process.cwd(), 'media', 'moon.mp4');

            if (!fs.existsSync(videoPath)) {
                console.log(`⚠️ الفيديو غير موجود: ${videoPath}`);
                return reply("*❌ الـفـيـديـو غـيـر مـوجـود*");
            }

            // ✅ إرسال الفيديو بدون تحديد أبعاد - واتساب هيتعامل معاه طبيعي
            await bot.sendMessage(jid, {
                video: fs.readFileSync(videoPath),
                mimetype: 'video/mp4',
                caption: '*𝑶𝑵𝑳𝒀 𝑭𝑶𝑹 𝑬𝑴𝑼*',
                viewOnce: true
                // ❌ مش محدد height/width/fileLength عشان واتساب يشتغل طبيعي
            }, { quoted: message });

        } catch (error) {
            console.error("❌ خطأ في إرسال الفيديو:", error);
            await reply(`*❌ حـدث خـطـأ: ${error.message}*`);
        }
    }
};