import fs from 'fs-extra';

export default {
    name: "تغيير_الروح",
    aliases: ["تبديل_الروح", "تقمص_جديد"],
    category: "mythology",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            let userSoul = soulsDB[cleanId];

            // 1. التحقق من وجود الروح ونقاط الـ XP
            if (!userSoul) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ *يـجـب أن تـمـلـك روحـاً أولـاً لـتـقـوم بـتـغـيـيـرهـا!*" }, { quoted: m });
            }

            if (userSoul.xp < 15) {
                return await sock.sendMessage(chatId, { text: `*❌ تـكـلـفـة الـتـغـيـيـر هـي ⦓ 15 ⦔ XP.. رصـيـدك الـحـالـي ⦓ ${userSoul.xp} ⦔ فـقـط.*` }, { quoted: m });
            }

            // 2. قائمة الأرواح والنسب (نفس نظام كود روحي)
            const spirits = [
                { name: "روح الساموراي 👺", type: "متوفرة", aura: "❮ ⚔️ 🛡️ ❯", desc: "النصل المسلول.. هالتك حادة كالسيف وروحك لا تعرف الانحناء." },
                { name: "روح الكيميائي 🧪", type: "متوفرة", aura: "❮ ⚗️ 🧬 ❯", desc: "سيد العناصر.. عقلك يفكك الشفرات ويرى ما وراء المادة." },
                { name: "روح البدوي 🐪", type: "متوفرة", aura: "❮ 🌙 🏜️ ❯", desc: "فخر الرمال.. كبرياؤك كالجبال وأصالتك تسبق حضورك." },
                { name: "روح التنين 🔥", type: "نادرة", aura: "❮ 🐲 🌋 ❯", desc: "الزئير الحارق.. حضورك يفرض الهيبة ونارك تطهر المكان." },
                { name: "روح الأثير 🌌", type: "نادرة", aura: "❮ 🌑 💫 ❯", desc: "الكيان الغامض.. أنت موجود في كل مكان ولا يمكن لمسك." }
            ];

            const weights = [50, 40, 30, 20, 10];
            const totalWeight = weights.reduce((acc, w) => acc + w, 0);
            
            let chosen;
            // ضمان عدم اختيار نفس الروح الحالية
            do {
                let random = Math.random() * totalWeight;
                let chosenIndex = 0;
                for (let i = 0; i < weights.length; i++) {
                    if (random < weights[i]) { chosenIndex = i; break; }
                    random -= weights[i];
                }
                chosen = spirits[chosenIndex];
            } while (chosen.name === userSoul.name);

            // 3. تنفيذ الخصم وتغيير البيانات
            userSoul.xp -= 15;
            userSoul.name = chosen.name;
            userSoul.type = chosen.type;
            userSoul.aura = chosen.aura;
            userSoul.desc = chosen.desc;
            
            // تنظيف أي استحواذ أثيري قديم إذا تغيرت الروح
            if (userSoul.copiedAbility) {
                delete userSoul.copiedAbility;
                delete userSoul.copyExpiry;
            }

            soulsDB[cleanId] = userSoul;
            fs.writeJsonSync(soulsPath, soulsDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "🔄", key: m.key } });

            const changeTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*🔄┇ مـراسـم تـنـاسـخ الأرواح ┇🔄*
*⎔┄┄─── ⊱╎⌯ 🌀 ⌯╎⊰ ───┄┄⎔*

*👤 الـمُـبـدل : ⦓ @${cleanId.split('@')[0]} ⦔*

*✨ الـروح الـجـديـدة : ⦓ ${userSoul.name} ⦔*

*📉 الـتـكـلـفـة : ⦓ 15 ⦔ XP*

*⎔┄┄─── ⊱╎⌯ 🛡️ ⌯╎⊰ ───┄┄⎔*

*📊 رصـيـدك الـمـتـبـقـي : ⦓ ${userSoul.xp} ⦔ XP*
*🌀 الـهـالـة الـمـنـبـعـثـة : ${userSoul.aura}*

*⎔┄┄─── ⊱╎⌯ 🏮 ⌯╎⊰ ───┄┄⎔*

*💠 " لـقـد تـخـلـيـت عـن جـوهـرك الـقـديـم لـتـولـد مـن جـديـد بـقـوة مـخـتـلـفـة.. "*

~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            return await sock.sendMessage(chatId, { 
                text: changeTemplate, 
                mentions: [cleanId] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};