import fs from "fs";
import path from "path";

export default {
    name: "تعديل",
    developer: true,
    async run({ message, reply, args }) {
        try {
            const cmdName = args[0];
            if (!cmdName) return reply("❌ حدد اسم الأمر الذي تريد تعديله.");

            // خذ المحتوى من الرد على رسالة
            const content = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
            if (!content) return reply("❌ رُد على رسالة ليتم تعديل الأمر بها.");

            // مسار الملف في plugins
            const filePath = path.join("./plugins", `${cmdName}.js`);
            if (!fs.existsSync(filePath)) return reply("❌ هذا الأمر غير موجود.");

            // استبدل محتوى الملف بالكود من الرد
            fs.writeFileSync(filePath, content.trim());
            reply(`✏️ تم تعديل الأمر: .${cmdName}`);
        } catch (err) {
            reply("❌ خطأ: " + err.message);
        }
    }
};