import fs from 'fs';

export default {
    name: "منشن",
    aliases: ["tagall"],
    category: "group",
    group: true,

    async run({ sock, m, text, handler }) {
        const chatId = m.key.remoteJid;

        try {
            const metadata = await sock.groupMetadata(chatId).catch(e => null);
            if (!metadata) return;
            
            const participants = metadata.participants || [];
            const sender = m.sender || m.key.participant;

            const isBotAdmin = participants.find(p => p.id === sender)?.admin !== null;
            const isDev = handler.isDeveloper(sender.split('@')[0]);

            if (!isBotAdmin && !isDev) {
                return await sock.sendMessage(chatId, { 
                    text: "*⚠️ عـذراً.. هـذا الأمـر مـخـصـص لـقـادة الـنـقـابـة فـقـط!*" 
                }, { quoted: m });
            }

            await sock.sendMessage(chatId, { react: { text: "🧧", key: m.key } });

            const admins = participants.filter(p => p.admin !== null);
            const members = participants.filter(p => p.admin === null);

            // بناء قوائم بمسافات (سطر إضافي \n) وبدون نجمات
            let adminList = "";
            admins.forEach((adm, index) => {
                adminList += `  ${index + 1}. ⦓ @${adm.id.split('@')[0]} ⦔\n\n`;
            });

            let memberList = "";
            members.forEach((mem, index) => {
                memberList += `  ${index + 1}. ⦓ @${mem.id.split('@')[0]} ⦔\n\n`;
            });

            const messageContent = text ? text : "تـواجدوا لـلأهـمـيـة.";

            let messageText = `
*╭━─━─━─≪✠≫─━─━─━╮*
            *🏮 نـداء الـنـقـابـة الـعـام 🧧*
*╰━─━─━─≪✠≫─━─━─━╯*

*📜┇الـرسـالـة :*

> ${messageContent}

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*👑┇ قـادة الـنـقـابـة :*

${adminList.trimEnd()}

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*

*👥┇ أعـضـاء الـنـقـابـة :*

${memberList.trimEnd()}

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*📊┇ الإحـصـائـيـات الـكـلـيـة :*

*▫️ عـدد الـمـشـࢪفـيـن : ⦓ ${admins.length} ⦔*
*▫️ عـدد الاعـضـاء : ⦓ ${members.length} ⦔*
*▫️ إجـمـالـي الـحـضـوࢪ : ⦓ ${participants.length} ⦔*

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

   ~*『 𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮 』*~
*╰━─━─━─≪✠≫─━─━─━╯*`.trim();

            await sock.sendMessage(chatId, { 
                text: messageText, 
                mentions: participants.map(p => p.id) 
            }, { quoted: m });

        } catch (e) {
            console.error("Error in Spaced Mention Command:", e);
        }
    }
};
