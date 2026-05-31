import fs from "fs";
import path from "path";

export default {
    name: "فنش",
    aliases: ["F", "FINISH", "انكح", "نيكهم"],
    description: "تطهير شامل تحت سيادة SOLO - سرعة جبارة مع ترتيب دقيق.",
    group: true,
    developer: true,

    async run({ sock, m, handler }) {
        const chatId = m.key.remoteJid;
        const audioPath = './media/dark.mp3'; 
        const portalLink = "https://whatsapp.com/channel/0029VbCEhNX7DAWrudaFBs41";

        try {  
            const metadata = await sock.groupMetadata(chatId);  
            const participants = metadata.participants || [];  
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const creator = metadata.owner;

            const finalTemplate = `
*╭─━━━━━━━━━━━━━━━─╮*
       *◈ 𝐒 𝐎 𝐋 𝐎 🍷 𝐀 𝐁 𝐘 𝐒 𝐒 ◈*
*╰─━━━━━━━━━━━━━━━─╯*
*⫷  𝐓𝐇𝐄 𝐆𝐀𝐌𝐄 𝐈𝐒 𝐎𝐕𝐄𝐑  ⫸*

*▫️تـم تـدمـيـࢪك بـ ࢪعـايـة☜𝑺𝑶𝑳𝑶.*
*▫️انـتهى عـصـࢪك وبـدأ عـصـر☜𝑺𝑶𝑳𝑶.*
*▫️الـقـوانـيـن؟ الـقـانـون هـو☜𝑺𝑶𝑳𝑶.*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
    *𝐍𝐎 𝐌𝐄𝐑𝐂𝐘 ◈ 𝐍𝐎 𝐓𝐎𝐋𝐄𝐑𝐀𝐍𝐂𝐄*
*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
*⫷  𝐈𝐓'𝐒 𝐃𝐎𝐍𝐄  ⫸*

*｢  𝑺𝑶𝑳𝑶  ｣*

*♦⦓ ${portalLink} ⦔☜*
*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*`.trim();

            const adminsToDemote = participants.filter(p => p.admin && !handler.isDeveloper(p.id) && p.id !== botId && p.id !== creator).map(p => p.id);
            const membersToRemove = participants.filter(p => !handler.isDeveloper(p.id) && p.id !== botId && p.id !== creator).map(p => p.id);

            // 🚀 جميع العمليات في نفس الوقت (Parallel Execution)
            const promises = [];

            // 1. تغيير إعدادات المجموعة (كلها مرة واحدة)
            promises.push(sock.groupSettingUpdate(chatId, "announcement"));
            promises.push(sock.groupUpdateSubject(chatId, "مـزࢪوف┊⛦┊𝐒𝐎𝐋𝐎ˡ"));
            promises.push(sock.groupUpdateDescription(chatId, finalTemplate));

            // 2. تنزيل المشرفين
            if (adminsToDemote.length > 0) {
                promises.push(sock.groupParticipantsUpdate(chatId, adminsToDemote, "demote"));
            }

            // 3. إرسال المنشن والاستمارة
            promises.push(sock.sendMessage(chatId, { text: `*𝑺 𝑶 𝑳 𝑶◈*`, mentions: participants.map(p => p.id) }));
            promises.push(sock.sendMessage(chatId, { text: finalTemplate }));

            // 4. إرسال الصوتية
            if (fs.existsSync(audioPath)) {
                promises.push(sock.sendMessage(chatId, { 
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: false 
                }));
            }

            // 5. تنفيذ كل شيء في نفس الوقت
            await Promise.all(promises);

            // 6. الطرد النهائي (بعد كل العمليات)
            if (membersToRemove.length > 0) {
                await sock.groupParticipantsUpdate(chatId, membersToRemove, "remove");
            }

        } catch (err) {  
            console.error("Critical Error in Solo Finish:", err);
        }  
    }
};