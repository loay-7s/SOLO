import axios from 'axios';

export default {
    name: "جيمناي",
    aliases: ["gemini", "ai"],
    description: "الذكاء الاصطناعي جيميناي للإجابة على أسئلتك",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ message, sock, reply, react, args }) {
        const text = args.join(" ");
        
        if (!text) {
            await react("🤖");
            return reply(`*╭─━━━━━━━━━━━━━━━━━─╮*
*│ 🤖 الـذكاء الاصطناعي جـيـمـيـنـاي*
*╰─━━━━━━━━━━━━━━━━━─╯*

*📝 اسأل أي سؤال واحصل على إجابة فورية*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

📌 *.جيميناي ما هي عاصمة مصر؟*
📌 *.جيميناي اشرح لي الذكاء الاصطناعي*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        await react("🎯");
        
        // 🔥 APIs جيميناي المتعددة (شغالة)
        const apis = [
            {
                url: `https://vapis.my.id/api/gemini?q=${encodeURIComponent(text)}`,
                extractor: (data) => data.message || data.result
            },
            {
                url: `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(text)}`,
                extractor: (data) => data.message || data.answer || data.result
            },
            {
                url: `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(text)}`,
                extractor: (data) => data.data || data.result || data.message
            },
            {
                url: `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(text)}`,
                extractor: (data) => data.message || data.result
            },
            {
                url: `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(text)}`,
                extractor: (data) => data.message || data.result
            },
            {
                url: `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(text)}`,
                extractor: (data) => data.result || data.message
            }
        ];
        
        let answer = null;
        
        for (const api of apis) {
            try {
                const response = await axios.get(api.url, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                answer = api.extractor(response.data);
                
                if (answer && answer !== 'null' && answer !== 'undefined' && answer.length > 5) {
                    console.log(`✅ Working API: ${api.url.split('?')[0]}`);
                    break;
                }
            } catch (e) {
                console.log(`❌ API failed: ${api.url.split('?')[0]}`);
                continue;
            }
        }
        
        if (answer) {
            await react("✅");
            
            if (answer.length > 4000) {
                const parts = answer.match(/.{1,4000}/g);
                for (const part of parts) {
                    await reply(`*🤖 جـيـمـيـنـاي:*\n\n${part}`);
                }
            } else {
                await reply(`*🤖 جـيـمـيـنـاي:*\n\n${answer}`);
            }
        } else {
            await react("❌");
            await reply(`*❌ فـشـل الاتصال بـ جـيـمـيـنـاي*\n⚠️ الخادم مشغول حالياً\n📝 حاول مرة أخرى بعد قليل`);
        }
    }
};