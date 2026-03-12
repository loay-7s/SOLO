import fs from 'fs';

export default {
    name: "ترقية",
    aliases: ["promote", "رفع"],
    category: "admin",

    async run({ sock, m, text, handler }) { // أضفنا handler هنا للتحقق
        const chatId = m.key.remoteJid;
        const videoPath = './media/promote.mp4'; 
        const senderId = m.sender || m.key.participant;

        try {
            // --- جزء التحقق من المشرفين والمطور (نفس منطق كود الطرد) ---
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            const senderData = participants.find(u => u.id.split('@')[0] === senderId.split('@')[0]);
            
            const isSenderAdmin = senderData?.admin === 'admin' || senderData?.admin === 'superadmin';
            const isDeveloper = handler?.isDeveloper(senderId);

            if (!isSenderAdmin && !isDeveloper) {
                return await sock.sendMessage(chatId, { text: "*⚠️ الامـࢪ ده لـلـمـشـࢪفـيـن بـس يـا اهـبـل*" }, { quoted: m });
            }
            // -------------------------------------------------------

            // 1. تحديد التابع (الظل المراد ترقيته)
            let shadow = m.mentionedJid?.[0] || m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!shadow) {
                return await sock.sendMessage(chatId, { 
                    text: "｢ ⚠️ ｣ *الـنـظـام يـطـلـب تـحـديـد الـظـل لـبـدء الـتـرقـيـة..*\n*مثال : .ترقية @المنشن لقب العضو من رتبة 1 الى رتبة 2*" 
                }, { quoted: m });
            }

            // 2. تتابع الرسائل السيستم
            await sock.sendMessage(chatId, { react: { text: "🌑", key: m.key } });
            
            await sock.sendMessage(chatId, { text: "｢ 📡 ｣ *جـارٍ الاتـصـال بـ الـنـظـام...⌛*" }, { quoted: m });
            await new Promise(res => setTimeout(res, 1200));

            await sock.sendMessage(chatId, { text: "｢ 🔮 ｣ *قـد اثـبـت هـذا الـظـل كـفـاءته و يـسـتـحـق أن يـتـࢪقـى فـي جـيـش مـلـك الـظـلال🍷*" }, { quoted: m });
            await new Promise(res => setTimeout(res, 1200));

            // 3. معالجة بيانات النص (اللقب والرتب)
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

            // 4. الاستمارة المطلوبة
            const soloLevelingTemplate = `
*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*
*★┇ 𝐒 𝐎 𝐋 𝐎  𝐋 𝐄 𝐕 𝐄 𝐋  𝐔 𝐏 ┇★*
*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*❑💠تـمـت تـرقـيـة الـظـل بـنـجـاح💠↯*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*👤 مـنـشـن الـظـل : ⦓ @${shadowId} ⦔*⁩


*🎓 الـلـقـب : ⦓ ${title} ⦔*

*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*

*📉 مـن رتـبـة : ⦓ ${fromRank} ⦔*


*📈 إلـى رتـبـة : ⦓ ${toRank} ⦔*

*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*

*🌑 مـلـك الـظـلال : ⦓ @${masterId} ⦔*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*💠 بـصـفـتـك جـزءاً و عضـوا مـهـمـا فـي جـيـش الـظـلال ، قـوتـك الآن تـمـثـل إرادة مـلـك الـظـلال.. اسـتـمـر فـي الـتـطـور..🔥!*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*
~*『 𝑳 𝑬 𝑽 𝑬 𝑳    𝑼 𝑷    𝑵 𝑶 𝑾 』*~`.trim();

            // 5. إرسال الفيديو (GIF)
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