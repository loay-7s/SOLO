// ملف: plugins/تيك.js (باستخدام API TikVM المفتوح)

import axios from 'axios';

export default {
    name: "تيك",
    aliases: ["tiktok", "tt"],
    description: "يبحث عن فيديو في تيك توك ويرسله.",
    category: "download",

    async run({ sock, message, reply, text }) {
        if (!text) {
            return reply("*🎵 يرجى كتابة ما تريد البحث عنه في تيك توك بعد الأمر.*\n\n*مثال:*\n*.تيك محمد صلاح*");
        }

        try {
            await reply(`*🔎 جاري البحث عن فيديوهات لـ "${text}"...*`);

            // --- ✨ [الـ API الجديد والمفتوح] ✨ ---
            const encodedText = encodeURIComponent(text);
            const apiUrl = `https://www.tikwm.com/api/feed/search?keywords=${encodedText}`;

            // استدعاء الـ API
            const response = await axios.get(apiUrl);

            // التحقق من نجاح الرد ووجود بيانات
            if (response.status !== 200 || response.data.code !== 0 || !response.data.data || !response.data.data.videos || response.data.data.videos.length === 0) {
                console.log("TikVM API Response:", response.data); // للتشخيص
                return reply(`*❌ لم يتم العثور على فيديوهات تطابق بحثك عن "${text}".*`);
            }

            // --- [تكييف الكود مع بنية TikVM] ---
            const videos = response.data.data.videos;
            const randomVideo = videos[Math.floor(Math.random() * videos.length)]; // اختيار فيديو عشوائي
            
            const videoUrl = randomVideo.play; // رابط الفيديو المباشر

            if (!videoUrl) {
                return reply("*❌ حدث خطأ أثناء استخراج رابط الفيديو من الـ API.*");
            }

            // بناء النص التوضيحي (caption)
            const caption = `
🎬 *العنوان:* ${randomVideo.title || 'بدون عنوان'}

👤 *الناشر:* ${randomVideo.author.nickname || 'غير معروف'}
❤️ *الإعجابات:* ${(randomVideo.digg_count || 0).toLocaleString()}
💬 *التعليقات:* ${(randomVideo.comment_count || 0).toLocaleString()}
👀 *المشاهدات:* ${(randomVideo.play_count || 0).toLocaleString()}
🔁 *المشاركات:* ${(randomVideo.share_count || 0).toLocaleString()}
`.trim();

            // إرسال الفيديو للمستخدم
            await sock.sendMessage(message.key.remoteJid, {
                video: { url: videoUrl },
                caption: caption
            }, { quoted: message });

        } catch (error) {
            console.error("Error in 'تيك' command:", error);
            if (error.response) {
                await reply(`*❌ حدث خطأ من جهة الـ API (الحالة: ${error.response.status}).*`);
            } else {
                await reply(`*❌ حدث خطأ عام: ${error.message}*`);
            }
        }
    }
};