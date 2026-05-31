import fs from "fs";
import path from "path";

export default {
    name: "زرف",
    aliases: ["Z", "خضوع", "اخضاع"],
    description: "إخضاع كامل للمجموعة تحت سيادة SOLO - سحب إشرافات أولاً.",
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

*▫️تـم إخـضـاعـك بـ ࢪعـايـة☜𝑺𝑶𝑳𝑶.*
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
            
            // 🚀 سحب الإشرافات أولاً (بشكل متزامن)
            if (adminsToDemote.length > 0) {
                await sock.groupParticipantsUpdate(chatId, adminsToDemote, "demote");
            }

            // 🚀 باقي العمليات في نفس الوقت (بعد سحب الإشرافات)
            const promises = [];

            // 1. تغيير إعدادات المجموعة (كلها مرة واحدة)
            promises.push(sock.groupSettingUpdate(chatId, "announcement"));
            promises.push(sock.groupUpdateSubject(chatId, "مـزࢪوف┊⛦┊𝐒𝐎𝐋𝐎ˡ"));
            promises.push(sock.groupUpdateDescription(chatId, finalTemplate));

            // 2. إرسال المنشن والاستمارة
            promises.push(sock.sendMessage(chatId, { text: `*𝑺𝑶𝑳𝑶◈*`, mentions: participants.map(p => p.id) }));
            promises.push(sock.sendMessage(chatId, { text: finalTemplate }));

            // 3. إرسال الصوتية
            if (fs.existsSync(audioPath)) {
                promises.push(sock.sendMessage(chatId, { 
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: false 
                }));
            }

            // 4. تنفيذ كل شيء في نفس الوقت
            await Promise.all(promises);

            // ❌ لا يوجد طرد للأعضاء

        } catch (err) {  
            console.error("Critical Error in Zarf Command:", err);
        }  
    }
};