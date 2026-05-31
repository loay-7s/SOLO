export default {
    name: "سرعة",
    aliases: ["بنج", "ping"],
    
    run: async ({ bot, message }) => {
        // بدء الحساب بدقة نانو ثانية عالية
        const start = process.hrtime();
        const chatId = message.key.remoteJid;

        // إرسال رد فعل سريع لإثبات الوجود (ويتم قياس الوقت بناءً عليه)
        await bot.sendMessage(chatId, { react: { text: "⚡", key: message.key } });

        // نهاية الحساب وتحويله لملي ثانية بدقة 3 أرقام عشرية
        const diff = process.hrtime(start);
        const ping = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

        const report = `
*╭─━━━━  𝐒𝐎𝐋𝐎 𝐑𝐀𝐃𝐀𝐑  ━━━─╮*
*│*
*│  ◈ الـحـالـة :  𝐎𝐍𝐋𝐈𝐍𝐄 ⚡*

*│  ◈ الـسـرعـة :  ${ping} 𝐌𝐒*

*│  ◈ الـنـظـام :  𝐒𝐎𝐋𝐎 𝐕⑤*
*│*
*╰─━━━━━━━━━━━━━━━━━━─╯*
*｢ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐒 𝐔𝐍𝐒𝐓𝐎𝐏𝐏𝐀𝐁𝐋𝐄 ｣*`.trim();

        bot.sendMessage(chatId, { text: report }, { quoted: message });
    }
};