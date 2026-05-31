import fs from 'fs-extra';

export default {
    name: "ريستارت",
    aliases: ["restart", "اعادة_تشغيل", "reboot"],
    description: "إعادة تشغيل البوت بالكامل",
    category: "developer",
    developer: true, // للمطورين فقط
    group: true,

    async run({ bot, message, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        await react("🔄");

        const restartMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🔄 إعـادة تـشـغـيـل الـبـوت*
*───━━━⊱  ⚙️  ⊰━━━───*

*👤 الـمـطـور:* ⦓ *@${userJid.split('@')[0]}* ⦔

*⏳ جـاري إعـادة تـشـغـيـل الـبـوت...*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*⏰ سـيـعـود الـبـوت خـلال ثـوانـي*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

        await bot.sendMessage(jid, {
            text: restartMsg,
            mentions: [userJid]
        }, { quoted: message });

        // ✅ إعادة التشغيل الفعلية
        setTimeout(() => {
            process.exit(0); // يخرج من العملية
        }, 2000);
    }
};