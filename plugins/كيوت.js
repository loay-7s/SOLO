export default {
    name: "كيوت",
    aliases: ["كياتة", "لطيف"],
    category: "fun",
    group: true,

    async run({ sock, m }) {
        const chatId = m.key.remoteJid;

        // 1. قائمة ريأكتات الكياتة
        const reacts = ["🎀", "🥹", "✨", "🧸", "🌸"];
        const randomReact = reacts[Math.floor(Math.random() * reacts.length)];
        await sock.sendMessage(chatId, { react: { text: randomReact, key: m.key } });

        try {
            // 2. سحب قائمة الاعضاء
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;

            // 3. اختيار ضحية عشوائية
            const randomUser = participants[Math.floor(Math.random() * participants.length)];
            const jid = randomUser.id;

            // 4. بنك جمل الكياتة (بدون همزات)
            const cuteMessages = [
                `*يا @${jid.split("@")[0]} انت هو قمة الكياتة في الجروب ده🥹🎀✨*`,
                `*اثبتّ مكانك يا @${jid.split("@")[0]} انت الطف واحد شفته النهاردة 🧸🌸*`,
                `*يا ناس شوفوا @${jid.split("@")[0]} بجد سكر وكيوت بزيادة 🍭✨*`,
                `*الجروب ده منور بوجود كائن لطيف زي @${jid.split("@")[0]} 💖🎀*`,
                `*يا @${jid.split("@")[0]} خف كياتة شوية مش مستحملين الرقة دي 🥹✨*`,
                `*@${jid.split("@")[0]} انت عبارة عن قطعة سكر ماشية على الارض 🍬🎀*`
            ];

            const randomText = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];

            await sock.sendMessage(chatId, { 
                text: randomText, 
                mentions: [jid] 
            }, { quoted: m });

        } catch (e) {
            console.error("Error in Cute Command:", e);
        }
    }
};