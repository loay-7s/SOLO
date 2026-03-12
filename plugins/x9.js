import fs from 'fs-extra';

export default {
    name: "راتب",
    aliases: ["الراتب", "يومي"],
    category: "economy",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            let userData = bankDB[cleanId] || bankDB[userJid] || { money: 0, rank: "عضو مكافح 🌱", lastDaily: 0, inventory: [] };

            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000; 
            const timeLeft = userData.lastDaily ? (userData.lastDaily + cooldown) - now : 0;

            if (timeLeft > 0) {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                await sock.sendMessage(chatId, { react: { text: "⏳", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*｢ ⏳ ｣ عـذࢪا أنـت قـد اسـتـلـمـت ࢪاتـبـك الـيـومـي بـالـفـعـل.*\n\n*يـمـكـنـك الـعـودة بـعـد: ⦓ ${hours} سـاعـة و ${minutes} دقـيـقـة ⦔*` 
                }, { quoted: m });
            }

            // --- سلم الرواتب الجديد (تحديث سولو الإمبراطوري) ---
            let salary = 100; 
            const rank = userData.rank;

            // 1. رواتب الترقيات التلقائية (الأرقام الجديدة)
            if (rank.includes("حـاكـم الـكـوكـب")) salary = 10000;
            else if (rank.includes("مـسـتـثـمـر عـالـمـي")) salary = 5000;
            else if (rank.includes("مـلـيـارديـر")) salary = 2500;
            else if (rank.includes("مـلـيـونـيـر")) salary = 1700;
            else if (rank.includes("رجل أعـمـال")) salary = 600;
            else if (rank.includes("ثـري")) salary = 300;
            else if (rank.includes("عـضـو مـكـافـح")) salary = 100;

            // 2. رواتب ألقاب المتجر
            else if (rank.includes("بطل الظلال 🌑")) salary = 2000;
            else if (rank.includes("زعيم المحطة 🚉")) salary = 1800;
            else if (rank.includes("تاجر سوق سوداء 📦")) salary = 1600;
            else if (rank.includes("منفذ غامض 🕶️")) salary = 1400;
            else if (rank.includes("قائد عصابة 🐺")) salary = 1200;
            else if (rank.includes("مرتزق مأجور 🔫")) salary = 1000;
            else if (rank.includes("صائد عملات 🪙")) salary = 800;
            else if (rank.includes("مغامر ناشئ 🎒")) salary = 600;
            else if (rank.includes("هاوي قتالات 🥊")) salary = 400;
            else if (rank.includes("عابر سبيل 👣")) salary = 200;

            // 🤝 ميزة عقد الرعاية (مضاعفة الراتب)
            let sponsorNote = "";
            if (userData.inventory && userData.inventory.includes("عقد الرعاية 🤝")) {
                salary = salary * 2;
                sponsorNote = "\n*🤝 تـم مـضـاعـفـة الـراتـب (عـقـد الـرعـايـة نـشـط)*";
            }

            userData.money = (userData.money || 0) + salary;
            userData.lastDaily = now;
            bankDB[cleanId] = userData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "💸", key: m.key } });

            const salaryTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*★┇ مـنـحـة الـنـظـام الـيـومـيـة ┇★*
*⎔┄┄─── ⊱╎⌯ 💸 ⌯╎⊰ ───┄┄⎔*

*👤 الـعـمـيـل : ⦓ @${userJid.split('@')[0]} ⦔*

*📈 الـرتـبـة : ⦓ ${rank} ⦔*

*💰 الـࢪاتـب : ⦓ +${salary.toLocaleString()} 🪙 ⦔*${sponsorNote}

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*
*🏦 إجـمـالـي الـࢪصـيـد : ⦓ ${userData.money.toLocaleString()} ⦔*

*⏳ مـوعـد الـراتـب الـقادم : بـعـد 24 سـاعـة*

*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            return await sock.sendMessage(chatId, { text: salaryTemplate, mentions: [userJid] }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};