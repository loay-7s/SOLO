export default {
    name: "طرد",
    aliases: ["kick", "remove"],
    category: "admin",
    group: true,

    async run({ sock, message, reply, handler }) {
        try {
            const chatId = message.key.remoteJid;
            const senderId = message.sender || message.key.participant;

            // 1. تحديد الضحية
            const quoted = message.message?.extendedTextMessage?.contextInfo;
            let target = quoted?.participant || message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            if (!target) return reply("*⚠️ مـنـشـنـلـي الـعـضـو الاول عـشـان اࢪمـيـه بـࢪه*");

            // 2. التحقق من الصلاحيات
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            
            const senderData = participants.find(u => u.id.split('@')[0] === senderId.split('@')[0]);
            const victimData = participants.find(u => u.id.split('@')[0] === target.split('@')[0]);

            const isSenderAdmin = senderData?.admin === 'admin' || senderData?.admin === 'superadmin';
            const isVictimAdmin = victimData?.admin === 'admin' || victimData?.admin === 'superadmin';
            const isDeveloper = handler.isDeveloper(senderId);

            // 3. شروط المنع
            if (!isSenderAdmin && !isDeveloper) {
                return reply("*⚠️ الامـࢪ ده لـلـمـشـࢪفـيـن بـس يـا اهـبـل*");
            }

            if (isVictimAdmin && !isDeveloper) {
                return reply("*❌ ده مـشـࢪف زيـك يـا عـبـيـط*");
            }

            // ✅ التحقق من LID البوت المميز
            const specialLID = "169544471589011@lid";
            
            if (target === specialLID) {
                return reply("*❌ عـايـز تـطـࢪدنـي انـا؟ خـخ ده انـا الـلـي شـايـل الـجـࢪوب عـلـى كـتـافـي يـا بـقـف*");
            }

            // 4. الرسالة الأولى (تنسيق الحروف)
            await sock.sendMessage(chatId, { react: { text: "✈️", key: message.key } });
            await reply("*جـاࢪي تـنـظـيـف الـجـࢪوب🧹..*");

            // 5. التنفيذ
            const response = await sock.groupParticipantsUpdate(chatId, [target], "remove");

            // 6. الرسالة الثانية (سخرية مباشرة بدون منشن)
            if (response[0]?.status === "200" || response[0]?.status === undefined) {
                const insults = [
                    "*الـلـي بـعـده.. حـد تـانـي عـاوز يـجـࢪب يـطـيـࢪ؟* ✈️",
                    "*تـم الـاࢪسـال الـى الـمـࢪيـخ بـنـجـاح..* 🚀"
                ];
                const randomInsult = insults[Math.floor(Math.random() * insults.length)];
                
                await reply(randomInsult);
            }

        } catch (error) {
            console.error(error);
            await reply("*❌ خـخ خـلـيـنـي مـشـࢪف الأول عـشـان اطـࢪده يـا عـبـيـط*");
        }
    }
};