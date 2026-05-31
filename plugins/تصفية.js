export default {
    name: "تصفية",
    aliases: ["تطهير", "طرد_الكل", "مسح_الكل"],
    description: "يطرد جميع أعضاء المجموعة فوراً (للمشرفين فقط)",
    category: "admin",
    group: true,
    admin: true,      // للمشرفين فقط
    botAdmin: true,   // يجب أن يكون البوت مشرفاً

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
            console.error("❌ خطأ في جلب معلومات المجموعة:", error);
            return reply("*❌ خـلـيـنـي مـشـرف الأول*");
        }

        await react("🧹");

        try {
            const groupMetadata = await bot.sock.groupMetadata(jid);
            const participants = groupMetadata.participants || [];
            const botJid = bot.sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // ✅ استبعاد المشرفين والمالك والبوت نفسه
            const victims = participants
                .filter(p => {
                    // استبعاد البوت نفسه
                    if (p.id === botJid) return false;
                    // استبعاد المالك
                    if (p.id === groupMetadata.owner) return false;
                    // استبعاد المشرفين الآخرين
                    if (p.admin === 'admin' || p.admin === 'superadmin') return false;
                    return true;
                })
                .map(p => p.id);

            if (victims.length === 0) {
                return reply("*📭 لا يـوجـد أعـضـاء لـطـردهـم*");
            }

            // ✅ رسالة البداية
            const startMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🧹 نـظـام الـتـصـفـيـة*

*───━━━⊱  ⚠️  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*👥 الأعـضـاء الـمـسـتـهـدفـيـن:* ⦓ *${victims.length}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*⏳ جـاري الـتـصـفـيـة...*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await reply(startMsg);

            // ✅ تنفيذ الطرد على دفعات
            let kicked = 0;
            let failed = 0;
            
            for (let i = 0; i < victims.length; i += 10) {
                const batch = victims.slice(i, i + 10);
                try {
                    await bot.sock.groupParticipantsUpdate(jid, batch, "remove");
                    kicked += batch.length;
                    
                    // تأخير بين الدفعات
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (e) {
                    failed += batch.length;
                    console.error(`❌ فشل طرد دفعة:`, e);
                }
            }

            // ✅ رسالة النتيجة
            const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🧹 تـمـت الـتـصـفـيـة*

*───━━━⊱  ✅  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*✅ تـم طـرد:* ⦓ *${kicked}* ⦔ عـضـو

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*💠 الـمـجـمـوعـة الآن نـظـيـفـة*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: resultMsg,
                mentions: [userJid]
            }, { quoted: message });

            await react("✅");

        } catch (error) {
            console.error("❌ خطأ في أمر تصفية:", error);
            
            const errorMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*❌ فـشـل الـتـصـفـيـة*

*───━━━⊱  ⚠️  ⊰━━━───*

*📋 الأسباب المحتملة:*

*• الـبـوت لـيـس مـشـرفـاً*
*• مـشـكـلة فـي الـاتـصـال*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: errorMsg,
                mentions: [userJid]
            }, { quoted: message });
        }
    }
};