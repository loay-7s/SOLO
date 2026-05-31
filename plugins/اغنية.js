import ytSearch from 'yt-search';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: "اغنية",
    aliases: ["اغنيه", "song", "شغل", "music","أغنيه","أغنية","سمعني","غنيوة"],
    category: "تحميل",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, { 
                text: "🎵 *يـرجـى كـتـابـة اسـم الأغـنـيـة*\nمـثـال : .اغـنـيـة تـمـلـي مـعـاك" 
            });
            return;
        }

        const songName = args.join(' ');
        
        // ريأكت الفانوس 🎵
        await sock.sendMessage(chatId, { react: { text: "🎵", key: m.key } });

        try {
            // البحث عن الأغنية
            await sock.sendMessage(chatId, { 
                text: "⎔┄┄─ ⊱╎⌯ 🎵 ⌯╎⊰─┄┄⎔\n*🔍 جـاري الـبـحـث...*\n⎔┄┄─ ⊱╎⌯ 🎵 ⌯╎⊰─┄┄⎔" 
            });

            const searchResult = await ytSearch(songName);
            const video = searchResult.videos[0];

            if (!video) {
                await sock.sendMessage(chatId, { 
                    text: "❌ *الأغـنـيـة غـيـر مـوجـودة*\nجـرب اسـم اخـر" 
                });
                return;
            }

            // التحقق من طول الأغنية (تجنب الملفات الكبيرة)
            const durationSeconds = video.duration.seconds;
            if (durationSeconds > 900) { // 10 دقائق
                await sock.sendMessage(chatId, { 
                    text: "❌ *الأغـنـيـة طـويـلـة جـداً*\nالـحـد الأقـصـى 15 دقـيـقـة" 
                });
                return;
            }

            // تحميل الأغنية
            const audioPath = path.join(__dirname, '../media', `اغنية_${Date.now()}.mp3`);
            
            // استخدام yt-dlp للتحميل بجودة منخفضة
            const ytdlp = (await import('yt-dlp-exec')).default;
            
            // تحميل بصيغة MP3 بجودة 64kbps (أقل جودة ممكنة)
            await ytdlp(video.url, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: 64, // 👈 64kbps (أقل جودة)
                output: audioPath,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                postprocessorArgs: 'abr:64' // 👈 تأكيد الجودة المنخفضة
            });

            // التحقق من حجم الملف
            const stats = fs.statSync(audioPath);
            const fileSizeMB = stats.size / (1024 * 1024);

            // إذا كان الملف أكبر من 20MB
            if (fileSizeMB > 20) {
                fs.unlinkSync(audioPath); // مسح الملف
                
                await sock.sendMessage(chatId, { 
                    text: "❌ *حـجـم الأغـنـيـة كـبـيـر جـداً*\nالـحـد الأقـصـى 20MB" 
                });
                return;
            }

            // الاستمارة بالشكل المطلوب تماماً
            const menuText = 
                `*⎔┄┄─ ⊱╎⌯ 🎵 ⌯╎⊰─┄┄⎔*\n\n` +
                `*┋ تـم الـعـثـور عـلـى الأغـنـيـة ┋* 🎶\n\n` +
                `*⎔┄┄─── ⊱╎⌯ 🎼 ⌯╎⊰ ───┄┄⎔*\n\n` +
                `*┋ الـعـنـوان : ⦓ ${video.title} ⦔*\n\n` +
                `*┋ الـقـنـاة : ⦓ ${video.author.name} ⦔*\n\n` +
                `*┋ الـمـدة : ⦓ ${video.timestamp} ⦔*\n\n` +
                `*┋ الـمـشـاهـدات : ⦓ ${video.views.toLocaleString()} ⦔*\n\n` +
                `*⎔┄┄─── ⊱╎⌯ 🎵 ⌯╎⊰ ───┄┄⎔*\n\n` +
                `*┋ جـاري الارسال...* 📤\n` +
                `*⎔┄┄─ ⊱╎⌯ 🎵 ⌯╎⊰─┄┄⎔*`;

            // إرسال الاستمارة
            await sock.sendMessage(chatId, { 
                text: menuText,
                mentions: [userJid]
            }, { quoted: m });

            // إرسال الصوتية
            await sock.sendMessage(chatId, { 
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                caption: `*⎔┄┄─ ⊱╎⌯ 🎵 ⌯╎⊰─┄┄⎔*\n*┋ ${video.title}*\n*┋ ${video.author.name}*\n*⎔┄┄─ ⊱╎⌯ 🎵 ⌯╎⊰─┄┄⎔*`
            }, { quoted: m });

            // ريأكت النجاح ✅
            await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

            // مسح الملف
            fs.unlinkSync(audioPath);

        } catch (error) {
            console.log("❌ Music Error:", error);
            await sock.sendMessage(chatId, { 
                text: "❌ *حـدث خـطـأ فـي تـحـمـيـل الأغـنـيـة*\nحـاول مـرة اخـرى" 
            });
        }
    }
};