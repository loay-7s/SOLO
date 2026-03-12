import fs from 'fs-extra';

export default {
    name: "كتم",
    aliases: ["mute", "اسكت"],
    description: "كتم عضو من الكتابة في المجموعة",
    category: "admin",
    developer: true,
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("❌ *هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        // التحقق من وجود منشن أو رد
        const quoted = message.message?.extendedTextMessage?.contextInfo;
        let targetJid = quoted?.participant || quoted?.mentionedJid?.[0];

        if (!targetJid) {
            return reply("👤 *مـنـشـن الـعـضـو أو رد عـلـيـه*");
        }

        // التحقق أن المستهدف ليس البوت نفسه
        if (targetJid === bot.sock.user.id) {
            return reply("❌ *لا يـمـكـن كـتـم الـبـوت*");
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

        // ملف تخزين المکتومين
        const mutePath = './data/muted.json';
        let mutedDB = fs.readJsonSync(mutePath, { throws: false }) || {};

        // تخزين الكتم
        const muteKey = `${jid}_${targetJid}`;
        mutedDB[muteKey] = {
            groupJid: jid,
            userJid: targetJid,
            mutedAt: Date.now(),
            mutedBy: userJid
        };

        fs.writeJsonSync(mutePath, mutedDB, { spaces: 2 });

        await react("🔇");

        // رسالة الكتم الأسطورية (نفسها تماماً)
        const muteMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🔇 نـظـام الـكـتـم*

*───━━━⊱  ⚔️  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*👥 الـعـضـو:* ⦓ *@${targetJid.split('@')[0]}* ⦔

*🔒 الـحـالـة:* ⦓ *مـكـتـوم* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 تـم كـتـم الـعـضـو، أي رسـالـة يـكـتـبـها سـتـمـسـح تـلـقـائـيـاً*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

        await bot.sendMessage(jid, {
            text: muteMsg,
            mentions: [userJid, targetJid]
        }, { quoted: message });
    }
};