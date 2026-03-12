import fs from 'fs-extra';

export default {
    name: "قنبلة",
    aliases: ["تصفير", "تفجير"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanAttacker = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            const quoted = m.message?.extendedTextMessage?.contextInfo;
            let target = quoted?.participant || quoted?.mentionedJid?.[0];

            if (!target) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـرجـى مـنـشـن الـشـخـص أو الـرد عـلـى رسـالـتـه لـتـفـجـيـر لـقـبـه!*" }, { quoted: m });
            }

            const cleanTarget = target.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            
            let attackerData = bankDB[cleanAttacker] || bankDB[userJid] || { money: 0, rank: "عضو مكافح 🌱", inventory: [] };
            let targetData = bankDB[cleanTarget] || bankDB[target] || { money: 0, rank: "عضو مكافح 🌱", inventory: [] };

            const bombName = "قنبلة التصفير 💣";
            const bombIndex = attackerData.inventory ? attackerData.inventory.indexOf(bombName) : -1;

            if (bombIndex === -1) {
                await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا تـمـلـك (قنبلة التصفير) فـي مـخـزنـك!*" }, { quoted: m });
            }

            if (cleanTarget === cleanAttacker) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *لا تـفـجر نـفـسـك يـا بـطـل!*" }, { quoted: m });
            }

            // --- منطق السحق والإبادة ---
            const oldRank = targetData.rank;
            
            // 1. حذف اللقب من مخزن الضحية نهائياً لكي لا يستطيع العودة إليه
            if (targetData.inventory && targetData.inventory.includes(oldRank)) {
                targetData.inventory = targetData.inventory.filter(item => item !== oldRank);
            }

            // 2. تصفير الرتبة الحالية
            targetData.rank = "عضو مكافح 🌱";

            // 3. استهلاك القنبلة من المهاجم
            attackerData.inventory.splice(bombIndex, 1);

            // حفظ البيانات
            bankDB[cleanAttacker] = attackerData;
            bankDB[cleanTarget] = targetData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            // 4. النتيجة النهائية (تنسيق 3 أجزاء)
            await sock.sendMessage(chatId, { react: { text: "💥", key: m.key } });

            const bombTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ هـجـوم إبـادة الـمـمـتـلـكـات ┇★*

*⎔┄┄─── ⊱╎⌯ 💣 ⌯╎⊰ ───┄┄⎔*

*🚀 الـمـهـاجـم : ⦓ @${userJid.split('@')[0]} ⦔*

*🎯 الـضـحـيـة : ⦓ @${target.split('@')[0]} ⦔*

*⚠️ الـحـالـة : تـم سـحـق لـقـب [ ${oldRank} ]*

*🗑️ الـمـصـيـر : حُـذف الـلـقـب مـن مـخـزنه لـلأبـد!*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ رسـالـة إلـى الـضـحـيـة ⚰️↯*

*💠 | خـسـرت مـا اشـتريـت.. عُـد لـلـمـتـجـر وادفـع مـن جـديـد🍷😂*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { 
                text: bombTemplate, 
                mentions: [userJid, target] 
            }, { quoted: m });

        } catch (e) {
            console.error("Bomb Crush Error:", e);
        }
    }
};