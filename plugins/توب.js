export default {
    name: "توب",
    aliases: ["top", "أفضل", "تصنيف"],
    description: "اختيار أفضل 10 أعضاء في فئة معينة",
    category: "group",
    group: true,

    async run({ bot, message, isGroup, userJid, args, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("*❌ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        // ✅ الكلمة اللي كتبها المستخدم بعد "توب"
        let category = args.join(" ") || "الأعـضـاء";

        await react("🏆");

        try {
            // جلب بيانات المجموعة
            const groupMetadata = await bot.sock.groupMetadata(jid);
            const participants = groupMetadata.participants || [];
            
            // استبعاد البوت نفسه
            const botJid = bot.sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const members = participants.filter(p => p.id !== botJid).map(p => p.id);
            
            if (members.length === 0) {
                return reply("*📭 لا يـوجـد أعـضـاء لـلـتـصـنـيـف*");
            }

            // اختيار 10 أعضاء عشوائيين
            const shuffled = [...members];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            const selected = shuffled.slice(0, Math.min(10, members.length));
            
            // تجهيز القائمة
            let membersList = '';
            selected.forEach((member, index) => {
                const number = member.split('@')[0];
                membersList += `*${index + 1}.* ⦓ *@${number}* ⦔\n`;
            });

            // ✅ التصنيف هو نفس الكلمة اللي كتبها المستخدم
            const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🏆 تـوب ${category}*

*───━━━⊱  📋  ⊰━━━───*

*🎯 الـمـخـتـارون:* ⦓ *${selected.length}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📌 قـائـمـة تـوب ${category}:*

${membersList}
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: resultMsg,
                mentions: selected
            }, { quoted: message });

            await react("🏆");

        } catch (error) {
            console.error("❌ خطأ في أمر توب:", error);
            await reply("*❌ فـشـل اخـتـيـار الأعـضـاء*");
        }
    }
};