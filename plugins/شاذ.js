export default {
    name: "شاذ",
    aliases: ["شواذ", "ملك_الشواذ"],
    description: "اختيار عضو عشوائي ليكون ملك الشواذ",
    category: "fun",

    async run({ sock, m, reply }) {
        const chatId = m.key.remoteJid;
        
        try {
            // التحقق من أن المجموعة
            if (!chatId.endsWith('@g.us')) {
                return reply("*❌ هذا الأمر يعمل فقط في المجموعات!*");
            }

            // جلب أعضاء المجموعة
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            
            // استبعاد البوت نفسه من الاختيار
            const botJid = sock.user?.id;
            const members = participants.filter(p => p.id !== botJid);
            
            if (members.length === 0) {
                return reply("*❌ لا يوجد أعضاء في المجموعة!*");
            }

            // اختيار عضو عشوائي
            const randomMember = members[Math.floor(Math.random() * members.length)];
            const randomJid = randomMember.id;
            const displayNumber = randomJid.split('@')[0];

            // قائمة الرسائل (كلها تبدأ بـ ☜@منشن)
            const messages = [
                `*☜ @${displayNumber} انـت هـو مـلـك الـشـواذ 🏳️‍🌈*`,
                `*☜ @${displayNumber} هـتـبـقـى ࢪاجـل امـتـى؟🏳️‍🌈*`,
                `*☜ @${displayNumber} الشـواذ كـتـيـࢪ بـس ده اكـبـࢪهـم 🏳️‍🌈*`,
                `*☜ @${displayNumber} اهـو الـشـاذ يـعـم [اسـتـࢪ يـا دولـي] 🏳️‍🌈*`,
                `*☜ @${displayNumber} فـخـر الـشـواذ يـا عـم 🏳️‍🌈*`,
                `*☜ @${displayNumber} تـاج الـشـواذ ع راسـك يـا ﺛـﻮري 🏳️‍🌈*`,
            ];

            await sock.sendMessage(chatId, { react: { text: "🏳️‍🌈", key: m.key } });

            // اختيار سطر عشوائي واحد فقط
            const randomIndex = Math.floor(Math.random() * messages.length);
            const randomMessage = messages[randomIndex];

            // إرسال سطر واحد فقط
            await sock.sendMessage(chatId, { 
                text: randomMessage, 
                mentions: [randomJid] 
            }, { quoted: m });

        } catch (error) {
            console.error("Error in 'شاذ' command:", error);
            await reply(`❌ *حدث خطأ:*\n${error.message}`);
        }
    }
};