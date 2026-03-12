import fs from 'fs-extra';

export default {
    name: "روحي",
    aliases: ["الروح"],
    category: "mythology",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            let userSoul = soulsDB[cleanId];
            const now = Date.now();

            // 1. نظام فحص التجميد (القفل الجليدي)
            if (userSoul && userSoul.isFrozen) {
                if (now < userSoul.freezeExpiry) {
                    const minutesLeft = Math.ceil((userSoul.freezeExpiry - now) / (60 * 1000));
                    await sock.sendMessage(chatId, { react: { text: "🧊", key: m.key } });
                    return await sock.sendMessage(chatId, { 
                        text: `*｢ 🧊 ｣ روحـك مـتـجـمـدة ومـسـلـوبـة الـقـوة..*\n\n*⚠️ لـا يـمـكـنـك اسـتـدعـاء الـجـوهـر الـآن.. انـتـظـر ⦓ ${minutesLeft} ⦔ دقـيـقـة لـيـذوب الـجـلـيـد.*` 
                    }, { quoted: m });
                } else {
                    userSoul.isFrozen = false;
                    delete userSoul.freezeExpiry;
                }
            }

            // 2. ⭐ نظام الاستحواذ الأثيري (تعديل الأثير)
            let displaySoul = userSoul;
            let isCopied = false;

            if (userSoul && userSoul.name.includes("الأثير") && userSoul.copiedAbility && now < userSoul.copyExpiry) {
                // البحث عن بيانات الروح المستنسخة لعرضها
                const abilityName = userSoul.copiedAbility;
                const spiritsData = [
                    { name: "روح الساموراي 👺", type: "متوفرة", aura: "❮ ⚔️ 🛡️ ❯", desc: "النصل المسلول.. هالتك حادة كالسيف وروحك لا تعرف الانحناء." },
                    { name: "روح الكيميائي 🧪", type: "متوفرة", aura: "❮ ⚗️ 🧬 ❯", desc: "سيد العناصر.. عقلك يفكك الشفرات ويرى ما وراء المادة." },
                    { name: "روح البدوي 🐪", type: "متوفرة", aura: "❮ 🌙 🏜️ ❯", desc: "فخر الرمال.. كبرياؤك كالجبال وأصالتك تسبق حضورك." },
                    { name: "روح التنين 🔥", type: "نادرة", aura: "❮ 🐲 🌋 ❯", desc: "الزئير الحارق.. حضورك يفرض الهيبة ونارك تطهر المكان." }
                ];
                const foundAbility = spiritsData.find(s => s.name === abilityName);
                if (foundAbility) {
                    displaySoul = { ...userSoul, ...foundAbility, isTemporary: true };
                    isCopied = true;
                }
            }

            const spirits = [
                { name: "روح الساموراي 👺", type: "متوفرة", aura: "❮ ⚔️ 🛡️ ❯", desc: "النصل المسلول.. هالتك حادة كالسيف وروحك لا تعرف الانحناء." },
                { name: "روح الكيميائي 🧪", type: "متوفرة", aura: "❮ ⚗️ 🧬 ❯", desc: "سيد العناصر.. عقلك يفكك الشفرات ويرى ما وراء المادة." },
                { name: "روح البدوي 🐪", type: "متوفرة", aura: "❮ 🌙 🏜️ ❯", desc: "فخر الرمال.. كبرياؤك كالجبال وأصالتك تسبق حضورك." },
                { name: "روح التنين 🔥", type: "نادرة", aura: "❮ 🐲 🌋 ❯", desc: "الزئير الحارق.. حضورك يفرض الهيبة ونارك تطهر المكان." },
                { name: "روح الأثير 🌌", type: "نادرة", aura: "❮ 🌑 💫 ❯", desc: "الكيان الغامض.. أنت موجود في كل مكان ولا يمكن لمسك." }
            ];

            const cooldownTime = 60 * 1000; 
            if (userSoul && userSoul.lastUsed && !isCopied) {
                const timePassed = now - userSoul.lastUsed;
                if (timePassed < cooldownTime) {
                    const timeLeft = Math.ceil((cooldownTime - timePassed) / 1000);
                    await sock.sendMessage(chatId, { react: { text: "⏳", key: m.key } });
                    return await sock.sendMessage(chatId, { text: `*｢ ⏳ ｣ طـاقـتـك الـروحـيـة مـسـتـنـزفـة حـالـيـاً.. يـرجـى الـانـتـظـار ⦓ ${timeLeft} ⦔ ثـانـيـة.*` }, { quoted: m });
                }
            }

            if (!userSoul) {
                const weights = [50, 40, 30, 20, 10];
                const totalWeight = weights.reduce((acc, w) => acc + w, 0);
                let random = Math.random() * totalWeight;
                let chosenIndex = 0;
                for (let i = 0; i < weights.length; i++) {
                    if (random < weights[i]) { chosenIndex = i; break; }
                    random -= weights[i];
                }
                let chosen = spirits[chosenIndex];
                userSoul = { name: chosen.name, type: chosen.type, aura: chosen.aura, desc: chosen.desc, xp: 0, rank: "باهتة 🌫️" };
                displaySoul = userSoul;
            }

            if (!isCopied) userSoul.xp += 1; // زيادة النقاط للروح الأصلية فقط
            userSoul.lastUsed = now;
            
            let upgradeMessage = "";
            if (userSoul.xp >= 20 && userSoul.rank === "باهتة 🌫️") { userSoul.rank = "مستيقظة 👁️"; upgradeMessage = `*🔥 إنـجـاز : لـقـد ارتقـت روحـك إلـى [ الـمستـيقـظـة ]!*`; }
            else if (userSoul.xp >= 50 && userSoul.rank === "مستيقظة 👁️") { userSoul.rank = "متوهجة 🔥"; upgradeMessage = `*✨ إنجـاز : لـقـد وصـلت روحـك لـمـرحـلـة [ الـتـوهـج ]!*`; }
            else if (userSoul.xp >= 100 && userSoul.rank === "متوهجة 🔥") { userSoul.rank = "أسطورية 👑"; upgradeMessage = `*👑 إنجـاز عـظـيـم : روحـك الـآن فـي مـرتـبـة [ الـأسـاطـيـر ]!*`; }

            soulsDB[cleanId] = userSoul;
            fs.writeJsonSync(soulsPath, soulsDB, { spaces: 2 });

            const shadowId = userJid.split('@')[0];
            await sock.sendMessage(chatId, { react: { text: isCopied ? "🎭" : "🔮", key: m.key } });

            const soulTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*

*★┇ كـشـف الـجـوهـر الـبـاطـنـي ${isCopied ? "🎭" : "🔮"} ┇★*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*👤 الـمُـسـتـدعي : ⦓ @${shadowId} ⦔*
*✨ الـروح : ⦓ ${displaySoul.name} ⦔*
*💎 الـنـدرة : ⦓ ${displaySoul.type} ⦔*
${isCopied ? "*⚠️ الـحـالـة : ⦓ تـقـمـص أثـيـري مـؤقـت 🌌 ⦔*" : ""}

*⎔┄┄─── ⊱╎⌯ 🛡️ ⌯╎⊰ ───┄┄⎔*

*❑ مـسـتـوى الـارتـقـاء الـروحـي ↯*

*📊 الـتـطـور : ⦓ ${userSoul.rank} ⦔*
*🌀 الـهـالـة : ${displaySoul.aura}*
*⚡ نـقـاط الـطـاقـة : ⦓ ${userSoul.xp} ⦔*

*📜 الـنـبـوءة :*
*« ${displaySoul.desc} »*

*⎔┄┄─── ⊱╎⌯ 🏮 ⌯╎⊰ ───┄┄⎔*

${upgradeMessage ? upgradeMessage + '\n*⎔┄┄─── ⊱╎⌯ ✨ ⌯╎⊰ ───┄┄⎔*\n' : ''}*💡 نـصـيـحـة : كـلـمـا زاد تـفـاعـلـك.. اقـتـربـت مـن مـرحـلـة الـارتقـاء الـتـالـيـة.*

*⎔┄┄── ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: soulTemplate, mentions: [userJid] }, { quoted: m });
        } catch (e) { console.error(e); }
    }
};