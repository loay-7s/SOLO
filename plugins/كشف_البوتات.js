export default {
    name: "كشف_البوتات",
    aliases: ["bots", "بوتات", "detectbots"],
    description: "الكشف عن البوتات في المجموعة باختبار الأوامر",
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
            return reply("*❌ خـلـيـنـي مـشـرف الأول*");
        }

        await react("🔍");

        try {
            const groupMetadata = await bot.sock.groupMetadata(jid);
            const participants = groupMetadata.participants || [];

            // ✅ قائمة الأوامر للاختبار (سيقوم المشرف باختبارها يدوياً)
            const testCommands = [
                ".اوامر", ".الاوامر", ".ألأوامر", ".الأوامر", ".أوامر",
                ".مساعدة", ".مساعده", ".بوت", ".تست", ".test", ".menu", ".MENU",
                ".help", ".HELP", ".bot", ".BOT", ".ping", ".PING"
            ];

            // تجهيز قائمة الأوامر
            let commandsList = '';
            testCommands.forEach((cmd, i) => {
                commandsList += `*${i + 1}.* ${cmd}\n`;
            });

            const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🤖 طـريـقـة كـشـف الـبـوتـات*

*───━━━⊱  🔍  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*📊 إحـصـائـيـات الـمـجـمـوعـة:*

*┃ 👥 إجـمـالـي الأعـضـاء:* ⦓ *${participants.length}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📋 الأوامـر الـمـقـتـرحـة لـلـتـجـربـة:*

${commandsList}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*💡 طـريـقـة الـكـشـف:*

*1️⃣ قـم بـتـجـࢪبـة أمـر مـن الأوامـر أعـلاه*

*2️⃣ راقـب مـن يـقـوم بـالـرد عـلـى الأمـر*

*3️⃣ أي عـضـو يـرد عـلـى الأمـر فـي أقـل مـن ثـانـيـتـيـن هـو بـوت*

*4️⃣ الأعـضـاء الـذين يـردون بـسـرعـة غـيـر طـبـيـعـيـة هـم بـوتـات*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*🔹 لـطـرد أي بـوت:* *.طرد @المنشن*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: resultMsg,
                mentions: [userJid]
            }, { quoted: message });

            await react("✅");

        } catch (error) {
            console.error("❌ خطأ في كشف البوتات:", error);
            await reply("*❌ فـشـل كـشـف الـبـوتـات*");
        }
    }
};