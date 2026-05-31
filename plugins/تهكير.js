export default {
    name: "تهكير",
    aliases: ["اختراق", "hack", "اخترق"],
    description: "أمر مقلب - اختراق وهمي للترفيه",
    category: "fun",
    developer: false,
    group: false,
    private: false,

    async run({ bot, message, reply, react, userJid }) {
        const jid = message.key.remoteJid;
        
        // رد فعل أولي
        await react("👾");
        
        // الرسالة الأولى - بدء الاختراق
        const msg1 = await bot.sendMessage(jid, {
            text: `*╭─━━━━━━━━━━━━━━━─╮*
      *🔓 𝐇𝐀𝐂𝐊𝐈𝐍𝐆 𝐓𝐎𝐎𝐋 𝐯3.7 🔓*
*╰─━━━━━━━━━━━━━━━─╯*

*📡 جـارٍ اخـتـراق الـهـدف...*

*[░░░░░░░░░░] 0%*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
> ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`,
            mentions: [userJid]
        });

        // دالة الانتظار
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // مراحل التحميل (كل مرحلة تزيد 20%)
        const stages = [
            { percent: 20, text: "🔓 *جاري كسر جدار الحماية...*" },
            { percent: 40, text: "🛜 *جاري اختراق قاعدة البيانات...*" },
            { percent: 60, text: "📡 *جاري تتبع الموقع الجغرافي...*" },
            { percent: 80, text: "💾 *جاري تنزيل الملفات والصور...*" },
            { percent: 100, text: "✅ *اكتمل الاختراق بنجاح!*" }
        ];

        let currentPercent = 0;

        for (const stage of stages) {
            await wait(1500); // انتظار 1.5 ثانية بين كل مرحلة
            
            // تحديث النسبة المئوية
            currentPercent = stage.percent;
            const barLength = 10;
            const filled = Math.floor(currentPercent / 10);
            const empty = barLength - filled;
            const bar = "█".repeat(filled) + "░".repeat(empty);
            
            const updateText = `*╭─━━━━━━━━━━━━━━─╮*
      *🔓 𝐇𝐀𝐂𝐊𝐈𝐍𝐆 𝐓𝐎𝐎𝐋 𝐯3.7 🔓*
*╰─━━━━━━━━━━━━━━─╯*

*📡 جـارٍ اخـتـراق الـهـدف...*

*[${bar}] ${currentPercent}%*

*${stage.text}*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
> ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            await bot.sendMessage(jid, {
                text: updateText,
                edit: msg1.key,
                mentions: [userJid]
            });
        }

        // انتظار ثانية قبل النتيجة النهائية
        await wait(1500);

        // النتيجة النهائية (المقلب)
        const finalMsg = `*╭─━━━━━━━━━━━━━━━━━━━─╮*
      *🔓 𝐇𝐀𝐂𝐊 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 🔓*
*╰─━━━━━━━━━━━━━━━━━━━─╯*

*<██████████> 100%*

✅ *الاختراق اكتمل!*

*📊 الـمـلـخـص:*
├─ 📸 الـصـور: 2,847
├─ 💬 الـرسـائـل: 12,394
├─ 📞 الـمـكـالـمـات: 567
├─ 🔑 كـلـمـات الـمـرور: 23
├─ 💳 الـبـطـاقـات: 3
└─ 📍 الـمـوقـع: تـم تـحـديـده

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

⚠️ *مـجـرد مـقـلـب!* 😂

_هذا كان أمر ترفيهي من سولو بوت_
_لم يحدث أي اختراق حقيقي_

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
> ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

        await bot.sendMessage(jid, {
            text: finalMsg,
            edit: msg1.key,
            mentions: [userJid]
        });

        await react("😂");
    }
};