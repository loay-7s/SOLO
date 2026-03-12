export default {
    name: "معلومات_المجموعة",
    aliases: ["المجموعة", "جروب"],

    async run({ sock, bot, m, message }) {
        const client = sock || bot;
        const msg = m || message;
        const chatId = msg.key.remoteJid;

        try {
            await client.sendMessage(chatId, { react: { text: "🪪", key: msg.key } });

            let metadata;
            try {
                metadata = await client.groupMetadata(chatId);
            } catch (e) {
                return client.sendMessage(chatId, { text: "*⚠️ يجب أن يكون البوت مشرفاً للوصول إلى البيانات.*" });
            }

            const participants = metadata.participants || [];
            const admins = participants.filter(p => p.admin).length;
            const owner = metadata.owner || metadata.subjectOwner || "---";
            const date = new Date(metadata.creation * 1000).toLocaleDateString('en-GB');
            
            // جلب الوصف أو وضع نص افتراضي إذا كان فارغاً
            const desc = metadata.desc || "لا يوجد وصف";

            const report = `
*╭─━━  𝐒𝐎𝐋𝐎 𝐌𝐎𝐍𝐈𝐓𝐎𝐑  ━━─╮*
*│*
*│  ◈ اسـم الـمـجـمـوعـة :*
*⦓${metadata.subject}⦔*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*│  ◈ وصف الـمـجـمـوعـة :*

${desc}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*│  ◈ الـمـنـشـئ : ⦓ @${owner.split('@')[0]} ⦔*

*│  ◈ الـتـأسـيـس : ⦓ ${date} ⦔*

*│  ◈ الأعـضـاء : ⦓ ${participants.length} ⦔*

*│  ◈ الـمـشـرفـيـن : ⦓ ${admins} ⦔*
*│*
*╰─━━━━━━━━━━━━━━━━━─╯*
*｢ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐂𝐀𝐍 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 ｣*`.trim();

            // ✅ محاولة جلب صورة المجموعة
            let ppUrl;
            try {
                ppUrl = await client.profilePictureUrl(chatId, 'image');
            } catch {
                ppUrl = null; // إذا ما فيش صورة، نرسل نص فقط
            }

            if (ppUrl) {
                // إرسال الصورة مع النص
                await client.sendMessage(chatId, {
                    image: { url: ppUrl },
                    caption: report,
                    mentions: [owner]
                }, { quoted: msg });
            } else {
                // إرسال نص فقط لو مفيش صورة
                await client.sendMessage(chatId, {
                    text: report,
                    mentions: [owner]
                }, { quoted: msg });
            }

        } catch (err) {
            client.sendMessage(chatId, { text: "*❌ عطل داخلي في النظام.*" });
        }
    }
};