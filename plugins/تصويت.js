export default {
    name: "تصويت",
    aliases: ["poll", "استفتاء"],
    description: "إنشاء تصويت واتساب رسمي",
    category: "group",
    admin: false,
    group: true,

    async run({ bot, message, args, isGroup, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        if (!args[0]) {
            const helpMsg = `*📊 طـريـقـة إنـشـاء تـصـويـت واتـسـاب*

*┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄*

*.تصويت* *السؤال* *|* *الخيار1* *|* *الخيار2* *|* *الخيار3*

*┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄*

*📝 أمـثـلـة:* 

*┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄*

*.تصويت* *أفضل لغة برمجة؟* *|* *JavaScript* *|* *Python* *|* *PHP*

*.تصويت* *أي الألوان تفضل؟* *|* *أحمر* *|* *أزرق* *|* *أخضر* *|* *أسود*

*┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄*

*⚠️ مـلاحـظـات:*
*• الـخـيـارات مـسـمـوح بـها مـن 2 إلـى 5*
*• لازم تـحـط | بـيـن الـسـؤال والـخـيـارات*`;

            return reply(helpMsg);
        }

        await react("📊");

        const fullText = args.join(" ");
        const parts = fullText.split("|").map(p => p.trim());
        
        const question = parts[0];
        const options = parts.slice(1);

        if (!question) {
            return reply("*❌ يـجـب كـتـابـة سـؤال لـلـتـصـويـت*");
        }

        if (options.length < 2 || options.length > 5) {
            return reply("*❌ يـجـب أن يـكـون عـدد الـخـيـارات مـن 2 إلـى 5*");
        }

        try {
            // إزالة أي نجوم موجودة أولاً
            const cleanQuestion = question.replace(/\*/g, '');
            const cleanOptions = options.map(opt => opt.replace(/\*/g, ''));
            
            // إضافة نجمتين فقط من غير ـ
            const formattedQuestion = `*${cleanQuestion}*`;
            const formattedOptions = cleanOptions.map(opt => `*${opt}*`);

            await bot.sock.sendMessage(jid, {
                poll: {
                    name: formattedQuestion,
                    values: formattedOptions,
                    selectableCount: 1
                }
            });
        } catch (error) {
            console.error("❌ خطأ في إنشاء التصويت:", error);
            await reply("*❌ فـشـل إنـشـاء الـتـصـويـت*");
        }
    }
};