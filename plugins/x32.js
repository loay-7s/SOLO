import fs from 'fs-extra';

export default {
    name: "مواجهة_الوحش",
    aliases: ["المواجهة"],
    category: "mythology",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const soulsPath = './data/souls.json';
        const shadowPath = './data/active_shadows.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let soulsDB = fs.readJsonSync(soulsPath, { throws: false }) || {};
            let userSoul = soulsDB[cleanId];
            const now = Date.now();

            if (!userSoul) return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *يـجـب أن تـمـلـك روحـاً أولاً! اكـتـب [.روحي]*" });

            if (userSoul.isFrozen && now < userSoul.freezeExpiry) {
                const minutesLeft = Math.ceil((userSoul.freezeExpiry - now) / (60 * 1000));
                return await sock.sendMessage(chatId, { text: `*｢ 🧊 ｣ روحـك مـنـهـكـة ومـتـجـمـدة.. انـتـظـر ⦓ ${minutesLeft} ⦔ دقـيـقـة.*` }, { quoted: m });
            }

            const cooldown = 2 * 60 * 1000;
            if (userSoul.lastShadow && (now - userSoul.lastShadow < cooldown)) {
                const timeLeft = Math.ceil((cooldown - (now - userSoul.lastShadow)) / 1000);
                return await sock.sendMessage(chatId, { text: `*｢ ⏳ ｣ انـتـظـر ⦓ ${timeLeft} ⦔ ثـانـيـة لـتـحـدي الـوحـش مـجـدداً.*` }, { quoted: m });
            }

            const monsters = ["الـغـول الـسـام 🤮", "شـيـطـان الـنـار 🔥", "روح مـعـذبـة 👻", "نـيـنـجـا الـظـل 👤", "الـتـنـيـن الـأسـود 🐉", "حـارس الـجـحـيـم ⛓️", "مـلـك الـعـظـام 💀"];
            
            // زيادة عدد الجمل وتنوعها
            const quotes = [
                "الظل لا يرحم الضعفاء", "القوة تنبع من الداخل", "واجه مخاوفك لتنتصر", 
                "سرعة البرق ونصل الفناء", "روحي تتوهج في الظلام", "نهايتك قريبة يا ظل",
                "سأكسر قيود القدر بنصلي", "الموت مجرد بداية للارتقاء", "دمائي تغلي برغبة القتال",
                "لا مكان للخوف في قلبي", "سأبيد الظلال بنور إرادتي", "نصلي متعطش لدماء الوحوش",
                "الألم هو وقود قوتي", "سأرتقي لعرش الأساطير رغماً عنكم", "نور الروح يطرد ظلام الخوف"
            ];
            
            const selectedMonster = monsters[Math.floor(Math.random() * monsters.length)];
            const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

            let activeShadows = fs.readJsonSync(shadowPath, { throws: false }) || {};
            activeShadows[cleanId] = {
                quote: selectedQuote,
                expiry: now + 10000 // ⚠️ التعديل: 5 ثوانٍ فقط للرد
            };
            fs.writeJsonSync(shadowPath, activeShadows);

            userSoul.lastShadow = now;
            fs.writeJsonSync(soulsPath, soulsDB, { spaces: 2 });

            const challengeMsg = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*🌑┇ مـواجـهـة الـوحـوش الـمـظـلـمـة ┇🌑*
*⎔┄┄─── ⊱╎⌯ 🔥 ⌯╎⊰ ───┄┄⎔*

*⚔️ الـتـحـدي : انـتـصـر عـلـى ⦓ ${selectedMonster} ⦔*

*🛡️ الـمـطـلـوب : أكـتـب الـجـمـلـة الـتـالـيـة فـي 10 ثـوانٍ فـقـط ↯*

*« ${selectedQuote} »*

*⚠️ الـفـوز : +2 XP | الـخـسـارة : تـجـمـيـد 10 دقائق.*
*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            await sock.sendMessage(chatId, { text: challengeMsg }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};