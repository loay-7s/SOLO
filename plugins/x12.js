import fs from 'fs-extra';

export default {
    name: "رهان",
    aliases: ["قامر", "حظ"],
    category: "economy",

    async run({ sock, m, text, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            // 1. تنظيف المعرف والتحقق من المدخلات
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            const args = text.trim().split(/\s+/);
            const betAmount = parseInt(args[0]);

            if (!betAmount || isNaN(betAmount) || betAmount < 50) {
                return await sock.sendMessage(chatId, { 
                    text: "｢ ⚠️ ｣ *يـرجـى تـحـديـد مـبـلـغ صـحـيـح لـلـرهـان (الـحـد الأدنى 50 عـمـلـة).*\n*مـثـال: .رهان 100*" 
                }, { quoted: m });
            }

            // 2. قراءة البيانات والتحقق من الرصيد والمخزن
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            let userData = bankDB[cleanId] || bankDB[userJid] || { money: 0, rank: "عضو مكافح 🌱", inventory: [] };

            if (userData.money < betAmount) {
                await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ❌ ｣ رصـيـدك لا يـكـفـي لـهـذه الـمـخـاطـرة!*\n*رصـيـدك الـحـالـي: ⦓ ${userData.money.toLocaleString()} 🪙 ⦔*` 
                }, { quoted: m });
            }

            // 3. التحقق من وجود حقنة الحظ
            const needleName = "حقنة الحظ 💉";
            const hasNeedle = userData.inventory && userData.inventory.includes(needleName);
            
            // تحديد نسبة الفوز (0.7 إذا ملك الحقنة، و 0.5 للوضع العادي)
            const winChance = hasNeedle ? 0.7 : 0.5;
            const isWin = Math.random() < winChance;

            let resultMessage = "";
            let reaction = "";
            let extraNote = "";

            if (hasNeedle) {
                // استهلاك الحقنة من المخزن
                userData.inventory = userData.inventory.filter(item => item !== needleName);
                extraNote = `\n*💉 تـم اسـتـخـدام حـقـنـة الـحـظ (الـنـسـبـة 70%)*`;
            }

            if (isWin) {
                userData.money += betAmount;
                reaction = "🟢";
                resultMessage = `*❑ نـتـيـجـة مـذهـلـة.. لـقـد فـزت! 🎉*\n*💰 الأربـاح : ⦓ ${betAmount.toLocaleString()} 🪙 ⦔*`;
            } else {
                userData.money -= betAmount;
                reaction = "🔴";
                resultMessage = `*❑ لـقـد خـسـرت رهـانـك.. حـظـاً أوفـر! 💀*\n*📉 الـخـسـارة : ⦓ ${betAmount.toLocaleString()} 🪙 ⦔*`;
            }

            // حفظ التغييرات في الهوية المنظفة
            bankDB[cleanId] = userData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            // 4. إرسال النتيجة بتنسيق سولو المعتاد (3 أجزاء)
            await sock.sendMessage(chatId, { react: { text: reaction, key: m.key } });

            const betTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯⦔───┄┄⎔*

*★┇ طـاولـة الـرهـان الـمـلـكـيـة ┇★*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*👤 الـمـقـامـر : ⦓ @${userJid.split('@')[0]} ⦔*

${resultMessage}${extraNote}

*⎔┄┄─── ⊱╎⌯ 💸 ⌯╎⊰ ───┄┄⎔*

*🏦 رصـيـدك الـآن : ⦓ ${userData.money.toLocaleString()} 🪙 ⦔*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { 
                text: betTemplate, 
                mentions: [userJid] 
            }, { quoted: m });

        } catch (e) {
            console.error("Betting Error:", e);
        }
    }
};