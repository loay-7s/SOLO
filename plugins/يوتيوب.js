import ytSearch from 'yt-search';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// دالة البحث والتحميل المباشر
async function searchAndDownload(sock, chatId, m, query, userJid) {
    await sock.sendMessage(chatId, { 
        text: "*⎔┄┄─ ⊱╎⌯ 🔍 ⌯╎⊰─┄┄⎔*\n*🔍 جـاري الـبـحـث عـن الـفـيـديـو...*\n*⎔┄┄─ ⊱╎⌯ 🔍 ⌯╎⊰─┄┄⎔*" 
    });

    const searchResult = await ytSearch(query);
    const video = searchResult.videos[0];

    if (!video) {
        await sock.sendMessage(chatId, { 
            text: "❌ *الـفـيـديـو غـيـر مـوجـود*\nجـرب اسـم اخـر" 
        });
        return;
    }

    // إرسال معلومات الفيديو قبل التحميل
    const infoText = 
        `*⎔┄┄─ ⊱╎⌯ 🎥 ⌯╎⊰─┄┄⎔*\n\n` +
        `*┋ تـم الـعـثـور عـلـى الـفـيـديـو ┋* 🎬\n\n` +
        `*⎔┄┄─── ⊱╎⌯ 📊 ⌯╎⊰ ───┄┄⎔*\n\n` +
        `*┋ الـعـنـوان : ⦓ ${video.title} ⦔*\n\n` +
        `*┋ الـقـنـاة : ⦓ ${video.author.name} ⦔*\n\n` +
        `*┋ الـمـدة : ⦓ ${video.timestamp} ⦔*\n\n` +
        `*┋ الـمـشـاهـدات : ⦓ ${video.views.toLocaleString()} ⦔*\n\n` +
        `*⎔┄┄─── ⊱╎⌯ ⬇️ ⌯╎⊰ ───┄┄⎔*\n\n` +
        `*┋ جـاري تـحـمـيـل الـفـيـديـو...* 📥\n` +
        `*⎔┄┄─ ⊱╎⌯ 🎥 ⌯╎⊰─┄┄⎔*`;

    await sock.sendMessage(chatId, { 
        text: infoText,
        mentions: [userJid]
    }, { quoted: m });

    // تحميل الفيديو
    try {
        const ytdlp = (await import('yt-dlp-exec')).default;
        const videoPath = path.join(__dirname, '../media', `فيديو_${Date.now()}.mp4`);

        await ytdlp(video.url, {
            format: 'mp4',
            output: videoPath,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        const caption = 
            `*⎔┄┄─ ⊱╎⌯ 🎥 ⌯╎⊰─┄┄⎔*\n` +
            `*┋ ${video.title}*\n` +
            `*┋ ${video.author.name}*\n` +
            `*⎔┄┄─ ⊱╎⌯ 🎥 ⌯╎⊰─┄┄⎔*`;

        await sock.sendMessage(chatId, { 
            video: fs.readFileSync(videoPath),
            mimetype: 'video/mp4',
            fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp4`,
            caption: caption
        }, { quoted: m });

        fs.unlinkSync(videoPath);
        await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (downloadError) {
        console.log("Download Error:", downloadError);
        await sock.sendMessage(chatId, { 
            text: "❌ *فـشـل تـحـمـيـل الـفـيـديـو*\nالـفـيـديـو كـبـيـر جـداً" 
        });
    }
}

// دالة تحميل من الرابط (موجودة مسبقاً)
async function downloadFromUrl(sock, chatId, m, url, userJid) {
    await sock.sendMessage(chatId, { 
        text: "*⎔┄┄─ ⊱╎⌯ ⬇️ ⌯╎⊰─┄┄⎔*\n*⬇️ جـاري تـحـمـيـل الـفـيـديـو...*\n*⎔┄┄─ ⊱╎⌯ ⬇️ ⌯╎⊰─┄┄⎔*" 
    });

    try {
        const ytdlp = (await import('yt-dlp-exec')).default;
        const videoPath = path.join(__dirname, '../media', `فيديو_${Date.now()}.mp4`);

        await ytdlp(url, {
            format: 'mp4',
            output: videoPath,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        // الحصول على معلومات الفيديو
        let videoTitle = "فيديو يوتيوب";
        let videoAuthor = "";
        
        try {
            const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (videoId) {
                const info = await ytSearch({ videoId: videoId[1] });
                videoTitle = info.title;
                videoAuthor = info.author.name;
            }
        } catch (infoError) {
            console.log("Info fetch error:", infoError);
        }

        const caption = 
            `*⎔┄┄─ ⊱╎⌯ 🎥 ⌯╎⊰─┄┄⎔*\n` +
            `*┋ ${videoTitle}*\n` +
            (videoAuthor ? `*┋ ${videoAuthor}*\n` : '') +
            `*⎔┄┄─ ⊱╎⌯ 🎥 ⌯╎⊰─┄┄⎔*`;

        await sock.sendMessage(chatId, { 
            video: fs.readFileSync(videoPath),
            mimetype: 'video/mp4',
            fileName: `${videoTitle.replace(/[^\w\s]/gi, '')}.mp4`,
            caption: caption
        }, { quoted: m });

        fs.unlinkSync(videoPath);
        await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (downloadError) {
        console.log("Download Error:", downloadError);
        await sock.sendMessage(chatId, { 
            text: "❌ *فـشـل تـحـمـيـل الـفـيـديـو*\nالـرابـط غـيـر صـحـيـح او الـفـيـديـو كـبـيـر" 
        });
    }
}

export default {
    name: "يوتيوب",
    aliases: ["yt", "video", "فيديو"],
    category: "تحميل",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, { 
                text: "🎥 *يـرجـى كـتـابـة اسـم الـفـيـديـو او الـرابـط*\nمـثـال : .يـوتـيـوب شـرح الـبـرمـجـة\nاو : .يـوتـيـوب https://youtu.be/xxxxx" 
            });
            return;
        }

        const input = args.join(' ');
        
        // ريأكت 🎥
        await sock.sendMessage(chatId, { react: { text: "🎥", key: m.key } });

        try {
            // التحقق اذا كان الرابط يوتيوب
            const isUrl = input.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
            
            if (isUrl) {
                // حالة الرابط - تحميل الفيديو من الرابط
                await downloadFromUrl(sock, chatId, m, input, userJid);
            } else {
                // حالة البحث - يبحث ويحمل الفيديو الأول مباشرة
                await searchAndDownload(sock, chatId, m, input, userJid);
            }

        } catch (error) {
            console.log("❌ YouTube Error:", error);
            await sock.sendMessage(chatId, { 
                text: "❌ *حـدث خـطـأ*\nحـاول مـرة اخـرى" 
            });
        }
    }
};