import axios from 'axios';

export default {
    name: "ايديت",
    description: "إرسال 3 فيديوهات ايديت متتالية بضمان الوصول للجميع",
    category: "fun",

    async run({ sock, message, reply, text }) {
        try {
            const jid = message.key.remoteJid;
            // تفاعل العنكبوت 🕷️
            await sock.sendMessage(jid, { react: { text: "☄️", key: message.key } });

            // --- الجزء الأول: جلب الفيديوهات ---
            const query = text ? text + " Edit" : "Anime Edit 4k";
            const searchUrl = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}`;
            
            const response = await axios.get(searchUrl);
            const videos = response.data.data.videos;

            if (!videos || videos.length < 3) return reply(`❌ لـم أجد فـيـديـوهـات كـافـيـة.`);

            // اختيار 3 فيديوهات عشوائية
            const selectedVideos = videos.sort(() => 0.5 - Math.random()).slice(0, 3);

            // --- الجزء الثاني: منطق الإرسال المتتالي ---
            // الجملة الفخمة التي طلبتها في وصف الفيديو
            const caption = "𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻🍷𝑺𝑼𝑵𝑮";

            for (const video of selectedVideos) {
                await sock.sendMessage(jid, {
                    video: { url: video.play },
                    caption: caption,
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363169385603341@newsletter',
                            newsletterName: '𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }

            // --- الجزء الثالث: تفاعل النجاح ---
            await sock.sendMessage(jid, { react: { text: "✅", key: message.key } });

        } catch (err) {
            console.error(err);
            reply("❌ حـدث خـطأ أثـنـاء جـلـب الإيـديـتـات.");
        }
    }
};