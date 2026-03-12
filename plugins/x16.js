import fs from 'fs-extra';

export default {
    name: "سطو",
    aliases: ["مخاطرة"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            
            if (!bankDB[cleanId]) bankDB[cleanId] = { money: 0, rank: "عضو مكافح 🌱", lastHeist: 0 };
            let userData = bankDB[cleanId];

            const now = Date.now();
            const cooldown = 3 * 60 * 60 * 1000; // 3 ساعات
            const timeLeft = userData.lastHeist ? (userData.lastHeist + cooldown) - now : 0;

            // 1. التحقق من وقت الانتظار
            if (timeLeft > 0) {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                await sock.sendMessage(chatId, { react: { text: "⏳", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ⏳ ｣ الـشـرطـة تـحـاصر الـمـكـان حـالـيـاً!*\n\n*عـد مـجـدداً بـعـد: ⦓ ${hours} سـاعة و ${minutes} دقـيـقـة ⦔*` 
                }, { quoted: m });
            }

            // منع السطو إذا كان الرصيد صفر
            if (userData.money < 100) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *يـجـب أن تـمـلـك 100 عـمـلـة عـلـى الأقـل لـتـبـدأ الـسـطو!*" });
            }

            // 2. منطق السطو بالنسب المئوية
            const isSuccess = Math.random() < 0.4; // نسبة النجاح 40%
            let amount = 0;
            let resultMessage = "";
            let reaction = "";

            if (isSuccess) {
                // ربح 10% من الرصيد الحالي
                amount = Math.floor(userData.money * 0.10);
                if (amount < 50) amount = 50; // حد أدنى للربح لكي لا يكون تافهاً
                userData.money += amount;
                reaction = "💰";
                resultMessage = `*❑ نـجـاح بـاهـر فـي الـسـطو! 🥷*\n*💰 الأربـاح (10%) : ⦓ +${amount.toLocaleString()} 🪙 ⦔*\n*🔥 الـحـالـة : تـم اخـتـراق الـخـزنـة بـنـجـاح.*`;
            } else {
                // خسارة 5% من الرصيد الحالي
                amount = Math.floor(userData.money * 0.05);
                if (amount < 25) amount = 25; // حد أدنى للخسارة
                userData.money -= amount;
                reaction = "🚨";
                resultMessage = `*❑ فـشـلـت الـخـطـة.. كـمـيـن مـفـاجئ! 🚨*\n*📉 الـغـرامـة (5%) : ⦓ -${amount.toLocaleString()} 🪙 ⦔*\n*⚠️ الـحـالـة : هـربـت بـجـلـدك ولـكـن خـسـرت أمـوالـك.*`;
            }

            userData.lastHeist = now;
            bankDB[cleanId] = userData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            // 3. النتيجة (تنسيق الـ 3 أجزاء)
            await sock.sendMessage(chatId, { react: { text: reaction, key: m.key } });

            const heistTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ مـسـرح الـجـريـمـة الـمـئـويـة 🎭 ┇★*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*👤 الـمـنـفـذ : ⦓ @${userJid.split('@')[0]} ⦔*

${resultMessage}

*⎔┄┄─── ⊱╎⌯ 🏦 ⌯╎⊰ ───┄┄⎔*

*🏦 إجـمـالـي رصـيـدك : ⦓ ${userData.money.toLocaleString()} 🪙 ⦔*
*🕒 الـعـمـلـيـة الـقـادمـة : بـعـد 3 سـاعـات*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: heistTemplate, mentions: [userJid] }, { quoted: m });

        } catch (e) {
            console.error("Heist Error:", e);
        }
    }
};