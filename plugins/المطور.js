import fs from 'fs';

export default {
    name: "المطور",
    description: "عرض جهات اتصال فريق SOLO",
    category: "general",
    aliases: ["owner", "solodev"],

    async run({ bot, message, react }) { // <-- 1. أضفنا `react` هنا
        const jid = message.key.remoteJid;

        // --- ✨ التعديل هنا: إضافة التفاعل على الرسالة الأصلية ---
        await react('👤'); // <-- 2. هذا هو السطر الجديد

        // --- الخطوة 1: التأكد من وجود ملف الصورة المتحركة ---
        const gifPath = './media/solo_dev.mp4';
        if (!fs.existsSync(gifPath)) {
            console.error(`[المطور] خطأ: ملف GIF غير موجود في المسار: ${gifPath}`);
            return "عذرًا، حدث خطأ أثناء محاولة عرض معلومات المطور.";
        }

        // --- الخطوة 2: إرسال الصورة المتحركة (GIF) مع تعليق ---
        const gifBuffer = fs.readFileSync(gifPath);
        await bot.sendMessage(jid, {
            video: gifBuffer,
            mimetype: 'video/mp4',
            gifPlayback: true,
            caption: "*SOLO BOT Development Team 👇*",
        }, { quoted: message });

        // --- الخطوة 3: تعريف جهات الاتصال ---
        const developers = [
            {
                displayName: "SUNG - Developer",
                vcard: `BEGIN:VCARD
VERSION:3.0
FN:SUNG - Developer
TEL;type=CELL;waid=201226018783:+20 122 601 8783
ORG:SOLO BOT Development Team
TITLE:Lead Developer
NOTE:تواصل معي لأي استفسار أو مساعدة.
URL:https://wa.me/201005199558
END:VCARD`
            }
        ];

        // --- الخطوة 4: إرسال جهات الاتصال ---
        await bot.sendMessage(jid, {
            contacts: {
                displayName: `فريق مطوري SOLO (${developers.length} )`,
                contacts: developers
            }
        }, { quoted: message });
    }
};
