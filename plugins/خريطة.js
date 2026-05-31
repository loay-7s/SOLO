export default {
    name: "خريطة",
    aliases: ["map","خريطه"],
    description: "عرض خريطة لأي مكان في العالم",
    category: "tools",
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        const location = args.join(" ").trim();

        if (!location) {
            const helpMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🗺️ أمـر الـخـريـطـة*

*───━━━⊱  📋  ⊰━━━───*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 طـريـقـة الاسـتـخـدام:*

*.خريطة* *[اسم المكان]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 أمـثـلـة:*
*.خريطة القاهرة*
*.خريطة برج إيفل*
*.خريطة مكة المكرمة*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(helpMsg);
        }

        await react("🗺️");

        try {
            // رابط خريطة Google مباشر
            const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=m&z=15&output=embed`;
            
            // رابط فتح الخريطة في المتصفح
            const browserUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;

            const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🗺️ خـريـطـة الـمـكـان*
*───━━━⊱  📍  ⊰━━━───*

*📍 الـمـكـان:* ⦓ *${location}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 لـمـشـاهـدة الـخـريـطـة، اضـغـط عـلى الـرابـط:*

${browserUrl}

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: resultMsg,
                mentions: [userJid]
            }, { quoted: message });

            await react("✅");

        } catch (error) {
            console.error("❌ خطأ في جلب الخريطة:", error);

            const errorMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*❌ فـشـل جـلـب الـخـريـطـة*

*───━━━⊱  ⚠️  ⊰━━━───*

*📋 الأسباب المحتملة:*

*• مـشـكـلة فـي الـاتـصـال*
*• اسـم الـمـكـان غـيـر صـحـيـح*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: errorMsg,
                mentions: [userJid]
            }, { quoted: message });
        }
    }
};