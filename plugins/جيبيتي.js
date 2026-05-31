import axios from 'axios';

export default {
    name: "جيبيتي",
    aliases: ["gpt", "chatgpt", "gpt4"],
    description: "الذكاء الاصطناعي GPT-4 للإجابة على أسئلتك",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ message, sock, reply, react, args }) {
        const text = args.join(" ");
        
        if (!text) {
            await react("🤖");
            return reply(`*╭─━━━━━━━━━━━━━━━━━━─╮*
*│ 🤖 GPT-4 الـذكاء الاصطناعي*
*╰─━━━━━━━━━━━━━━━━━━─╯*

*📝 اسأل أي سؤال واحصل على إجابة فورية*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

📌 *.جيبيتي ما هي عاصمة مصر؟*
📌 *.جيبيتي اشرح لي الذكاء الاصطناعي*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        await react("🎯");
        
        try {
            const apiUrl = `https://all-in-1-ais.officialhectormanuel.workers.dev/?query=${encodeURIComponent(text)}&model=gpt-4.5`;
            
            const response = await axios.get(apiUrl, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            let answer = response.data?.message?.content || response.data?.result || response.data?.response;
            
            if (answer) {
                answer = answer.replace(/```/g, '').replace(/\*\*/g, '');
                
                await react("✅");
                
                const finalMsg = `*╭─━━━━━━━━━━━━━━━━━━─╮*
*│ 🎯 إجـابـة GPT-4 🎯*
*╰─━━━━━━━━━━━━━━━━━━─╯*

${answer.length > 3800 ? answer.substring(0, 3800) + '...' : answer}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;
                
                await reply(finalMsg);
            } else {
                throw new Error('No answer');
            }
            
        } catch (error) {
            console.error("GPT Error:", error.message);
            await react("❌");
            await reply(`*╭─━━━━━━━━━━━━━━━━━━─╮*
*│ ❌ خـطـأ فـي الاتصال ❌*
*╰─━━━━━━━━━━━━━━━━━━━╯*

⚠️ *الخادم مشغول حالياً*
📝 *حاول مرة أخرى بعد قليل*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
    }
};