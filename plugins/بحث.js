import fetch from 'node-fetch';

export default {
    name: "بحث",
    aliases: ["search", "جوجل"],
    description: "البحث في جوجل وعرض النتائج",
    category: "tools",
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;
        const query = args.join(" ").trim();

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        if (!query) {
            const helpMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🔍 أمـر الـبـحـث*

*───━━━⊱  📋  ⊰━━━───*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📝 طـريـقـة الاسـتـخـدام:*

*.بحث* *[ما تريد البحث عنه]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 أمـثـلـة:*
*.بحث معنى الحياة*
*.بحث كيفية صنع البوتات*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            return reply(helpMsg);
        }

        await react("🔍");

        try {
            // استخدام Google Custom Search بدون API (بحث مباشر)
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            
            // إرسال رابط البحث مباشرة
            const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🔍 نـتـيـجـة الـبـحـث*

*───━━━⊱  📊  ⊰━━━───*

*👤 الـبـاحـث:* ⦓ *@${userJid.split('@')[0]}* ⦔

*🔎 عـن مـاذا بـحـثـت:* ⦓ *${query}* ⦔

*📌 اضـغـط عـلى الـرابـط لـلـبـحـث:*
${searchUrl}

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: resultMsg,
                mentions: [userJid]
            }, { quoted: message });

            await react("✅");

        } catch (error) {
            console.error("❌ خطأ في البحث:", error);
            await reply(`*❌ حـدث خـطـأ أثـنـاء الـبـحـث*`);
        }
    }
};