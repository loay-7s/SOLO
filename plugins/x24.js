import fs from 'fs-extra';

export default {
    name: "تحدي",
    aliases: ["مبارزة", "نزال"],
    category: "mythology",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';
        const challengePath = './data/active_challenges.json'; 

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            let userSoul = soulsDB[cleanId];
            const now = Date.now();

            // ⭐ فحص الصلاحية (الساموراي الأصلي أو الأثير المستحوذ)
            const isSamurai = userSoul?.name.includes("الساموراي");
            const isEtherWithSamurai = userSoul?.name.includes("الأثير") && 
                                      userSoul?.copiedAbility?.includes("الساموراي") && 
                                      now < userSoul?.copyExpiry;

            if (!userSoul || (!isSamurai && !isEtherWithSamurai)) {
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ❌ ｣ عـذراً.. هـذا الـأمـر مـخـصـص لـأصـحـاب [ روح الساموراي 👺 ] فـقـط!*\n\n*🛡️ روحـك الـحـالـيـة : ⦓ ${userSoul ? userSoul.name : "لا تـوجـد"} ⦔*` 
                }, { quoted: m });
            }

            // فحص التجميد (القفل الجليدي)
            if (userSoul.isFrozen && now < userSoul.freezeExpiry) {
                const minutesLeft = Math.ceil((userSoul.freezeExpiry - now) / (60 * 1000));
                await sock.sendMessage(chatId, { react: { text: "🧊", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ 🧊 ｣ نـصـلـك مـتـجـمـد ولا يـمـكـنـك سـلّـه الـآن..*\n\n*⚠️ روحـك مـقـيـدة.. انـتـظـر ⦓ ${minutesLeft} ⦔ دقـيـقـة لـيـذوب الـجـلـيـد وتـسـتـعـيـد شـرف الـمـبـارزة.*` 
                }, { quoted: m });
            } else if (userSoul.isFrozen && now >= userSoul.freezeExpiry) {
                userSoul.isFrozen = false;
                delete userSoul.freezeExpiry;
            }

            // نظام الكول داون (تعديل ليصبح كل ساعة)
            const hourInMs = 60 * 60 * 1000; 
            if (userSoul.lastChallenge && (now - userSoul.lastChallenge < hourInMs)) {
                const timeLeft = Math.ceil((hourInMs - (now - userSoul.lastChallenge)) / (60 * 1000));
                return await sock.sendMessage(chatId, { text: `*｢ ⏳ ｣ يـمـكـنـك الـتـحدي بـعد ⦓ ${timeLeft} ⦔ دقـيـقـة.*` }, { quoted: m });
            }

            const quoted = m.message?.extendedTextMessage?.contextInfo;
            let target = quoted?.participant || quoted?.mentionedJid?.[0];

            if (!target) return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـجـب الـرد عـلـى رسـالـة الـخـصـم أو مـنـشـنـتـه!*" }, { quoted: m });

            const cleanTarget = target.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            if (cleanId === cleanTarget) return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *لا تـبـارز نـفـسـك!*" });

            const samuraiQuotes = [
                "النصل لا يخطئ الهدف أبداً", "الشرف أغلى من الحياة نفسها", "الساموراي يعيش ويموت بسيفه",
                "الهدوء قبل العاصفة القاتلة", "السيف هو روح المحارب", "من فقد شرفه فقد كل معاركه",
                "كرامتي اغلى من حياتي", "السيف قد يصدأ لكن الكبرياء لا", "افضل الموت على ان اعيش منكس الرأس"
            ];
            const selectedQuote = samuraiQuotes[Math.floor(Math.random() * samuraiQuotes.length)];

            let activeChallenges = fs.readJsonSync(challengePath, { throws: false }) || {};
            activeChallenges[chatId] = {
                attacker: cleanId,
                defender: cleanTarget,
                quote: selectedQuote,
                startTime: now
            };
            fs.writeJsonSync(challengePath, activeChallenges);

            userSoul.lastChallenge = now;
            fs.writeJsonSync(soulsPath, soulsDB, { spaces: 2 });

            const challengeStart = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 🇱 𝐎 ⌯╎⊰─┄┄⎔*
*★┇ نـزال الـسـامـوراي الـمـقـدس ⚔️ ┇★*
*⎔┄┄─── ⊱╎⌯ 👺 ⌯╎⊰ ───┄┄⎔*

*👤 الـمُـتـحـدي : ⦓ @${userJid.split('@')[0]} ⦔*

*👤 الـخـصـم : ⦓ @${target.split('@')[0]} ⦔*

*🛡️ الـمـطـلـوب : كـتـابـة الـجـمـلـة الـتـالـيـة بـأقـصـى سـرعـة ↯*

*« ${selectedQuote} »*

*⚠️ أول مـن يـكـتـب الـجـمـلـة يـفـوز بـالـنـزال!*
*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            await sock.sendMessage(chatId, { 
                text: challengeStart, 
                mentions: [userJid, target] 
            }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};