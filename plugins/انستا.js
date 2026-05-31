import { igdl } from 'ruhend-scraper';

export default {
    name: "انستا",
    aliases: ["instagram", "ig", "انستجرام"],
    description: "تحميل فيديوهات وصور من الانستجرام",
    category: "tools",
    developer: false,
    group: false,
    private: false,

    async run({ message, sock, reply, react, args }) {
        let url = args.join(" ");
        
        // جلب الرابط من الرد
        if (!url && message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quoted = message.message.extendedTextMessage.contextInfo.quotedMessage;
            url = quoted.conversation || quoted.extendedTextMessage?.text || "";
        }
        
        if (!url) {
            await react("📸");
            return reply(`*╭─━━━━━━━━━━━━━━━━━━━─╮*
*│ 📸 تـحـمـيـل مـن الانـسـتـجـرام*
*╰─━━━━━━━━━━━━━━━━━━━─╯*

*📝 أرسل رابط الفيديو أو الصورة*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
📌 *.انستا https://instagram.com/reel/xxx*
📌 رد على الرابط واكتب *.انستا*

⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }
        
        // التحقق من صحة الرابط
        const instagramPatterns = [
            /https?:\/\/(?:www\.)?instagram\.com\//,
            /https?:\/\/(?:www\.)?instagr\.am\//,
            /https?:\/\/(?:www\.)?instagram\.com\/p\//,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
            /https?:\/\/(?:www\.)?instagram\.com\/tv\//
        ];
        
        const isValidUrl = instagramPatterns.some(pattern => pattern.test(url));
        
        if (!isValidUrl) {
            await react("⚠️");
            return reply(`*❌ رابـط انـسـتـجـرام غـيـر صـالـح*\n📌 تأكد من الرابط وحاول مرة أخرى`);
        }
        
        await react("⏳");
        
        try {
            const downloadData = await igdl(url);
            
            if (!downloadData?.data?.length) {
                throw new Error('No media found');
            }
            
            const mediaData = downloadData.data;
            
            // إزالة الروابط المكررة
            const uniqueMedia = [];
            const seenUrls = new Set();
            
            for (const media of mediaData) {
                if (media.url && !seenUrls.has(media.url)) {
                    seenUrls.add(media.url);
                    uniqueMedia.push(media);
                }
            }
            
            const mediaToDownload = uniqueMedia.slice(0, 20);
            
            if (mediaToDownload.length === 0) {
                throw new Error('No valid media found');
            }
            
            await react("📥");
            
            let sentCount = 0;
            
            for (let i = 0; i < mediaToDownload.length; i++) {
                try {
                    const media = mediaToDownload[i];
                    const mediaUrl = media.url;
                    
                    const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                                  media.type === 'video' || 
                                  url.includes('/reel/') || 
                                  url.includes('/tv/');
                    
                    const caption = `*📥 تـم الـتـحـمـيـل مـن الانـسـتـجـرام*\n*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*\n~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;
                    
                    if (isVideo) {
                        await sock.sendMessage(message.key.remoteJid, {
                            video: { url: mediaUrl },
                            caption: caption
                        }, { quoted: message });
                    } else {
                        await sock.sendMessage(message.key.remoteJid, {
                            image: { url: mediaUrl },
                            caption: caption
                        }, { quoted: message });
                    }
                    
                    sentCount++;
                    
                    // تأخير بسيط بين كل ملف
                    if (i < mediaToDownload.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                } catch (mediaError) {
                    console.error(`Error downloading media ${i + 1}:`, mediaError);
                }
            }
            
            await react("✅");
            
            if (sentCount === 0) {
                throw new Error('No media sent');
            }
            
        } catch (error) {
            console.error("Instagram Error:", error);
            await react("❌");
            await reply(`*❌ فـشـل تـحـمـيـل الـمـحـتـوى*\n⚠️ تأكد من الرابط وحاول مرة أخرى`);
        }
    }
};