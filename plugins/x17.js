import fs from 'fs-extra';

export default {
    name: "سرقة",
    aliases: ["اسرق"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';
        const devs = ['201226018783@s.whatsapp.net']; 

        try {
            const cleanThief = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            const quoted = m.message?.extendedTextMessage?.contextInfo;
            let target = quoted?.participant || quoted?.mentionedJid?.[0];

            if (!target) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـرجـى مـنـشـن الـشـخـص أو الـرد عـلـى رسـالـتـه لـتـسـرقـه!*" }, { quoted: m });
            }

            const cleanTarget = target.split('@')[0].split(':')[0] + "@s.whatsapp.net";

            if (devs.includes(cleanTarget)) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *يـا غـبـي بـتـحـاول تـسـࢪق الـمـطـوࢪ؟😂*" }, { quoted: m });
            }

            if (cleanTarget === cleanThief) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا تـحـاول سـرقـة نـفـسـك!*" }, { quoted: m });
            }

            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            let thiefData = bankDB[cleanThief] || { money: 0, lastSteal: 0, inventory: [] };
            let targetData = bankDB[cleanTarget] || { money: 0, inventory: [] };

            const now = Date.now();

            // 🛡️ فحص تجميد السرقة (الخاص بدرع الكيفلار)
            if (targetData.freezeSteal && now < targetData.freezeSteal) {
                const hoursLeft = Math.ceil((targetData.freezeSteal - now) / (1000 * 60 * 60));
                return await sock.sendMessage(chatId, { 
                    text: `｢ 🛡️ ｣ *هـذا الـشـخـص مـحـمـي بـنـظـام تـجـمـيـد الـسـرقـة بـعـد تـحـطـم درعـه!*\n*مـتـبـقـي لـفـك الـتـجـمـيـد: ${hoursLeft} سـاعـة.*` 
                }, { quoted: m });
            }

            // 🚫 فحص جهاز التشويش
            if (thiefData.jamTime && now < thiefData.jamTime) {
                return await sock.sendMessage(chatId, { text: "｢ 📡 ｣ *لا يـمـكـنـك الـقـيـام بـأي عـمـلـيـة! جـهـاز الـتـشـويـش يـعـطـل أنـظـمـتـك حـالـيـاً.*" }, { quoted: m });
            }
            if (targetData.jamTime && now < targetData.jamTime) {
                return await sock.sendMessage(chatId, { text: "｢ 📡 ｣ *هـذا الـشـخـص مـحـمـي بـجـهـاز تـشـويـش، لا يـمـكـن اخـتراق أنـظـمـتـه الـآن!*" }, { quoted: m });
            }

            // 🛡️ تفعيل درع الكيفلار + التجميد لمدة 24 ساعة
            if (targetData.inventory && targetData.inventory.includes("درع الكيفلار 🛡️")) {
                targetData.inventory = targetData.inventory.filter(item => item !== "درع الكيفلار 🛡️");
                targetData.freezeSteal = now + (24 * 60 * 60 * 1000); // تجميد 24 ساعة
                bankDB[cleanTarget] = targetData;
                fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });
                await sock.sendMessage(chatId, { react: { text: "🛡️", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: "｢ 🛡️ ｣ *تـم تـحـطـيـم درع الـكـيـفـلار! لـكـنـه فـعّـل نـظـام الـتـجـمـيـد.. لـا يـمـكـن سـرقـة هـذا الـلـاعـب لـمـدة 24 سـاعـة.*" 
                }, { quoted: m });
            }

            // --- فحص الكول داون للسارق ---
            const cooldown = 60 * 60 * 1000; 
            const timeLeft = thiefData.lastSteal ? (thiefData.lastSteal + cooldown) - now : 0;

            if (timeLeft > 0) {
                const minutes = Math.floor(timeLeft / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ⏳ ｣ يـمـكـنـك الـسـرقـة بـعـد: ⦓ ${minutes} دقـيـقـة و ${seconds} ثـانـيـة ⦔*` 
                }, { quoted: m });
            }

            if (thiefData.money < 100) return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *يـلـزمـك 100 عـمـلـة لـتـبـدأ!*" }, { quoted: m });
            
            let safeMoney = (targetData.inventory && targetData.inventory.includes("الخزنة الحديدية 🗄️")) ? 10000 : 0;
            let stealableAmount = targetData.money - safeMoney;
            if (stealableAmount < 50) return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *أمـوال الـضـحـيـة مـحـمـيـة أو لـا يـمـلـك شـيـئـاً.*" }, { quoted: m });

            let successRate = (thiefData.virusTime && now < thiefData.virusTime) ? 0.35 : 0.7;
            const isSuccess = Math.random() < successRate;
            let amount = 0;
            let resultMessage = "";
            let reaction = "";

            if (isSuccess) {
                amount = Math.floor(stealableAmount * 0.05);
                targetData.money -= amount;
                thiefData.money += amount;
                reaction = "🥷";
                resultMessage = `*❑ عـمـلـيـة نـشـل نـاجـحـة! 💸*\n\n*🚀 الـسـارق : ⦓ @${userJid.split('@')[0]} ⦔*\n\n*🎯 الـضـحـيـة : ⦓ @${target.split('@')[0]} ⦔*\n\n*💰 الـمـبـلـغ : ⦓ +${amount.toLocaleString()} 🪙 ⦔*`;
            } else {
                amount = Math.floor(thiefData.money * 0.02);
                thiefData.money -= amount;
                targetData.money += amount;
                reaction = "🚔";
                resultMessage = `*❑ تـم الإمـسـاك بـك! 🚔*\n\n*📉 الـغـرامـة : ⦓ -${amount.toLocaleString()} 🪙 ⦔*`;
            }

            thiefData.lastSteal = now;
            bankDB[cleanThief] = thiefData;
            bankDB[cleanTarget] = targetData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: reaction, key: m.key } });

            const stealTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
${resultMessage}
*⎔┄┄── ⊱╎⌯ 💰 ⌯╎⊰ ──┄┄⎔*
*🏦 رصـيـدك الـآن : ⦓ ${thiefData.money.toLocaleString()} 🪙 ⦔*
*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: stealTemplate, mentions: [userJid, target] }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};
