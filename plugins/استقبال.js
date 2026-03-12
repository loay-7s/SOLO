import fs from 'fs-extra';

export default {
    name: "استقبال",
    aliases: ["reception"],
    description: "نظام استقبال الأعضاء الجدد (فتح/غلق)",
    category: "group",
    admin: true,
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;
        const settingsPath = './data/reception_settings.json';

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
            return reply("*❌ خـلـيـنـي مـشـرف الأول يـا عـبـيـط.*");
        }

        await react("📋");

        // قراءة الإعدادات
        let settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
        if (!settings[jid]) {
            settings[jid] = { enabled: false };
        }

        const subCommand = args[0]?.toLowerCase();

        // عرض الحالة الحالية
        if (!subCommand || subCommand === "حالة") {
            const status = settings[jid].enabled ? "مـفـتـوح ✅" : "مـغـلـق ❌";
            const statusMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*📋 نـظـام الاسـتـقـبـال*
*───━━━⊱  🚪  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*📊 الـحـالـة:* ⦓ *${status}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 الأوامـر:*

*.استقبال فتح* - *لـفـتـح الاسـتـقـبـال*

*.استقبال غلق* - *لـغـلـق الاسـتـقـبـال*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return await bot.sendMessage(jid, {
                text: statusMsg,
                mentions: [userJid]
            }, { quoted: message });
        }

        // فتح الاستقبال
        if (subCommand === "فتح" || subCommand === "تشغيل") {
            if (settings[jid].enabled) {
                return reply("*⚠️ الاسـتـقـبـال مـفـتـوح بـالـفـعـل*");
            }

            settings[jid].enabled = true;
            fs.writeJsonSync(settingsPath, settings, { spaces: 2 });

            const enableMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*✅ تـم فـتـح الاسـتـقـبـال*

*───━━━⊱  🚪  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*📋 سـيـتـم اسـتـقـبـال أي عـضـو جـديـد*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: enableMsg,
                mentions: [userJid]
            }, { quoted: message });
            
            await react("✅");
            return;
        }

        // غلق الاستقبال
        if (subCommand === "غلق" || subCommand === "تعطيل") {
            if (!settings[jid].enabled) {
                return reply("*⚠️ الاسـتـقـبـال مـغـلـق بـالـفـعـل*");
            }

            settings[jid].enabled = false;
            fs.writeJsonSync(settingsPath, settings, { spaces: 2 });

            const disableMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*❌ تـم غـلـق الاسـتـقـبـال*

*───━━━⊱  🔒  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*🔇 لـن يـتـم اسـتـقـبـال الأعـضـاء الـجـدد*

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
        return reply("*📝 الأوامـر الـمـتـوفـرة:*\n• .استقبال حالة\n• .استقبال فتح\n• .استقبال غلق");
    }
};