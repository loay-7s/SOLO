import fs from 'fs-extra';

export default {
    name: "الروابط",
    aliases: ["روابط", "links"],
    description: "نظام منع الروابط في المجموعة (للمطورين فقط)",
    category: "admin",
    developer: true, // للمطورين فقط
    group: true,

    async run({ bot, message, isGroup, userJid, args, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        await react("🔗");

        // ✅ ملف تخزين الإعدادات
        const settingsPath = './data/links_settings.json';
        let settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
        
        if (!settings[jid]) {
            settings[jid] = { enabled: false };
        }

        const subCommand = args[0]?.toLowerCase();

        // عرض الحالة
        if (!subCommand || subCommand === "حالة") {
            const status = settings[jid].enabled ? "مـفـعـل ✅" : "مـعـطـل ❌";
            const statusMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🔗 نـظـام مـنـع الـروابـط*

*───━━━⊱  📋  ⊰━━━───*

*👤 الـمـطـور:* ⦓ *@${userJid.split('@')[0]}* ⦔

*📊 الـحـالـة:* ⦓ *${status}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 الأوامـر:*
*.الروابط فتح* - *لـتـفـعـيـل مـنـع الـروابـط*
*.الروابط غلق* - *لـتـعـطـيـل مـنـع الـروابـط*
*.الروابط حالة* - *لـعـرض الـحـالـة*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return await bot.sendMessage(jid, {
                text: statusMsg,
                mentions: [userJid]
            }, { quoted: message });
        }

        // تفعيل منع الروابط
        if (subCommand === "فتح" || subCommand === "تشغيل") {
            if (settings[jid].enabled) {
                return reply("*⚠️ نـظـام مـنـع الـروابـط مـفـعـل بـالـفـعـل*");
            }

            settings[jid].enabled = true;
            fs.writeJsonSync(settingsPath, settings, { spaces: 2 });

            const enableMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*✅ تـم تـفـعـيـل مـنـع الـروابـط*

*───━━━⊱  🔗  ⊰━━━───*

*👤 الـمـطـور:* ⦓ *@${userJid.split('@')[0]}* ⦔

*🔒 أي رابـط سـيـتـم حـذفـه تـلـقـائـيـاً*

*⚠️ 4 إنـذارات = طـرد*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: enableMsg,
                mentions: [userJid]
            }, { quoted: message });
            
            await react("✅");
            return;
        }

        // تعطيل منع الروابط
        if (subCommand === "غلق" || subCommand === "تعطيل") {
            if (!settings[jid].enabled) {
                return reply("*⚠️ نـظـام مـنـع الـروابـط مـعـطـل بـالـفـعـل*");
            }

            settings[jid].enabled = false;
            fs.writeJsonSync(settingsPath, settings, { spaces: 2 });

            const disableMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*❌ تـم تـعـطـيـل مـنـع الـروابـط*

*───━━━⊱  🔓  ⊰━━━───*

*👤 الـمـطـور:* ⦓ *@${userJid.split('@')[0]}* ⦔

*📝 سـيـتـم سـمـاح إرسـال الـروابـط*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: disableMsg,
                mentions: [userJid]
            }, { quoted: message });
            
            await react("✅");
            return;
        }

        // أمر غير معروف
        return reply("*📝 الأوامـر الـمـتـوفـرة:*\n• .الروابط حالة\n• .الروابط فتح\n• .الروابط غلق");
    }
};