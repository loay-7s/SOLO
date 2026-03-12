export default {
    name: "بث",
    aliases: ["اذاعة", "broadcast", "بث_رسمي"],
    description: "بث رسالة لمجموعة محددة",
    developer: true,

    async run({ sock, m, reply, text, args, command }) {
        const chatId = m.key.remoteJid;
        
        if (!text || args.length < 2) {
            return reply(`
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
     *⌬ نـظـام الـبـث عـن بـعـد ⌬*
*───━━━⊱  📡  ⊰━━━───*

*⌠📜⌡ طريقة الاستخدام:*
*┌────────────────*
*│ .بث + ايدي المجموعة + الرسالة*
*└────────────────*

*⌠💡⌡ مثال:*
*┌────────────────*
*│ .بث 123456789@g.us مرحباً*
*└────────────────*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }

        try {
            let groupId = args[0];
            if (!groupId.includes('@g.us')) {
                groupId = `${groupId}@g.us`;
            }
            const message = args.slice(1).join(' ');

            await sock.sendMessage(chatId, { react: { text: "📡", key: m.key } });

            // التحقق من وجود المجموعة
            const metadata = await sock.groupMetadata(groupId);
            
            // ✅ تحديد نوع البث حسب الأمر المستخدم
            const isOfficial = command === 'بث_رسمي' || command === 'broadcast_official';
            
            if (isOfficial) {
                // بث رسمي مع استمارة
                await sock.sendMessage(groupId, {
                    text: `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
     *⌬ بـث رسـمـي مـن الـمـطـور ⌬*
*───━━━⊱  📢  ⊰━━━───*

*⌠📨⌡ الـرسـالـة:*
*┌────────────────*
*│ ${message}*
*└────────────────*

*👤 الـمـرسـل : ⦓ @${chatId.split('@')[0]} ⦔*
*📅 الـتـاريـخ : ⦓ ${new Date().toLocaleDateString('ar-EG')} ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`,
                    mentions: [chatId]
                });
                
            } else {
                // ✅ بث عادي: الرسالة حرفياً بدون أي إضافات
                await sock.sendMessage(groupId, {
                    text: message
                });
            }

            // ✅ لا نرسل أي رد للمطور (ولا "تم البث" ولا أي حاجة)

        } catch (error) {
            // فقط في حالة الخطأ نرسل رسالة
            await reply(`*❌ فشل البث:* المجموعة غير موجودة أو البوت خارجها`);
        }
    }
};