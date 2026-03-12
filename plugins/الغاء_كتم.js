import fs from 'fs-extra';

export default {
    name: "الغاء_كتم",
    aliases: ["unmute", "تكلم"],
    description: "إلغاء كتم عضو",
    category: "admin",
    developer: true,
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("❌ *هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        // التحقق من وجود منشن أو رد فقط (من غير args[0])
        const quoted = message.message?.extendedTextMessage?.contextInfo;
        let targetJid = quoted?.participant || quoted?.mentionedJid?.[0];

        if (!targetJid) {
            return reply("👤 *مـنـشـن الـعـضـو أو رد عـلـيـه*");
        }

        // التحقق أن المستهدف ليس البوت نفسه
        if (targetJid === bot.sock.user.id) {
            return reply("❌ *لا يـمـكـن إلـغـاء كـتـم الـبـوت*");
        }

        // جلب معلومات المجموعة للتأكد أن العضو موجود
        try {
            const groupMetadata = await bot.sock.groupMetadata(jid);
            const participants = groupMetadata.participants.map(p => p.id);
            
            if (!participants.includes(targetJid)) {
                return reply("❌ *هـذا الـعـضـو لـيـس فـي الـمـجـمـوعـة*");
            }
        } catch (error) {
            console.error("❌ خطأ في جلب معلومات المجموعة:", error);
            return reply("❌ *فـشـل الـتـحـقـق مـن وجـود الـعـضـو*");
        }

        const mutePath = './data/muted.json';
        let mutedDB = fs.readJsonSync(mutePath, { throws: false }) || {};

        const muteKey = `${jid}_${targetJid}`;
        
        if (mutedDB[muteKey]) {
            delete mutedDB[muteKey];
            fs.writeJsonSync(mutePath, mutedDB, { spaces: 2 });
            
            await react("✅");

            // رسالة إلغاء الكتم الأسطورية (نفسها تماماً)
            const unmuteMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🔊 إلـغـاء الـكـتـم*

*───━━━⊱  ✅  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*👥 الـعـضـو:* ⦓ *@${targetJid.split('@')[0]}* ⦔

*🔓 الـحـالـة:* ⦓ *الـكـتـم مـلـغـي* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 عـاد الـعـضـو لـلـكـتـابـة بـشـكـل طـبـيـعـي*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: unmuteMsg,
                mentions: [userJid, targetJid]
            }, { quoted: message });
        } else {
            await reply("❌ *هـذا الـعـضـو لـيـس مـكـتـومـاً*");
        }
    }
};