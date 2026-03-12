// ملف: plugins/عضو.js (معدل للمشرفين والمطورين)

export default {
    name: "عضو",
    aliases: ["خفض"],
    description: "تنزيل مشرف إلى عضو عادي.",
    category: "admin",
    usage: ".عضو (رد أو منشن)",
    
    // الصلاحيات الأساسية
    group: true,     // يعمل في المجموعات فقط
   
    async run({ sock, message, reply, args, isDeveloper }) {
        const chatId = message.key.remoteJid;
        
        // ريأكت فوري 👤
        await sock.sendMessage(chatId, { react: { text: "⬇️", key: message.key } });
        
        // --- التحقق من صلاحيات المستخدم (مشرف أو مطور) ---
        const metadata = await sock.groupMetadata(message.key.remoteJid);
        const sender = metadata.participants.find(p => p.id === message.key.participant);
        const isAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';

        if (!isAdmin && !isDeveloper) {
            return reply("*❌ هـذا الأمـر لـلـمـشـرفـيـن فـقـط.*");
        }

        try {
            let target;

            // تحديد الهدف (من الرد أو المنشن)
            const quoted = message.message?.extendedTextMessage?.contextInfo;
            if (quoted?.participant) {
                target = quoted.participant;
            } else {
                const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
                if (mentions?.length > 0) {
                    target = mentions[0];
                }
            }

            // التحقق من وجود هدف
            if (!target) {
                return reply("*❌ قـم بـالـرد عـلـى الـمـشـرف الـذي تـريـد تـنـزيـلـه أو قـم بـعـمـل مـنـشـن لـه.*");
            }

            // التحقق مما إذا كان الهدف هو البوت نفسه
            if (target === sock.user.id) {
                return reply("*🤔 لا يـمـكـنـي تـنـزيـل نـفـسـي.*");
            }

            // التحقق مما إذا كان الهدف مشرفًا بالفعل
            const targetParticipant = metadata.participants.find(p => p.id === target);
            if (!targetParticipant?.admin) {
                return reply("*⚠️ هـذا الـعـضـو لـيـس مـشـرفـاً بـالـفـعـل.*");
            }
            
            // التحقق مما إذا كان الهدف هو مالك المجموعة (لا يمكن تنزيله)
            if (targetParticipant.admin === 'superadmin') {
                return reply("*❌ لا يـمـكـن تـنـزيـل مـالـك الـمـجـمـوعـة.*");
            }

            // تنفيذ التنزيل
            await sock.groupParticipantsUpdate(message.key.remoteJid, [target], "demote");
            
            // 🎨 تصميم فخم مع منشن (كل الكلام عريض)
            const successMessage = 
`*⎔┄┄─ ⊱╎⌯ 𝑺𝑶𝑳𝑶 ⌯╎⊰─┄┄⎔*

*┋ تـم سـحـب الإشـࢪاف بـنـجـاح ┋*

*⎔┄┄─── ⊱╎⌯ 👑 ⌯╎⊰ ───┄┄⎔*

*┋ الـعـضـو : ⦓ @${target.split('@')[0]} ⦔*

*┋ الـمـسـتـوى : ⦓ عـضـو ⦔*

*⎔┄┄─ ⊱╎⌯ 👤 ⌯╎⊰─┄┄⎔*`;

            // إرسال رسالة نجاح مع منشن للشخص الذي تم تنزيله
            await sock.sendMessage(chatId, { 
                text: successMessage, 
                mentions: [target] 
            }, { quoted: message });

            // ريأكت نجاح ✅
            await sock.sendMessage(chatId, { react: { text: "✅", key: message.key } });

        } catch (error) {
            console.error("Error in 'عضو' command:", error);
            
            // 🎨 تصميم فخم للخطأ (كل الكلام عريض)
            const errorMsg = 
`*❌ خـلـيـنـي مـشـࢪف الأول يـا عـبـيـط*`;

            // التعامل مع الأخطاء الشائعة
            if (error.message.includes('not-admin')) {
                await reply(errorMsg);
            } else {
                await reply(errorMsg);
            }
        }
    }
};