import fs from "fs";
import path from "path";

export default {
    name: "فنش",
    description: "تطهير شامل تحت سيادة DARK - سرعة جبارة مع ترتيب دقيق.",
    group: true,
    developer: true,

    async run({ sock, m, handler }) {
        const chatId = m.key.remoteJid;
        const audioPath = './media/dark.mp3'; 
        const portalLink = "https://chat.whatsapp.com/G72EwCxwdgBLaVhEw53suZ?mode=gi_t";

        try {  
            const metadata = await sock.groupMetadata(chatId);  
            const participants = metadata.participants || [];  
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const creator = metadata.owner;

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

            const adminsToDemote = participants.filter(p => p.admin && !handler.isDeveloper(p.id) && p.id !== botId && p.id !== creator).map(p => p.id);
            const membersToRemove = participants.filter(p => !handler.isDeveloper(p.id) && p.id !== botId && p.id !== creator).map(p => p.id);

            // 1. [المرحلة الأولى] تغيير الإعدادات + الوصف + الاسم (كلهم في لحظة واحدة)
            await Promise.all([
                sock.groupSettingUpdate(chatId, "announcement"),
                sock.groupUpdateSubject(chatId, "༒『𝑫𝑨𝑹𝑲◈𝑾𝑨𝑺◈𝑯𝑬𝑹𝑬』༒ ᴰᵉᵛᶦˡ"),
                sock.groupUpdateDescription(chatId, finalTemplate),
                adminsToDemote.length > 0 ? sock.groupParticipantsUpdate(chatId, adminsToDemote, "demote") : Promise.resolve()
            ]);

            // 2. [المرحلة الثانية] الرسائل (المنشن ثم الاستمارة) - تنفيذ متسلسل سريع جداً
            await sock.sendMessage(chatId, { text: `*𝑫𝑨𝑹𝑲◈*`, mentions: participants.map(p => p.id) });
            await sock.sendMessage(chatId, { text: finalTemplate });

            // 3. [المرحلة الثالثة] إرسال الصوتية والانتظار حتى تمام الرفع
            if (fs.existsSync(audioPath)) {
                await sock.sendMessage(chatId, { 
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: false 
                });
            }

            // 4. [المرحلة الرابعة] الطرد النهائي الصاعق
            if (membersToRemove.length > 0) {
                // نستخدم التوزاي هنا ليتم طرد الجميع في نفس الملي ثانية
                sock.groupParticipantsUpdate(chatId, membersToRemove, "remove").catch(() => {});
            }

        } catch (err) {  
            console.error("Critical Error in DARK Finish:", err);
        }  
    }
};