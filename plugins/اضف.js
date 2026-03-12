export default {
    name: "اضف",
    aliases: ["add"],
    description: "إضافة عضو جديد للمجموعة بالرقم",
    category: "developer",
    group: true,
    developer: true,

    async run({ sock, m, reply, args }) {
        const chatId = m.key.remoteJid;
        
        if (!args[0]) {
            return reply(`
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
     *⌬ نـظـام إضـافـة الأعـضـاء ⌬*
*───━━━⊱  👥  ⊰━━━───*

*⌠📜⌡ طريقة الاستخدام:*
*┌─────────────────────────────┐*
*│ .اضف +رقم الهاتف*
*│ أمثلة:*
*│ .اضف +201226018783*
*│ .اضف +20 12 26018783*
*│ .اضف 201226018783*
*└─────────────────────────────┘*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }

        try {
            const fullNumber = args.join(' ');
            let phoneNumber = fullNumber.replace(/[\s\+\-\(\)]/g, '');
            
            if (phoneNumber.length < 10) {
                return reply("*❌ رقم غير صالح! يجب أن يكون الرقم صحيحاً مع رمز الدولة.*");
            }

            const newJid = `${phoneNumber}@s.whatsapp.net`;

            await sock.sendMessage(chatId, { react: { text: "➕", key: m.key } });

            try {
                const response = await sock.groupParticipantsUpdate(chatId, [newJid], "add");
                
                // ✅ تمت الإضافة بنجاح
                if (response[0].status === '200') {
                    const successMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   *⌬ تـم إضـافـة الـعـضـو بـنـجـاح ⌬*
*───━━━⊱  ✅  ⊰━━━───*

*👤 الـرقـم : ⦓ ${fullNumber} ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

                    return reply(successMsg);
                } 
                
                // ✅ العضو موجود بالفعل
                else if (response[0].status === '409') {
                    return reply(`*❌ العضو ${fullNumber} موجود بالفعل في المجموعة!*`);
                } 
                
                // ✅ أي حالة أخرى (403, 406, ฯลฯ) → نرسل دعوة خاصة
                else {
                    return await sendInvite(sock, chatId, newJid, fullNumber, reply);
                }
                
            } catch (addError) {
                // ✅ أي خطأ أثناء الإضافة → نرسل دعوة خاصة
                console.log("⚠️ خطأ في الإضافة، سيتم إرسال دعوة:", addError.message);
                return await sendInvite(sock, chatId, newJid, fullNumber, reply);
            }

        } catch (error) {
            console.error("Error in 'اضف' command:", error);
            await reply(`*❌ حدث خطأ:*\n${error.message}`);
        }
    }
};

// ✅ دالة إرسال الدعوة (مشتركة لكل الحالات)
async function sendInvite(sock, chatId, newJid, fullNumber, reply) {
    try {
        const inviteCode = await sock.groupInviteCode(chatId);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        
        // إرسال الدعوة للرقم في الخاص
        await sock.sendMessage(newJid, {
            text: `*╭─━━━━━━━━━━━━━━━─╮*
   *◈ 𝐈𝐍𝐕𝐈𝐓𝐀𝐓𝐈𝐎𝐍 𝐓𝐎 𝐉𝐎𝐈𝐍 ◈*
*╰─━━━━━━━━━━━━━━━─╯*

*📋┇لقد تـمـت دعـوتـك لـلانـضـمام لـمـجـمـوعـة*

*🏛️┇اضـغـط عـلى الـرابـط لـلـدخـول*

*🔗┇${inviteLink}*

*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`
        });

        const inviteMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   *⌬ تـم إرسـال دعـوة لـلـعـضـو ⌬*
*───━━━⊱  📨  ⊰━━━───*

*👤 الـرقـم : ⦓ ${fullNumber} ⦔*

*📋 الـحـالـة : ⦓ لا يمكن إضافته مباشرة ⦔*

*📨 تـم إرسـال رابـط دعـوة لـلـخـاص*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

        return reply(inviteMsg);
    } catch (inviteError) {
        console.error("❌ خطأ في إرسال الدعوة:", inviteError);
        return reply("*❌ فشل إرسال الدعوة، تأكد من أن البوت مشرف*");
    }
}