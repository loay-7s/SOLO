// ملف: plugins/ادمن.js (معدل للمشرفين والمطورين)

export default {
    name: "ادمن",
    aliases: ["admin"],
    description: "ترقية عضو إلى مشرف.",
    category: "admin",
    usage: ".ادمن (رد أو منشن)",
    
    // الصلاحيات الأساسية
    group: true,     // يعمل في المجموعات فقط
   
    async run({ sock, message, reply, args, isDeveloper }) {
        const chatId = message.key.remoteJid;
        
        // ✅ ريأكت صحيح - بدون مسافات
        await sock.sendMessage(chatId, { react: { text: "🔱", key: message.key } });
        
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
                return reply("*❌ قـم بـالـرد عـلـى الـشـخـص الـذي تـريـد تـرقـيـتـه أو قـم بـعـمـل مـنـشـن لـه.*");
            }

            // التحقق مما إذا كان الهدف هو البوت نفسه
            if (target === sock.user.id) {
                return reply("*🤔 لا يـمـكـنـي تـرقـيـة نـفـسـي، أنـا مـشـرف بـالـفـعـل (أو يـجـب أن أكـون).*");
            }

            // التحقق مما إذا كان الهدف مشرفًا بالفعل
            const targetParticipant = metadata.participants.find(p => p.id === target);
            if (targetParticipant?.admin) {
                return reply("*⚠️ هـذا الـعـضـو مـشـرف بـالـفـعـل.*");
            }

            // تنفيذ الترقية
            await sock.groupParticipantsUpdate(message.key.remoteJid, [target], "promote");
            
            // 🎨 تصميم فخم مع منشن (كل الكلام عريض)
            const successMessage = 
`*⎔┄┄─ ⊱╎⌯ 𝑺𝑶𝑳𝑶 ⌯╎⊰─┄┄⎔*

*┋ تـم الـتـرقـيـة بـنـجـاح ┋*

*⎔┄┄─── ⊱╎⌯ 👑 ⌯╎⊰ ───┄┄⎔*

*┋ الـعـضـو : ⦓ @${target.split('@')[0]} ⦔*

*┋ الـمـسـتـوى : ⦓ مـشـرف ⦔*

*⎔┄┄─ ⊱╎⌯ 🛡️ ⌯╎⊰─┄┄⎔*`;

            // إرسال رسالة نجاح مع منشن للشخص الذي تمت ترقيته
            await sock.sendMessage(chatId, { 
                text: successMessage, 
                mentions: [target] 
            }, { quoted: message });

            // ريأكت نجاح ✅
            await sock.sendMessage(chatId, { react: { text: "✅", key: message.key } });

        } catch (error) {
            console.error("Error in 'ادمن' command:", error);
            
            // تصميم فخم للخطأ (كل الكلام عريض)
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