import fs from 'fs-extra';

export default {
    name: "ترحيب",
    aliases: ["welcome"],
    description: "نظام الترحيب التلقائي للأعضاء الجدد",
    category: "group",
    admin: true,
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;
        const settingsPath = './data/welcome_settings.json';

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

        await react("🎉");

        // قراءة الإعدادات
if (!fs.existsSync(settingsPath)) {
    fs.writeJsonSync(settingsPath, {}, { spaces: 2 });
}

let settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
        if (!settings[jid]) {
            settings[jid] = { enabled: false };
        }

        const subCommand = args[0]?.toLowerCase();

        // عرض الحالة الحالية
        if (!subCommand || subCommand === "حالة") {
            const status = settings[jid].enabled ? "مـفـعـل ✅" : "مـغـلـق ❌";
            const statusMsg = `*╭━─━─━─≪✠≫─━─━─━╮*
*💠 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐒𝐘𝐒𝐓𝐄𝐌 💠*
*╰━─━─━─≪✠≫─━─━─━╯*

*🔰┇الـتـرحـيـب الـتـلـقـائـي*

*👤┇الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*📊┇الـحـالـة:* ⦓ *${status}* ⦔

*⎔┄┄─── ⊱╎⌯🏮⌯╎⊰ ───┄┄⎔*

*📜┇الأوامـر الـمـتـوفـرة:*

*✅┇.ترحيب فتح* - *لـتـفـعـيـل الـنـظـام*

*❌┇.ترحيب غلق* - *لـتـعـطـيـل الـنـظـام*

*╰━─━─━─≪✠≫─━─━─━╯*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            return await bot.sendMessage(jid, {
                text: statusMsg,
                mentions: [userJid]
            }, { quoted: message });
        }

        // تفعيل الترحيب
        if (subCommand === "فتح" || subCommand === "تشغيل") {
            if (settings[jid].enabled) {
                return reply("*⚠️┇الـتـرحـيـب مـفـعـل بـالـفـعـل*");
            }

            settings[jid].enabled = true;
            fs.writeJsonSync(settingsPath, settings, { spaces: 2 });

            const enableMsg = `*╭━─━─━─≪✠≫─━─━─━╮*
*💠 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐒𝐘𝐒𝐓𝐄𝐌 💠*
*╰━─━─━─≪✠≫─━─━─━╯*

*✅┇تـم تـفـعـيـل الـنـظـام*

*👤┇الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*🎉┇سـيـتـم تـرحـيـب أي عـضـو جـديـد*

*╰━─━─━─≪✠≫─━─━─━╯*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            await bot.sendMessage(jid, {
                text: enableMsg,
                mentions: [userJid]
            }, { quoted: message });
            
            await react("✅");
            return;
        }

        // تعطيل الترحيب
        if (subCommand === "غلق" || subCommand === "تعطيل") {
            if (!settings[jid].enabled) {
                return reply("*⚠️┇الـتـرحـيـب مـغـلـق بـالـفـعـل*");
            }

            settings[jid].enabled = false;
            fs.writeJsonSync(settingsPath, settings, { spaces: 2 });

            const disableMsg = `*╭━─━─━─≪✠≫─━─━─━╮*
*💠 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐒𝐘𝐒𝐓𝐄𝐌 💠*
*╰━─━─━─≪✠≫─━─━─━╯*

*❌┇تـم تـعـطـيـل الـنـظـام*

*👤┇الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*🔇┇لـن يـتـم تـرحـيـب الأعـضـاء الـجـدد*

*╰━─━─━─≪✠≫─━─━─━╯*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            await bot.sendMessage(jid, {
                text: disableMsg,
                mentions: [userJid]
            }, { quoted: message });
            
            await react("✅");
            return;
        }

        // أمر غير معروف
        return reply("*📜┇الأوامـر الـمـتـوفـرة:*\n• .ترحيب حالة\n• .ترحيب فتح\n• .ترحيب غلق");
    }
};