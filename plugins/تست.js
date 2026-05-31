export default {
    name: "تست",
    aliases: ["test", "بوت"],
    category: "عام",

    async run({ bot, message }) {
        // إرسال الرد مباشرة بدون انتظار أي عمليات جانبية
        bot.sendMessage(message.key.remoteJid, { 
            text: "*𝑺𝑶𝑳𝑶 𝑩𝑶𝑻 𝑰𝑺 𝑰𝑵 𝑪𝑶𝑵𝑻𝑹𝑶𝑳*" 
        }, { quoted: message });
    }
};