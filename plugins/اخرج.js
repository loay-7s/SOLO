export default {
    name: "مغادرة",
    aliases: ["اخرج", "leave"],
    description: "يغادر البوت المجموعة بصمت",
    category: "group",
    developer: true,
    group: true,

    async run({ bot, message, isGroup, userJid, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return;
        }

        await react("👋");
        
        // بصمت تام بدون أي رسالة
        setTimeout(async () => {
            await bot.sock.groupLeave(jid);
        }, 1000);
    }
};