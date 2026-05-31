export default {
    name: "بوتي",
    aliases: ["mybot"],
    category: "مطور",
    developer:true,

    async run({ bot, message }) {
        // إرسال الرد مباشرة بدون انتظار أي عمليات جانبية
        bot.sendMessage(message.key.remoteJid, { 
            text: "*أوامـࢪك يـا مـطـوࢪي🫴🏻🙂‍↕️*" 
        }, { quoted: message });
    }
};