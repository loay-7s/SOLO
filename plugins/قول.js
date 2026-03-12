export default {
    name: "صوت",
    aliases: ["قول"],
    category: "tools",

    async run({ bot, message, args, reply, react }) {
        const jid = message.key.remoteJid;
        const text = args.join(" ");

        if (!text) return reply("⚠️ *اكـتـب الـنـص بـعـد الأمـر [.قول سولو عمي]*");

        try {
            await react("🗣");

            // اللهجة السعودية (الخليجية)
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar-SA&client=tw-ob`;

            await bot.sock.sendMessage(jid, {
                audio: { url: url },
                mimetype: 'audio/mpeg',
                ptt: true // بصمة صوتية
            }, { quoted: message });

        } catch (error) {
            console.error("Audio Error:", error);
            await reply("❌ *فـشـل تـولـيـد الـصـوت.*");
        }
    }
};