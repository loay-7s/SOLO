export default {
    name: "زواج",
    description: "يختار شخصين عشوائياً من المجموعة ويزوجهم بعقد قران فخم",
    category: "ترفيه",

    async run({ sock, m, reply }) {
        const chatId = m.key.remoteJid;

        if (!chatId.endsWith('@g.us')) return reply("⚠️ هذا الأمر يعمل داخل المجموعات فقط!");

        try {
            // جلب بيانات المجموعة والأعضاء
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;

            if (participants.length < 5) return reply("❌ المجموعة هادئة جداً، أحتاج لعدد أكبر من الأعضاء لإتمام الزواج!");

            // اختيار عريس وعروس عشوائياً (ضمان عدم تكرار الشخص)
            let user1 = participants[Math.floor(Math.random() * participants.length)].id;
            let user2 = participants[Math.floor(Math.random() * participants.length)].id;

            while (user1 === user2) {
                user2 = participants[Math.floor(Math.random() * participants.length)].id;
            }

            const name1 = `⦓ @${user1.split('@')[0]} ⦔`;
            const name2 = `⦓ @${user2.split('@')[0]} ⦔`;

            await sock.sendMessage(chatId, { react: { text: "💍", key: m.key } });

            // تفاصيل العقد الفخم
            const locations = ["القصر الملكي 🏰", "جزر القمر 🏝️", "قاعة الماسة 💎", "باريس 🇫🇷", "اليونان 🏛️", "سطوح الجيران 🏠"];
            const randomLoc = locations[Math.floor(Math.random() * locations.length)];
            const mahr = ["100 مليون حسنة", "سيارة فيراري 🏎️", "بيت في الجنة إن شاء الله", "كيلو ذهب 💰", "بوكس شيكولاتة 🍫"];
            const randomMahr = mahr[Math.floor(Math.random() * mahr.length)];

            const marriageForm = `
*╭━─━─📜  𝐒 𝐎 𝐋 𝐎  📜 ─━─━╮*
*│      💍 اسـتـمـارة زواج مـلـكـيـة 💍*
*╰━─━─━─━─━─━─━─━─━─━╯*

*┃ ⚖️ بـمـوجـب هـذا الـعـقـد، تـم إعـلان:*


*┃ 🤵 الـعـريس : ${name2}*

*┃ 👰 الـعـروسـة : ${name1}*


*┃ 💍 الـحـالـة : ⦓ مـكـتـوبـيـن لـبـعـض ⦔*

*┃ 💰 الـمـهـر : ⦓ ${randomMahr} ⦔*

*┃ 📍 الـمـكـان : ⦓ ${randomLoc} ⦔*

*┃ 📅 الـتـاريـخ : ⦓ ${new Date().toLocaleDateString('ar-EG')} ⦔*

*╰━━━──━━━─━──━──━──━━━╯*

*┃ 📣 بـاركـوا لـلـعـرسـان الـجـدد! 🎊*

*┃ ⚠️ الـطـلاق مـمـنـوع ⚠️*

*╰━─━─⊱  𝐒𝐎𝐋𝐎 𝐒𝐇𝐈𝐄𝐋𝐃  ⊰─━─━╯*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            await sock.sendMessage(chatId, { 
                text: marriageForm, 
                mentions: [user1, user2] 
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            reply("❌ حدث خطأ أثناء توثيق العقد، يبدو أن العروس هربت!");
        }
    }
};