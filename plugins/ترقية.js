import fs from 'fs';

export default {
    name: "ترقية",
    aliases: ["promote", "ترقيه"],
    category: "admin",

    async run({ sock, m, text, handler }) {
        const chatId = m.key.remoteJid;
        const videoPath = './media/promote.mp4'; 
        const senderId = m.sender || m.key.participant;

        try {
            // --- جزء التحقق من المشرفين والمطور ---
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            const senderData = participants.find(u => u.id.split('@')[0] === senderId.split('@')[0]);
            
            const isSenderAdmin = senderData?.admin === 'admin' || senderData?.admin === 'superadmin';
            const isDeveloper = handler?.isDeveloper(senderId);

            if (!isSenderAdmin && !isDeveloper) {
                return await sock.sendMessage(chatId, { text: "*⚠️ الامـࢪ ده لـلـمـشـࢪفـيـن بـس يـا اهـبـل*" }, { quoted: m });
            }

            // 1. تحديد التابع (الظل المراد ترقيته)
            let shadow = m.mentionedJid?.[0] || m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!shadow) {
                return await sock.sendMessage(chatId, { 
                    text: "｢ ⚠️ ｣ *الـنـظـام يـطـلـب تـحـديـد الـعـضـو لـبـدء الـتـرقـيـة..*\n*مثال : .ترقية @المنشن لقب العضو من رتبة 1 الى رتبة 2*" 
                }, { quoted: m });
            }

            // ريأكت فقط
            await sock.sendMessage(chatId, { react: { text: "🌑", key: m.key } });

            // 2. معالجة بيانات النص (اللقب والرتب)
            let title = "ظـل مـحـارب", fromRank = "عضو", toRank = "مشرف";
            if (text) {
                let cleanText = text.replace(/@\d+/g, '').trim();
                if (cleanText.includes('من') && cleanText.includes('الى')) {
                    const part1 = cleanText.split('من');
                    const part2 = part1[1].split('الى');
                    title = part1[0].trim() || title;
                    fromRank = part2[0].trim() || fromRank;
                    toRank = part2[1].trim() || toRank;
                }
            }

            const shadowId = shadow.split('@')[0];
            const masterRaw = m.sender || m.key.participant || chatId;
            const masterId = masterRaw.split('@')[0];

            // 3. الاستمارة المطلوبة
            const soloLevelingTemplate = `
*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*
*★┇ 𝐒 𝐎 𝐋 𝐎  𝐋 𝐄 𝐕 𝐄 𝐋  𝐔 𝐏 ┇★*
*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*❑💠تـمـت تـرقـية الـعضـو بـنـجـاح💠↯*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*👤 مـنـشـن الـعـضـو : ⦓ @${shadowId} ⦔*

*🎓 الـلـقـب : ⦓ ${title} ⦔*

*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*

*📉 مـن رتـبـة : ⦓ ${fromRank} ⦔*

*📈 إلـى رتـبـة : ⦓ ${toRank} ⦔*

*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*

*🌑 الـمـشـࢪف الـمـسـؤول : ⦓ @${masterId} ⦔*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*بـصـفـتـك عـضـواً و جـزءً مـهـمـا فـي الـنـقـابـة، لـقـد اثـبـتّ جـداࢪتـك و تـسـتـحـق الـتـࢪقـيـة، نـتـمـنـى مـنـك أن تـكـون عـنـد حـسـن ظـنـنـا و تـبـهـࢪنـا بـ عـمـلـك... مـبـاࢪك لـك على الـتـࢪقـيـة💎.*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*
~*『 𝑳 𝑬 𝑽 𝑬 𝑳    𝑼 𝑷    𝑵 𝑶 𝑾 』*~`.trim();

            // 4. إرسال الفيديو مع الاستمارة فقط
            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(chatId, {
                    video: { url: videoPath },
                    caption: soloLevelingTemplate,
                    gifPlayback: true,
                    mentions: [shadow, masterRaw]
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { 
                    text: soloLevelingTemplate, 
                    mentions: [shadow, masterRaw] 
                }, { quoted: m });
            }

            await sock.sendMessage(chatId, { react: { text: "👑", key: m.key } });

        } catch (e) {
            console.error("Critical Error in Promote Command:", e);
        }
    }
};