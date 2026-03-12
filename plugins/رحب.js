import fs from 'fs';

export default {
    name: "رحب",
    aliases: ["welcome"],
    category: "fun",

    async run({ sock, m, text, isDeveloper }) { // أضفنا isDeveloper هنا
        const chatId = m.key.remoteJid;
        const videoPath = './media/welcome.mp4'; 

        try {
            // 1. التحقق من الرتبة (المطور أو المشرفين)
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            
            const user = participants.find(u => u.id === (m.sender || m.key.participant));
            const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin';

            // التعديل هنا: لو مش مطور وكمان مش مشرف، ارفض الأمر
            if (!isDeveloper && !isAdmin) {
                return await sock.sendMessage(chatId, { 
                    text: "*⚠️ هـذا الأمـر مـخـصـص لـلـمـشـرفـيـن فـقـط!*" 
                }, { quoted: m });
            }

            // 2. تحديد العضو الجديد (المنشن)
            let target = m.mentionedJid?.[0] || m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            if (!target) {
                return await sock.sendMessage(chatId, { 
                    text: "*⚠️ يـرجـى أن تمـنـشـن الـضـيـف لـلـتـرحـيـب بـه بـشـكـل لائـق..*" 
                }, { quoted: m });
            }

            // 3. تفاعل راقي
            await sock.sendMessage(chatId, { react: { text: "🎆", key: m.key } });
            
            // 4. تجهيز المنشنات
            const targetId = target.split('@')[0];
            const masterRaw = m.sender || m.key.participant;
            const masterId = masterRaw.split('@')[0];

            // استمارة الترحيب (بدون أي تعديل في الكلمات)
            const welcomeText = `*╭━─━─━─≪✠≫─━─━─━╮*  *💠𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐓𝐇𝐄 𝐆𝐔𝐈𝐋𝐃💠*
*╰━─━─━─≪✠≫─━─━─━╯*

*🛡️┇ بـكـل فـخـر و إعـتـزاز نـرحـب بـ*
*🔥┇ انـضـمامـك فـي نـقـابـتـنـا*
*🍃┇العـزيـزة و الـغـالـيـة.🌼*

*🍷┇هـنـا حـيـث سكـنـت المـتـعـة💫*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*👤┇ الـعـضـو الـمـوقـر : ⦓ @${targetId} ⦔ 🌸*

*⚖️┇ بـتـࢪحـيـب مـن : ⦓ @${masterId} ⦔*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*💎┇أصـبـحـت جزءاً جـمـيـلاً و مـمـيـزاً فـي عـائـلـتـنـا.🪻*


*⚜️┇نـتـمـنـى لـك رحـلـة مـمـتـعـة و مـمـيـزة مـعـنـا 🎐*


*🚫┇الـࢪجـاء قـࢪاءة قـوانـيـن الـنـقـابـة لـلأهـمـيـة.. اكـتـب [.القوانين]♦️*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*🏛️┇ مـرحـبـاً بـك نـوࢪت فـي عـريـن الـعـظـمـاء.🍷*

   ~*『 𝐄𝐍𝐉𝐎𝐘  𝐘𝐎𝐔𝐑  𝐒𝐓𝐀𝐘 』*~
   *╰━─━─━─≪✠≫─━─━─━╯*
> ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            // 5. إرسال الفيديو بالصوت مع الاستمارة
            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(chatId, {
                    video: { url: videoPath },
                    caption: welcomeText,
                    gifPlayback: false, 
                    mentions: [target, masterRaw]
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { 
                    text: welcomeText, 
                    mentions: [target, masterRaw] 
                }, { quoted: m });
            }

            await sock.sendMessage(chatId, { react: { text: "🎇", key: m.key } });

        } catch (e) {
            console.error("Error in Welcome Command:", e);
        }
    }
};