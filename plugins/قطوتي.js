import { catsStore } from '../config.js';

export default {
    name: "قطوتي",
    async run({ sock, m, args }) {
        try {
            const chatId = m.key.remoteJid;
            const sender = m.sender || m.key.participant || ""; // تأمين السندر

            // صيد التارجت (منشن أو رد)
            const contextInfo = m.message?.extendedTextMessage?.contextInfo;
            const quotedSender = contextInfo?.participant;
            const mentionedJid = contextInfo?.mentionedJid || [];
            let targetId = quotedSender || (mentionedJid.length > 0 ? mentionedJid[0] : null);

            if (!targetId) {
                return sock.sendMessage(chatId, { text: "⚠️ *مـنـشـن الـقـطـة أو رد عـلـى رسـالـتـهـا!*" }, { quoted: m });
            }

            // جلب الميتاداتا لتحديد الـ JID الحقيقي (مثل كود ايدي)
            const metadata = await sock.groupMetadata(chatId).catch(() => ({ participants: [] }));
            const participant = metadata.participants.find(p => p.id === targetId);
            const realJid = participant?.phoneNumber || targetId || "";

            if (realJid === sender) {
                return sock.sendMessage(chatId, { text: "❌ *لا تـسـتـطـيـع تـمـلـك نـفـسـك!*" }, { quoted: m });
            }

            let myCats = catsStore.get(sender) || [];
            if (!Array.isArray(myCats)) myCats = [];

            if (myCats.includes(realJid)) {
                return sock.sendMessage(chatId, { text: "✅ *هـذا الـشـخـص مـسـجـل عـنـدك مـسـبـقـاً.*" }, { quoted: m });
            }

            myCats.push(realJid);
            catsStore.set(sender, myCats);
            await catsStore.save();

            // الحماية من خطأ split:
            const senderNumber = sender && sender.includes('@') ? sender.split('@')[0] : "User";
            const targetNumber = realJid && realJid.includes('@') ? realJid.split('@')[0] : "Target";

            const text = `*⌬〔 𝐒𝐎𝐋𝐎 𝐒𝐘𝐒𝐓𝐄𝐌 〕⌬*\n\n*👤 الـمـالـك:* @${senderNumber}\n*🐈 الـقـطـة:* @${targetNumber}\n\n*✨ تـم الـتـسـجـيـل بـنـجـاح!*`;
            
            await sock.sendMessage(chatId, { text, mentions: [sender, realJid] }, { quoted: m });

        } catch (error) {
            console.error(error);
            const chatId = m.key.remoteJid;
            await sock.sendMessage(chatId, { text: "❌ *فـشـل الـنـظـام فـي تـحـديـد الـهـويـة، جـرب الـرد عـلـى الـرسـالـة!*" });
        }
    }
};