import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
    name: "فيسبوك",
    aliases: ["fb", "facebook"],
    description: "تحميل فيديوهات من فيسبوك",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ message, sock, reply, react, args }) {
        let url = args.join(" ");
        
        if (!url && message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quoted = message.message.extendedTextMessage.contextInfo.quotedMessage;
            url = quoted.conversation || quoted.extendedTextMessage?.text || "";
        }
        
        if (!url) {
            await react("📘");
            return reply(`*╭─━━━━━━━━━━━━━━━━━━━─╮*
*│ 📘 تـحـمـيـل مـن فـيـسـبـوك 📘*
*╰─━━━━━━━━━━━━━━━━━━━─╯*

*📝 أرسل رابط الفيديو من فيسبوك*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
📌 *.فيسبوك https://fb.watch/xxxxx*
📌 رد على الرابط واكتب *.فيسبوك*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
            await react("⚠️");
            return reply(`*❌ رابـط فـيـسـبـوك غـيـر صـالـح*`);
        }
        
        await react("⏳");
        await reply(`*📥 جـاري تـحـمـيـل الـفـيـديـو...*`);
        
        try {
            // حل الرابط المختصر (زي fb.watch)
            let resolvedUrl = url;
            try {
                const headResponse = await axios.head(url, {
                    timeout: 10000,
                    maxRedirects: 5,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (headResponse.request?.res?.responseUrl) {
                    resolvedUrl = headResponse.request.res.responseUrl;
                }
            } catch (e) {}
            
            // 🔥 API هانجتس بالضبط زي الكود اللي بعته
            const apiUrl = `https://api.hanggts.xyz/download/facebook?url=${encodeURIComponent(resolvedUrl)}`;
            
            const response = await axios.get(apiUrl, {
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const data = response.data;
            let videoUrl = null;
            let title = "Facebook Video";
            
            // استخراج الرابط بنفس طريقة الكود الأصلي
            if (data?.result?.media?.video_hd) {
                videoUrl = data.result.media.video_hd;
                title = data.result.info?.title || "Facebook Video";
            } else if (data?.result?.media?.video_sd) {
                videoUrl = data.result.media.video_sd;
                title = data.result.info?.title || "Facebook Video";
            } else if (data?.result?.url) {
                videoUrl = data.result.url;
                title = data.result.title || "Facebook Video";
            } else if (data?.result?.download) {
                videoUrl = data.result.download;
            } else if (data?.result?.video) {
                videoUrl = data.result.video;
            } else if (data?.url) {
                videoUrl = data.url;
            } else if (data?.download) {
                videoUrl = data.download;
            } else if (data?.video) {
                videoUrl = data.video;
            }
            
            if (!videoUrl) {
                throw new Error('No video found');
            }
            
            await react("✅");
            
            const caption = `*📥 تـم الـتـحـمـيـل*\n📝 *العنوان:* ${title}\n*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*\n~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;
            
            await sock.sendMessage(message.key.remoteJid, {
                video: { url: videoUrl },
                caption: caption
            }, { quoted: message });
            
        } catch (error) {
            console.error("Facebook Error:", error);
            await react("❌");
            await reply(`*❌ فـشـل تـحـمـيـل الـفـيـديـو*\n⚠️ قد يكون الرابط خاص أو محذوف\n📝 تأكد من الرابط وحاول مرة أخرى`);
        }
    }
};