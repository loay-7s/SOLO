import axios from 'axios';

export default {
    name: "تخيل",
    aliases: ["imagine", "ارسم", "رسم", "aiimage"],
    description: "توليد صور بالذكاء الاصطناعي من وصفك",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ message, sock, reply, react, args }) {
        const text = args.join(" ");
        
        if (!text) {
            await react("🎨");
            return reply(`*╭─━━━━━━━━━━━━━━━━─╮*
*│ 🎨 تـولـيـد الـصـور بـالـذكاء الاصطناعي*
*╰─━━━━━━━━━━━━━━━━─╯*

*📝 اكتب وصف دقيق للصورة اللي تريدها*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
📌 *.تخيل غروب شمس على البحر*
📌 *.تخيل فتاة جميلة في حديقة*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        await react("⏳");
        
        try {
            // API مضمون لتوليد الصور
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true`;
            
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const imageBuffer = Buffer.from(response.data);
            
            if (response.headers['content-type']?.includes('image')) {
                await react("✅");
                
                const finalMsg = `*╭─━━━━━━━━━━━━━━━━─╮*
*│ 🎨 صـورة مـولـدة بـالـذكاء الاصطناعي*
*╰─━━━━━━━━━━━━━━━━─╯*

📝 *الوصف:* ${text.length > 50 ? text.substring(0, 50) + '...' : text}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;
                
                await sock.sendMessage(message.key.remoteJid, {
                    image: imageBuffer,
                    caption: finalMsg
                }, { quoted: message });
            } else {
                throw new Error('Invalid response');
            }
            
        } catch (error) {
            console.error("Imagine Error:", error.message);
            await react("❌");
            await reply(`*╭─━━━━━━━━━━━━━━━━─╮*
*│ ❌ فـشـل تـولـيـد الـصـورة ❌*
*╰─━━━━━━━━━━━━━━━━─╯*

⚠️ *الخادم مشغول حالياً*
📝 *حاول مرة أخرى بعد قليل*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
    }
};