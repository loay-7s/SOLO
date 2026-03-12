export default {
    name: "قبول_الكل",
    aliases: ["قبول", "approve"],
    description: "قبول جميع طلبات الانضمام المعلقة",
    category: "group",
    admin: true,
    group: true,

    async run({ bot, message, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        // ✅ التحقق من أن المستخدم مشرف
        try {
            const groupMetadata = await bot.sock.groupMetadata(jid);
            const senderParticipant = groupMetadata.participants.find(p => p.id === userJid);
            
            if (!senderParticipant?.admin) {
                return reply("*❌ هـذا الأمـر لـلـمـشـرفـيـن فـقـط*");
            }
        } catch (error) {
            console.error("❌ خطأ في جلب معلومات المجموعة:", error);
            return reply("*❌ خـلـيـنـي مـشـࢪف الأول يـا عـبـيـط.*");
        }

        await react("✅");

        try {
            const requests = await bot.sock.groupRequestParticipantsList(jid);

            if (!requests || requests.length === 0) {
                return reply("*📭 لا تـوجـد طـلـبـات انـضـمـام مـعـلـقـة*");
            }

            const usersToAccept = requests
                .map(r => r.jid)
                .filter(Boolean);

            if (usersToAccept.length === 0) {
                return reply("*📭 لا تـوجـد طـلـبـات انـضـمـام مـعـلـقـة*");
            }

            await bot.sock.groupRequestParticipantsUpdate(
                jid,
                usersToAccept,
                "approve"
            );

            await react("✅");

            const successMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*✅ قـبـول جـمـيـع الـطـلـبـات*

*───━━━⊱  📋  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*📊 تـم قـبـول:* ⦓ *${usersToAccept.length}* ⦔ *طـلـب*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: successMsg,
                mentions: [userJid]
            }, { quoted: message });

        } catch (error) {
            console.error("❌ خطأ في القبول:", error);

            const errorMsg = `*❌ خـلـيـنـي مـشـࢪف الأول يـا عـبـيـط.*`;

            await bot.sendMessage(jid, {
                text: errorMsg,
                mentions: [userJid]
            }, { quoted: message });
        }
    }
};