export default {
    name: "لينك",
    aliases: ["رابط", "invite", "link"],
    description: "جلب رابط المجموعة",
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

        await react("🔗");

        try {
            // جلب رابط المجموعة
            const inviteCode = await bot.sock.groupInviteCode(jid);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

            const successMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🔗 رابـط الـمـجـمـوعـة*

*───━━━⊱  📎  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*🔗 الـرابـط:* 

> ${inviteLink}

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: successMsg,
                mentions: [userJid]
            }, { quoted: message });

            await react("✅");

        } catch (error) {
            console.error("❌ خطأ في جلب الرابط:", error);

            const errorMsg = `*❌ خـلـيـنـي مـشـࢪف الأول يـا عـبـيـط.*`;

            await bot.sendMessage(jid, {
                text: errorMsg,
                mentions: [userJid]
            }, { quoted: message });
        }
    }
};