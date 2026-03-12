import axios from 'axios';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export default {
    name: "تيكتوك",
    aliases: ["تيك", "tiktok", "tt"],
    category: "وسائط",
    desc: "تحميل فيديوهات تيك توك بدون علامة مائية",

    async run({ bot, message, args }) {
        const chatId = message.key.remoteJid;
        const userJid = message.sender || message.key.participant || chatId;

        // 1. استخراج الرابط
        const text = args.length > 0 ? args.join(' ') 
            : message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

        if (!text) {
            return await bot.sendMessage(chatId, {
                text: "*⚠️ يـرجـى إرسـال رابـط تـيـك تـوك أو الـرد عـلى رابـط!*"
            }, { quoted: message });
        }

        const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
        if (!urlMatch) {
            return await bot.sendMessage(chatId, {
                text: "*❌ لـم يـتـم الـعـثـور عـلـى رابـط صـحـيـح!*"
            }, { quoted: message });
        }

        const tiktokUrl = urlMatch[0];
        await bot.sendMessage(chatId, { react: { text: "⏳", key: message.key } });

        try {
            const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });

            if (response.data.code !== 0) throw new Error('API Error');

            const videoData = response.data.data;

            // 2. تحميل الفيديو
            const videoResponse = await axios.get(videoData.play, { responseType: 'arraybuffer' });
            const tempFile = join(tmpdir(), `tiktok_${Date.now()}.mp4`);
            await fs.writeFile(tempFile, videoResponse.data);

            // 3. التعديل المطلوب: النص الذي سيرافق الفيديو فقط
            const captionText = `𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀: 𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 🌑 𝑺𝑼𝑵𝑮`;

            // 4. إرسال الفيديو بالكلمات الجديدة
            await bot.sendMessage(chatId, {
                video: { url: tempFile },
                caption: captionText,
                mentions: [userJid]
            }, { quoted: message });

            await bot.sendMessage(chatId, { react: { text: "✅", key: message.key } });

            // تنظيف
            await fs.unlink(tempFile);

        } catch (error) {
            console.error(error);
            await bot.sendMessage(chatId, { react: { text: "❌", key: message.key } });
            await bot.sendMessage(chatId, { text: "*❌ فـشـل تـحـمـيـل الـفـيـديـو.. تـأكد مـن الـرابـط!*" });
        }
    }
};