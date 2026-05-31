import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default {
    name: "تيكتوك",
    aliases: ["tiktok", "tt"],
    category: "وسائط",
    desc: "تحميل فيديوهات تيك توك بدون علامة مائية",

    async run({ bot, message, args, react, reply }) {
        const chatId = message.key.remoteJid;
        const userJid = message.key.participant || message.key.remoteJid;

        const text = args.length > 0 ? args.join(' ') 
            : message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

        if (!text) {
            return reply("*⚠️ يـرجـى إرسـال رابـط تـيـك تـوك أو الـرد عـلى رابـط!*");
        }

        const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
        if (!urlMatch) {
            return reply("*❌ لـم يـتـم الـعـثـور عـلـى رابـط صـحـيـح!*");
        }

        const tiktokUrl = urlMatch[0];
        await react("⏳");

        const tempPath = path.join(process.cwd(), 'temp');
        fs.ensureDirSync(tempPath);
        const videoFile = path.join(tempPath, `tiktok_${Date.now()}.mp4`);
        const compressedFile = path.join(tempPath, `tiktok_compressed_${Date.now()}.mp4`);

        try {
            const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });

            if (response.data.code !== 0) throw new Error('API Error');

            const videoData = response.data.data;
            const videoUrl = videoData.play;

            const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
            await fs.writeFile(videoFile, Buffer.from(videoResponse.data));

            const stats = await fs.stat(videoFile);
            const fileSizeMB = stats.size / (1024 * 1024);

            let finalVideo = videoFile;

// حتة الضغط المعدلة - توقف عند 12-14 ميجا عشان الجودة ماتموتش

if (fileSizeMB > 14) {
    await react("🗜️");
    
    let crfValue = 26;
    let finalCompressed = compressedFile;
    let compressedSize = fileSizeMB;
    
    // هدفنا 13 ميجا مش أقل من 10
    const targetSize = 13;
    
    while (compressedSize > targetSize && crfValue <= 35) {
        await execPromise(`ffmpeg -i "${videoFile}" -vf "scale=1080:-2" -c:v libx264 -crf ${crfValue} -preset fast -c:a aac -b:a 128k "${finalCompressed}" -y`);
        
        const compressedStats = await fs.stat(finalCompressed);
        compressedSize = compressedStats.size / (1024 * 1024);
        
        if (compressedSize > targetSize) {
            crfValue += 2;
        }
    }
    
    // لو لسه كبير، نحاول مرة أخيرة بجودة أقل شوية
    if (compressedSize > targetSize && crfValue <= 40) {
        await execPromise(`ffmpeg -i "${videoFile}" -vf "scale=720:-2" -c:v libx264 -crf ${crfValue} -preset fast -c:a aac -b:a 96k "${finalCompressed}" -y`);
    }
    
    finalVideo = finalCompressed;
}

            const captionText = `𝑩𝒀 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 📥`;

            await bot.sendMessage(chatId, {
                video: { url: finalVideo },
                caption: captionText,
                mentions: [userJid]
            }, { quoted: message });

            await react("✅");

        } catch (error) {
            console.error(error);
            await react("❌");
            await reply("*❌ فـشـل تـحـمـيـل الـفـيـديـو.. تـأكد مـن الـرابـط!*");
        } finally {
            await fs.unlink(videoFile).catch(() => {});
            await fs.unlink(compressedFile).catch(() => {});
        }
    }
};