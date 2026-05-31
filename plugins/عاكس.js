export default {
    name: "عاكس",
    aliases: ["دلع"],
    description: "معاكسات للبنات مصرية مضحكة 😉",
    category: "fun",
    developer: false,
    group: true,
    private: true,

    async run({ bot, message, args, reply, react, userJid, isGroup }) {
        // تحديد الشخص المستهدف
        let targetJid = null;
        
        // 1. لو رد على رسالة حد
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant || 
                       message.message.extendedTextMessage.contextInfo.quotedMessage?.key?.participant;
        }
        // 2. لو منشن حد
        else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // 3. لو كتب اسم
        else if (args[0]) {
            let arg = args[0].replace('@', '').trim();
            if (arg.length > 5) {
                targetJid = arg.includes('@') ? arg : `${arg}@s.whatsapp.net`;
            }
        }
        
        if (!targetJid) {
            await react("🦦");
            return reply("*❌ مـنـشـن الـبـنـت أو ࢪد على ࢪسـالـتـهـا.*");
        }
        
        const targetName = targetJid.split('@')[0];
        
        await react("😉");
        
        // المعاكسات بين نجمتين والمنشن برا
        const pranks = [
            `@${targetName} *هي مامتك نحلة عشان تجيب العسل ده؟ 😉*`,
            `@${targetName} *اكيد باباكي حلواني!*`,
            `@${targetName} *جبار و مشعلل قلبي نار 🔥*`,
            `@${targetName} *تعرفي ان انا اجمد من وكالة ناسا؟ هما طلعوا القمر لكن انا بكلمه 🌚*`,
            `@${targetName} *مش هتدفعي الإيجار بقى ولا ايه؟ انتِ ساكنة قلبي بقالك كتير 💖*`,
            `@${targetName} *طب واحدة واحدة عشان انتِ اجمل واحدة 🫣*`,
            `@${targetName} *براحة يا غزال جمالك عملوا في الارض زلزال 🙈❤️‍🔥*`
        ];
        
        // اختيار عشوائي
        const randomPrank = pranks[Math.floor(Math.random() * pranks.length)];
        
        await bot.sendMessage(message.key.remoteJid, {
            text: randomPrank,
            mentions: [targetJid]
        }, { quoted: message });
    }
};