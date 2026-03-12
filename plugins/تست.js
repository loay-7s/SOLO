export default {
    name: "تست",
    aliases: ["test", "بوت"],
    category: "عام",

    async run({ bot, message }) {
        // إرسال الرد مباشرة بدون انتظار أي عمليات جانبية
        bot.sendMessage(message.key.remoteJid, { 
            text: "*𝐒𝐎𝐋𝐎 𝐁𝐎𝐓 𝐈𝐒 𝐈𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋*" 
        }, { quoted: message });
    }
};