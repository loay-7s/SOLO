import { config } from '../config.js';

export default {
    name: "برفكس",
    aliases: ["تغيير_البرفكس", "setprefix"],
    category: "owner",
    developer: true,

    async run({ bot, sock, m, text, userJid }) {
        const chatId = m.key.remoteJid;

        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "｢ ⚠️ ｣ *يـࢪجـى تـحـديـد الـمـشـغـل الـجـديـد.. مـثـال: .برفكس # أو .برفكس 👑*" 
            }, { quoted: m });
        }

        const oldPrefix = config.PREFIX;
        const newPrefix = text.trim();
        
        // تغيير البرفكس في الكائن الأصلي
        config.PREFIX = newPrefix;
        
        // تغيير البرفكس في كائن البوت (الأهم)
        if (bot && bot.config) {
            bot.config.PREFIX = newPrefix;
        }

        const response = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*

*⚙️┇ تـغـيـيـࢪ الـنـظـام ┇⚙️*

*⎔┄┄─── ⊱╎⌯ 🏮 ⌯╎⊰ ───┄┄⎔*

*✅ تـم تـغـيـيـࢪ الـمـشـغـل بـنـجـاح*

*⬅️ الـقـديـم : ⦓ ${oldPrefix} ⦔*

*➡️ الـجـديـد : ⦓ ${newPrefix} ⦔*

*⚠️ مـلاحظة: جـمـيـع الأوامـࢪ تـسـتـجـيـب الآن لـ ⦓ ${newPrefix} ⦔*

*⎔┄┄── ⊱╎⌯ 👑 ⌯╎⊰ ──┄┄⎔*`.trim();

        await sock.sendMessage(chatId, { react: { text: "⚙️", key: m.key } });
        
        await sock.sendMessage(chatId, { 
            text: response, 
            mentions: [userJid] 
        }, { quoted: m });
    }
};