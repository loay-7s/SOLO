import fs from 'fs-extra';

export default {
    name: "تصفير",
    aliases: ["ازالة_الاموال", "صفر"],
    description: "تصفير أموال عضو معين",
    developer: true, // للمطور فقط

    async run({ sock, m, reply, args, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            // استخراج الهدف (منشن أو رد)
            let targetJid = null;
            
            // 1. التحقق من وجود منشن
            if (args[0] && args[0].includes('@')) {
                targetJid = args[0].replace('@', '') + '@s.whatsapp.net';
            }
            // 2. التحقق من الرد على رسالة
            else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
                targetJid = m.message.extendedTextMessage.contextInfo.participant;
            }
            // 3. التحقق من وجود منشن في السياق
            else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }

            if (!targetJid) {
                return reply(`
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
     *⌬ نـظـام تـصـفـيـر الأمـوال ⌬*
*───━━━⊱  💰  ⊰━━━───*

*⌠📜⌡ طريقة الاستخدام:*
*┌─────────────────────────────┐*
*│ • .تصفير @منشن*
*│ • رد على رسالة العضو + .تصفير*
*└─────────────────────────────┘*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
            }

            // تنظيف JID
            const cleanTarget = targetJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";

            // قراءة ملف البنك
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};

            // التحقق من وجود المستخدم
            if (!bankDB[cleanTarget]) {
                return reply(`*❌ لا يوجد حساب بنكي لهذا المستخدم.*`);
            }

            // حفظ المبلغ القديم قبل التصفير (للتأكيد)
            const oldMoney = bankDB[cleanTarget].money || 0;

            // تصفير الأموال
            bankDB[cleanTarget].money = 0;
            
            // حفظ التغييرات
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "💰", key: m.key } });

            const resultMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   *⌬ تـم تـصـفـيـر الأمـوال بـنـجـاح ⌬*
*───━━━⊱  💸  ⊰━━━───*

*👤 الـمـسـتـخـدم : ⦓ @${cleanTarget.split('@')[0]} ⦔*

*💰 الـمـبـلـغ الـسـابـق : ⦓ ${oldMoney.toLocaleString()} 🪙 ⦔*

*💸 الـمـبـلـغ بـعـد الـتـصـفـيـر : ⦓ 0 🪙 ⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            await sock.sendMessage(chatId, { 
                text: resultMsg, 
                mentions: [cleanTarget] 
            }, { quoted: m });

        } catch (error) {
            console.error("Error in 'تصفير' command:", error);
            await reply(`❌ *حدث خطأ:*\n${error.message}`);
        }
    }
};