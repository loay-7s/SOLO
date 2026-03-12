export default {
    name: "نرد",
    aliases: ["dice", "زهر"],
    category: "fun",

    async run({ sock, m }) {
        const chatId = m.key.remoteJid;

        // رسم النرد باستخدام بلوكات الإيموجي لضمان التساوي المطلق 100%
        const diceShapes = {
            1: "⬛⬛⬛⬛⬛\n⬛⬜⬜⬜⬛\n⬛⬜⏺️⬜⬛\n⬛⬜⬜⬜⬛\n⬛⬛⬛⬛⬛",
            2: "⬛⬛⬛⬛⬛\n⬛⏺️⬜⬜⬛\n⬛⬜⬜⬜⬛\n⬛⬜⬜⏺️⬛\n⬛⬛⬛⬛⬛",
            3: "⬛⬛⬛⬛⬛\n⬛⏺️⬜⬜⬛\n⬛⬜⏺️⬜⬛\n⬛⬜⬜⏺️⬛\n⬛⬛⬛⬛⬛",
            4: "⬛⬛⬛⬛⬛\n⬛⏺️⬜⏺️⬛\n⬛⬜⬜⬜⬛\n⬛⏺️⬜⏺️⬛\n⬛⬛⬛⬛⬛",
            5: "⬛⬛⬛⬛⬛\n⬛⏺️⬜⏺️⬛\n⬛⬜⏺️⬜⬛\n⬛⏺️⬜⏺️⬛\n⬛⬛⬛⬛⬛",
            6: "⬛⬛⬛⬛⬛\n⬛⏺️⬜⏺️⬛\n⬛⏺️⬜⏺️⬛\n⬛⏺️⬜⏺️⬛\n⬛⬛⬛⬛⬛"
        };

        try {
            await sock.sendMessage(chatId, { react: { text: "🎲", key: m.key } });

            const result = Math.floor(Math.random() * 6) + 1;
            const finalShape = diceShapes[result];

            // رسالة الفيلق: نظيفة، متساوية، وبدون منشن
            let msg = `✨ *『𝑫𝑰𝑪𝑬 🎲 𝑳𝑼𝑪𝑲』* ✨\n\n`;
            msg += `${finalShape}\n\n`;
            msg += `🎲 *الـنـتـيـجـة: [ ${result} ]*\n\n`;
            msg += `*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await sock.sendMessage(chatId, { text: msg }, { quoted: m });

        } catch (e) {
            console.error("Dice Pixel Error:", e);
        }
    }
};
