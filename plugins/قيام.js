import fs from 'fs';

export default {
    name: "arise",
    aliases: ["ارايز", "Arise", "قيام"],
    category: "fun",

    async run({ sock, m, text }) {
        const chatId = m.key.remoteJid;
        const videoPath = './media/arise.mp4';
        const audioPath = './media/arise.mp3';

        try {
            // 1. تحديد الهدف
            let shadow = m.mentionedJid?.[0] || m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!shadow) {
                return await sock.sendMessage(chatId, { 
                    text: "*⚠️ مـنـشن الـضـحـيـة الـذي تـريـد ضـمـهـا لـ ظـلالـك..*" 
                }, { quoted: m });
            }

            // 2. تتابع الرسائل المطلوبة
            await sock.sendMessage(chatId, { react: { text: "👁️‍🗨️", key: m.key } });
            
            await sock.sendMessage(chatId, { text: "*جـاࢪي اسـتـخـلاص الـمـانـا...⌛*" }, { quoted: m });
            await new Promise(res => setTimeout(res, 1200));

            await sock.sendMessage(chatId, { text: "*تـم الاسـتـخـلاص بـنـجـاح🔥*" }, { quoted: m });
            await new Promise(res => setTimeout(res, 1200));

            await sock.sendMessage(chatId, { text: "*قـم بـالـنـهـوض الان🫳🏻*" }, { quoted: m });
            await new Promise(res => setTimeout(res, 1200));

            // 3. تجهيز البيانات
            const shadowId = shadow.split('@')[0];
            const masterRaw = m.sender || m.key.participant || chatId;
            const masterId = masterRaw.split('@')[0];

            const shadowRanks = [
                "جـنـدي عـادي", 
                "نـخـبـة مـتـطـورة", 
                "فـارس الـظـلام", 
                "فـارس نـخـبـة مـقـاتـل",
                "قـائد مـيـدانـي", 
                "رئـيـس الأركـان",
                "الـقـائد الأعـلى للـجـيـش",
                "الـظـل الـمـقـدس",
                "حـارس الـعـرش الـمـلـكـي",
                "الـعـاهـل الـعـتـيـق"
            ];

            const levels = ["E", "D", "C", "B", "A", "S", "SS", "SSS"];
            
            const randomRank = shadowRanks[Math.floor(Math.random() * shadowRanks.length)];
            const randomLevel = levels[Math.floor(Math.random() * levels.length)];

            // الاستمارة الجديدة المطلوبة
            const ariseText = `
*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*
*★┇ 𝐒 𝐎 𝐋 𝐎  𝐋 𝐄 𝐕 𝐄 𝐋 𝐈 𝐍 𝐆 ┇★*
*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*❑🌑 اسـتـخـلاص نـاجـح لـلـظـل 🌑↯*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*🍷 الـتـابـع الـجـديـد :⦓ @${shadowId} ⦔*

*🎖️ رتـبـتـه : ⦓${randomRank}⦔*

*📊 تـصـنـيـف قـوتـه : ⦓ ${randomLevel} ⦔*

*🌑 مـلـك الـظـلال :⦓ @${masterId} ⦔*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*
~*『 𝑨 𝑹 𝑰 𝐒 𝑬 .. 𝑵 𝑶 𝑾 』*~`.trim();

            // 4. إرسال الفيديو (GIF)
            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(chatId, {
                    video: { url: videoPath },
                    caption: ariseText,
                    gifPlayback: true,
                    mentions: [shadow, masterRaw]
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { text: ariseText, mentions: [shadow, masterRaw] }, { quoted: m });
            }

            // 5. إرسال الصوت (أوديو عادي)
            if (fs.existsSync(audioPath)) {
                await sock.sendMessage(chatId, { 
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: false 
                }, { quoted: m });
            }

            await sock.sendMessage(chatId, { react: { text: "🌑", key: m.key } });

        } catch (e) {
            console.error("Critical Error in Arise:", e);
        }
    }
};