import fs from 'fs';

export default {
    name: "المشرفين",
    aliases: ["مشرفين", "استدعاء"],
    category: "group",

    async run({ sock, m, isGroup }) {
        const chatId = m.key.remoteJid;
        if (!isGroup) return;

        try {
            // 1. جلب بيانات المشرفين
            const metadata = await sock.groupMetadata(chatId);
            const admins = metadata.participants.filter(p => p.admin);
            const mentions = admins.map(a => a.id);
            const namesList = admins.map((a, i) => `${i + 1}- @${a.id.split("@")[0]}`).join('\n');

            // 2. جلب صورة الجروب
            let groupPfp;
            try {
                groupPfp = await sock.profilePictureUrl(chatId, 'image');
            } catch { groupPfp = null; }

            const ariseText = `╭──☆꧁༒ 𝐀 𝐃 𝐌 𝐈 𝐍 𝐒 ༒꧂☆──╮
   ♡   ∩_∩
 （„• ֊ •„)♡
┏━∪∪━━━━┓
♡ ${namesList}
┗━━━━━━━┛
╰━━━ ⛥⃝ 𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌 ༒︎ ━━━╯`.trim();

            // 3. الحل الجذري للرد (الريبلاي):
            // نتحقق من وجود رسالة مقتبسة داخل سياق الرسالة الحالية
            const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage ? 
                {
                    key: {
                        remoteJid: m.key.remoteJid,
                        fromMe: false,
                        id: m.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: m.message.extendedTextMessage.contextInfo.participant
                    },
                    message: m.message.extendedTextMessage.contextInfo.quotedMessage
                } : m;

            // 4. إرسال الاستمارة والرد على الشخص المستهدف
            if (groupPfp) {
                await sock.sendMessage(chatId, { 
                    image: { url: groupPfp }, 
                    caption: ariseText, 
                    mentions 
                }, { quoted: quotedMsg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: ariseText, 
                    mentions 
                }, { quoted: quotedMsg });
            }

        } catch (e) {
            console.error("Admins Call Error:", e);
        }
    }
};