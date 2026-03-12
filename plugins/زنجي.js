export default {
    name: "زنجي",
    aliases: ["الزنجي"],
    category: "fun",
    group: true, // يعمل في المجموعات فقط

    async run({ sock, m }) {
        const chatId = m.key.remoteJid;

        // 1. الحصول على بيانات الجروب والأعضاء
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        // 2. اختيار عضو عشوائي من القائمة
        const randomUser = participants[Math.floor(Math.random() * participants.length)];
        const jid = randomUser.id;

        // 3. إرسال الرسالة مع المنشن
        const text = `*☜@${jid.split("@")[0]} انـت هـو اكبـر زنجي👶🏿*`;

        await sock.sendMessage(chatId, { 
            text: text, 
            mentions: [jid] 
        }, { quoted: m });
    }
};