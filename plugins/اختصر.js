import axios from 'axios';

export default {
    name: "اختصر",
    aliases: ["اختصار_الرابط", "short", "shorten", "تقصير"],
    description: "اختصار الروابط الطويلة إلى روابط قصيرة",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ bot, message, args, reply, react }) {
        const jid = message.key.remoteJid;
        
        // استخراج الرابط من الأمر أو من الرد على رسالة
        let link = args.join(" ");
        
        // لو رد على رسالة حد
        if (!link && message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
            link = quotedMsg.conversation || 
                   quotedMsg.extendedTextMessage?.text;
        }

        if (!link) {
            await react("🔗");
            return reply(`*╭─━━━━━━━━━━━━━━━─╮*
*│ 🔗 اخـتـصـار الـروابـط 🔗*
*╰─━━━━━━━━━━━━━━━─╯*

*📝 طريقة الاستخدام:*
*│ .اختصر الرابط*
*│ أو رد على رسالة فيها رابط واكتب .اختصر*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*💡 مثال: .اختصر https://www.youtube.com/watch?v=abc123*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 🥀*~`);
        }

        // التحقق من صحة الرابط
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            link = 'https://' + link;
        }

        await react("⏳");

        try {
            // API أول: TinyURL (مضمون وسريع)
            const tinyUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`;
            const response = await axios.get(tinyUrl);
            const shortUrl = response.data;

            if (shortUrl && shortUrl.startsWith('http')) {
                await bot.sendMessage(jid, {
                    text: `*╭─━━━━━━━━━━━━━━━─╮*
*│ 🔗 تـم اخـتـصـار الـرابـط 🔗*
*╰─━━━━━━━━━━━━━━━─╯*

*📎 الـرابـط الأصـلـي:*
\`${link.length > 50 ? link.substring(0, 50) + '...' : link}\`

*✂️ الـرابـط الـمـخـتـصـر:*
\`${shortUrl}\`

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
> *اضغط على الرابط للنسخ*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 🥀*~`
                }, { quoted: message });
                
                await react("✅");
                return;
            }
            
            throw new Error('TinyURL failed');

        } catch (error) {
            console.error("Shortener Error:", error);
            
            // محاولة API ثاني: is.gd
            try {
                const isgdUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(link)}`;
                const response2 = await axios.get(isgdUrl);
                const shortUrl2 = response2.data;
                
                if (shortUrl2 && shortUrl2.startsWith('https://is.gd/')) {
                    await bot.sendMessage(jid, {
                        text: `*╭─━━━━━━━━━━━━━━━─╮*
*│ 🔗 تـم اخـتـصـار الـرابـط 🔗*
*╰─━━━━━━━━━━━━━━━─╯*

*📎 الـرابـط الأصـلـي:*
\`${link.length > 50 ? link.substring(0, 50) + '...' : link}\`

*✂️ الـرابـط الـمـخـتـصـر:*
\`${shortUrl2}\`

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 🥀*~`
                    }, { quoted: message });
                    
                    await react("✅");
                    return;
                }
                
                throw new Error('is.gd failed');
                
            } catch (error2) {
                console.error("Second API failed:", error2);
                await react("❌");
                await reply(`❌ *فشل اختصار الرابط.*
                
*تأكد أن الرابط صحيح، ثم حاول مرة أخرى.*

📝 مثال: .اختصر https://www.google.com`);
            }
        }
    }
};