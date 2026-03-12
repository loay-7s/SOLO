// ملف: plugins/ارسل_الفيديو.js

import fs from 'fs';
import path from 'path';

export default {
    name: "تسجيل_الدخول",
    description: "يرسل فيديو محدد كرسالة دائرية (PTVM).",
    category: "fun", // يمكن وضعه في أي فئة مناسبة
    // لا نحتاج صلاحيات مطور إذا كان الملف آمنًا ومعروفًا
    
    async run({ reply, message, sock }) {
        // 1. ✨ تحديد مسار الملف بشكل ثابت داخل الكود ✨
        const filePath = 'media/video.mp4';

        // 2. إنشاء المسار الكامل للملف
        const absolutePath = path.join(process.cwd(), filePath);

        // 3. التحقق من وجود الملف (فحص لمرة واحدة للتأكد)
        if (!fs.existsSync(absolutePath)) {
            // رسالة خطأ للمطور في الكونسول
            console.error(`[ارسل_الفيديو] خطأ: الملف المحدد ${filePath} غير موجود!`);
            // رسالة للمستخدم
            return reply("❌ عذرًا، الملف المطلوب غير موجود حاليًا.");
        }

        try {
            // 4. قراءة الملف من القرص
            const fileBuffer = fs.readFileSync(absolutePath);

            // 5. بناء كائن الرسالة مع خاصية ptv
            const messageOptions = {
                video: fileBuffer,
                mimetype: 'video/mp4',
                ptv: true, // لإرساله كفيديو دائري
            };

            // 6. إرسال الفيديو
            await sock.sendMessage(message.key.remoteJid, messageOptions);

        } catch (error)
        {
            console.error("Error sending the specific PTV message:", error);
            await reply(`❌ حدث خطأ أثناء إرسال الفيديو.`);
        }
    }
};