export default {
    name: "اكس_اوه",
    aliases: ["xo", "تيك_تاك_تو"],
    description: "لعبة XO بين عضوين",
    category: "games",

    async run({ sock, m, reply, args, userJid }) {
        const chatId = m.key.remoteJid;
        const games = global.xoGames || {};
        global.xoGames = games;

        // استخراج المنشن بشكل صحيح
        let mentionedJid = null;
        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            mentionedJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (args[0] && args[0].includes('@')) {
            mentionedJid = args[0].replace('@', '') + '@s.whatsapp.net';
        } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            mentionedJid = m.message.extendedTextMessage.contextInfo.participant;
        }

        if (!mentionedJid) {
            return reply(`
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
      *⌬ لـعـبـة XO الـشـهـيـرة ⌬*
*───━━━⊱  🎮  ⊰━━━───*

*⌠📜⌡ طريقة اللعب:*
*┌─────────────────────────────────┐*
*│ 1⃣ .اكس_اوه @منشن*
*│ 2⃣ العضو يرد بـ .موافقة*
*│ 3⃣ اللعب باختيار رقم الخلية*
*└─────────────────────────────────┘*

*⌠🎯⌡ قـوانـين الـلـعـبة:*
*┌─────────────────────────────────┐*
*│ • اللوحة مكونة من 9 خلايا*
*│ • الخلايا مرقمة من 1 إلى 9*
*│ ┌───┬───┬───┐*
*│ │ 1 │ 2 │ 3 │*
*│ ├───┼───┼───┤*
*│ │ 4 │ 5 │ 6 │*
*│ ├───┼───┼───┤*
*│ │ 7 │ 8 │ 9 │*
*│ └───┴───┴───┘*
*│*
*│ • الـمتـحـدي يلعب بـ ❌*
*│ • الـمـتـحـدي إلـيـه يلعب بـ ⭕*
*│*
*│ طـرق الـفـوز:*
*│ أفقياً: (1-2-3) (4-5-6) (7-8-9)*
*│ عمودياً: (1-4-7) (2-5-8) (3-6-9)*
*│ قطرياً: (1-5-9) (3-5-7)*
*│*
*│ • أول 3 في صف يفوز*
*│ • لو امتلأت اللوحة بدون فائز = تعادل*
*└─────────────────────────────────┘*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`);
        }

        const player1 = userJid;
        const player2 = mentionedJid;

        if (player1 === player2) {
            return reply("*❌ لا يمكنك لعب XO مع نفسك!*");
        }

        // التحقق من وجود لعبة قديمة
        if (games[chatId]) {
            return reply("*⚠️ هناك لعبة XO جارية بالفعل في هذه المجموعة!*");
        }

        // تخزين طلب اللعب
        games.pending = {
            chatId,
            player1,
            player2,
            time: Date.now()
        };

        // إرسال طلب الموافقة
        const askMsg = await sock.sendMessage(chatId, {
            text: `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
      *⌬ طـلـب مـبـارزة XO ⌬*
*───━━━⊱  ⚔️  ⊰━━━───*

*👤 الـمـتـحـدي : ⦓ @${player1.split('@')[0]} ⦔ (❌)*
*👤 الـمـتـحـدي إلـيـه : ⦓ @${player2.split('@')[0]} ⦔ (⭕)*

*⌠⏳⌡ الرد بـ .موافقة للقبول*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`,
            mentions: [player1, player2]
        });

        games.pending.msgId = askMsg.key.id;

        // حذف الطلب بعد 60 ثانية
        setTimeout(() => {
            if (games.pending && games.pending.chatId === chatId) {
                delete games.pending;
                sock.sendMessage(chatId, { text: "*⌠⏰⌡ لم يتم الرد على طلب اللعب، تم الإلغاء.*" });
            }
        }, 60000);
    }
};