import fs from "fs";
import path from "path";

export default {
    name: "باتش",
    description: "يعرض محتوى ملفات الأوامر (plugins) أو البيانات (data) أو ملفات النظام (handler).",
    category: "أدوات",
    usage: ".باتش [رقم الملف]",
    developer: true,
    
    async run({ reply, args }) {
        try {
            const rootDir = process.cwd(); // المجلد الرئيسي للمشروع
            const pluginsDir = path.join(rootDir, 'plugins');
            const dataDir = path.join(rootDir, 'data');
            
            let allFiles = [];

            // 1. قراءة ملفات الأوامر (plugins)
            if (fs.existsSync(pluginsDir)) {
                const pluginFiles = fs.readdirSync(pluginsDir)
                    .filter(f => f.endsWith(".js"))
                    .map(file => ({ name: file, type: "أمر", path: path.join(pluginsDir, file) }));
                allFiles.push(...pluginFiles);
            }

            // 2. قراءة ملفات البيانات (data)
            if (fs.existsSync(dataDir)) {
                const dataFiles = fs.readdirSync(dataDir)
                    .filter(f => f.endsWith(".json")) 
                    .map(file => ({ name: file, type: "بيانات", path: path.join(dataDir, file) }));
                allFiles.push(...dataFiles);
            }

            // 3. البحث عن ملفات النظام/الهاندلر في المجلد الرئيسي (الإضافة الجديدة)
            const systemFiles = fs.readdirSync(rootDir)
                // قائمة بالأسماء المحتملة لملف الهاندلر
                .filter(f => ['handler.js', 'index.js', 'main.js', 'message.js'].includes(f))
                .map(file => ({ name: file, type: "نظام", path: path.join(rootDir, file) }));
            allFiles.push(...systemFiles);


            if (allFiles.length === 0) {
                return reply("❌ لا توجد ملفات أوامر أو بيانات أو ملفات نظام لعرضها.");
            }

            // 4. إذا لم يكن هناك رقم، اعرض القائمة المدمجة
            if (!args[0]) {
                let list = "📦 *قائمة الملفات المتاحة:*\n\n";

                allFiles.forEach((file, index) => {
                    let typeLabel;
                    if (file.type === "أمر") typeLabel = "🔌";
                    else if (file.type === "بيانات") typeLabel = "💾";
                    else if (file.type === "نظام") typeLabel = "⚙️"; // أيقونة جديدة لملفات النظام
                    
                    list += `*${index + 1}.* ${file.name}  ${typeLabel} *[${file.type}]*\n`;
                });

                list += `\n✳️ لعرض محتوى ملف، اكتب:\n.باتش [رقم الملف]\n*مثال:* .باتش 3`;

                return reply(list);
            }

            // 5. إذا كان هناك رقم، ابحث في القائمة المدمجة
            const index = parseInt(args[0]) - 1;

            if (isNaN(index) || index < 0 || index >= allFiles.length) {
                return reply("❌ رقم الملف غير صحيح. يرجى الاختيار من القائمة.");
            }

            const selectedFile = allFiles[index];
            const content = fs.readFileSync(selectedFile.path, "utf8");

            const lang = selectedFile.name.endsWith('.js') ? 'js' : 'json';

            return reply(
                `📄 *ملف ${selectedFile.type}:* ${selectedFile.name}\n\n` +
                "```" + lang + "\n" + content + "\n```"
            );

        } catch (err) {
            reply("❌ حدث خطأ أثناء تنفيذ الأمر: " + err.message);
        }
    }
};