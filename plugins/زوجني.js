export default {
    name: "زوجني",
    description: "يختار لك شريك/ة عشوائي من المجموعة",
    category: "ترفيه",

    async run({ sock, m, reply, userJid }) {
        const chatId = m.key.remoteJid;
        const sender = userJid || m.sender || m.key.participant;

        if (!chatId.endsWith('@g.us')) return reply("⚠️ هذا الأمر يعمل داخل المجموعات فقط!");

        try {
            // جلب بيانات المجموعة والأعضاء
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;

            if (participants.length < 3) return reply("❌ المجموعة صغيرة جداً، أحتاج لعدد أكبر من الأعضاء لإيجاد شريك لك!");

            // استبعاد البوت والمستخدم نفسه
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const availableUsers = participants.filter(p => p.id !== sender && p.id !== botJid).map(p => p.id);

            if (availableUsers.length === 0) return reply("❌ لا يوجد أعضاء مناسبين للزواج في هذه المجموعة!");

            // اختيار شريك عشوائي
            const partner = availableUsers[Math.floor(Math.random() * availableUsers.length)];
            
            // تحديد الجنس عشوائي (للمتعة)
            const genders = ["العريس", "العروسة", "الزوج", "الزوجة"];
            const randomGender = genders[Math.floor(Math.random() * genders.length)];
            
            // تفاصيل الزواج العشوائية
            const locations = ["القصر الملكي 🏰", "جزر القمر 🏝️", "قاعة الماسة 💎", "باريس 🇫🇷", "اليونان 🏛️", "سطوح الجيران 🏠", "أرض الأحلام ✨"];
            const randomLoc = locations[Math.floor(Math.random() * locations.length)];
            
            const mahr = ["100 مليون حسنة", "سيارة فيراري 🏎️", "بيت في الجنة إن شاء الله", "كيلو ذهب 💰", "بوكس شيكولاتة 🍫", "قلب صادق ❤️", "عمر من السعادة 🎁"];
            const randomMahr = mahr[Math.floor(Math.random() * mahr.length)];
            
            const loveQuotes = [
                "الله يبارك لكم ويسعدكم في دنياكم وآخرتكم 🤍",
                "ألف مبروك عقبال الفرح الحقيقي 🎉",
                "أجمل أقدار الله أن يجمع قلوباً على الخير 💕",
                "كونوا سنداً لبعض في الدنيا وفي الجنة إن شاء الله 🌹",
                "أتمنى لكما حياة مليئة بالحب والسعادة 🥂"
            ];
            const randomQuote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];

            await sock.sendMessage(chatId, { react: { text: "💍", key: m.key } });

            const marriageForm = `
*╭━─━─📜  𝐒 𝐎 𝐋 𝐎  📜 ─━─━╮*
*│          💍 قـرار الـقـدر 💍*
*╰━─━─━─━─━─━─━─━─━─━╯*

*┃🔮 بـعـد مـشـورة الأبـراج والـنـجـوم:*


*┃💑 تـم اخـتـيـار ${randomGender} لـك:*

*┃👤 أنـت: ⦓ @${sender.split('@')[0]} ⦔*

*┃🤝 شـريـكـك: ⦓ @${partner.split('@')[0]} ⦔*


*┃💍 الـحـالـة: ⦓  كـتـابـة الـقـدࢪ ⦔*

*┃💰 الـمـهـر: ⦓ ${randomMahr} ⦔*

*┃📍 مـكـان الـزفـاف: ⦓ ${randomLoc} ⦔*

*┃📅 تـاريـخ الـقـدر: ⦓ ${new Date().toLocaleDateString('ar-EG')} ⦔*

*╰━━━──━━━─━──━──━──━━╯*

*┃📣 ${randomQuote}*

*┃💔 لا طـلاق إلا بـأمـر الله*

*╰─━─⊱  𝐒𝐎𝐋𝐎 𝐒𝐇𝐈𝐄𝐋𝐃  ⊰─━─╯*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            await sock.sendMessage(chatId, { 
                text: marriageForm, 
                mentions: [sender, partner] 
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            reply("❌ حدث خطأ أثناء البحث عن شريك حياتك، يبدو أن القدر لم يقرر بعد!");
        }
    }
};