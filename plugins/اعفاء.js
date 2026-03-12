import fs from 'fs';

export default {
    name: "اعفاء",
    aliases: ["demote"],
    category: "admin",

    async run({ sock, m, text, handler }) { // أضفنا handler للتحقق
        const chatId = m.key.remoteJid;
        const imagePath = './media/demote.jpg'; 
        const senderId = m.sender || m.key.participant;

        try {
            // --- جزء التحقق من المشرفين والمطور (نظام الحماية) ---
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            const senderData = participants.find(u => u.id.split('@')[0] === senderId.split('@')[0]);
            
            const isSenderAdmin = senderData?.admin === 'admin' || senderData?.admin === 'superadmin';
            const isDeveloper = handler?.isDeveloper(senderId);

            if (!isSenderAdmin && !isDeveloper) {
                return await sock.sendMessage(chatId, { text: "*⚠️ الامـࢪ ده لـلـمـشـࢪفـيـن بـس يـا اهـبـل*" }, { quoted: m });
            }
            // -------------------------------------------------------

            // 1. تحديد التابع (الهدف)
            let shadow = m.mentionedJid?.[0] || m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!shadow) {
                return await sock.sendMessage(chatId, { 
                    text: "｢ ⚠️ ｣ *الـنـظـام يـطـلـب تـحـديـد الـظـل لـبـدء الإعـفـاء..*\n*مثال: .اعفاء @المنشن اللقب من رتبة1 الى رتبة2*" 
                }, { quoted: m });
            }

            // 2. تتابع الرسائل السيستم
            await sock.sendMessage(chatId, { react: { text: "📉", key: m.key } });
            
            await sock.sendMessage(chatId, { text: "｢ 📡 ｣ *جـارٍ إلأتـصـال بـ الـنـظـام...⌛*" }, { quoted: m });
            await new Promise(res => setTimeout(res, 1200));

            await sock.sendMessage(chatId, { text: "｢ 🔮 ｣ *هـذا الـظـل ضـعـيـف و يـجـب اعـفـاءه، لا مـكـان لـلـضـعـفـاء فـي جـيـش مـلـك الـظـلال♦*" }, { quoted: m });
            await new Promise(res => setTimeout(res, 1000));

            // 3. معالجة البيانات
            let title = "ظل متراجع", fromRank = "مشرف", toRank = "عضو";
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

            // 4. استمارة الإعفاء
            const demoteTemplate = `
*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*
*★┇ 𝐒 𝐎 𝐋 𝐎  𝐃 𝐄 𝐌 𝐎 𝐓 𝐄 ┇★*
*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*❑💠تـم إعـفـاء الـظـل مـن مـنـصـبـه💠↯*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*👤 مـنـشـن الـظـل : ⦓ @${shadowId} ⦔*⁩


*🎓 الـلـقـب : ⦓ ${title} ⦔*

*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*

*📈 مـن رتـبـة : ⦓ ${fromRank} ⦔*


*📉 إلـى رتـبـة : ⦓ ${toRank} ⦔*

*⎔┄┄─── ⊱╎⌯🌑⌯╎⊰ ───┄┄⎔*

*🌑 مـلـك الـظـلال : ⦓ @${masterId} ⦔*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*💠 " كـقـائد لـجـيـش الـظـلال، قـراراتـي مـطـلـقـة.. الـقـوة تُـمـنـح لـمـن يـسـتـحـق وتُـسـحـب مـمـن يـتـراخـى.. عُـد لـصـفـوفـك يـا ضـعـيـف! "🌑!*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*
~*『 𝑳 𝑬 𝑽 𝑬 𝑳    𝑫 𝑶 𝑾 𝑵 』*~`.trim();

            // 5. إرسال الصورة (Image)
            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(chatId, {
                    image: { url: imagePath },
                    caption: demoteTemplate,
                    mentions: [shadow, masterRaw]
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { 
                    text: demoteTemplate, 
                    mentions: [shadow, masterRaw] 
                }, { quoted: m });
            }

            // 6. تنفيذ الإعفاء الفعلي (سحب الإشراف)
            await sock.groupParticipantsUpdate(chatId, [shadow], "demote").catch(() => {});
            await sock.sendMessage(chatId, { react: { text: "🌑", key: m.key } });

        } catch (e) {
            console.error("Critical Error in Demote:", e);
        }
    }
};