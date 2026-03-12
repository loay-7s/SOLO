import fs from 'fs-extra';

export default {
    name: "تبديل",
    aliases: ["لقبي", "تغيير"],
    category: "economy",

    async run({ sock, m, text, userJid }) {
        const chatId = m.key.remoteJid;
        const bankPath = './data/bank.json';

        try {
            const cleanId = userJid.split('@')[0].split(':')[0] + "@s.whatsapp.net";
            let bankDB = fs.readJsonSync(bankPath, { throws: false }) || {};
            let userData = bankDB[cleanId];

            if (!userData || !userData.inventory || userData.inventory.length === 0) {
                return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ مخزنك خالٍ من الألقاب!" });
            }

            // تصفية الألقاب فقط من المخزن (استبعاد الحقن والقنابل)
            const ranksInInv = userData.inventory.filter(i => !i.includes("💉") && !i.includes("💣"));

            if (!text) {
                let list = `*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*\n\n*★┇ تـبـديـل الـلقـب الـنـشـط ┇★*\n\n*❑ الألقاب التي تملكها ↯*\n`;
                ranksInInv.forEach((r, i) => list += `*${i + 1} - ${r}*\n`);
                list += `\n*📝 استخدم: .تبديل + رقم اللقب*\n\n*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`;
                return await sock.sendMessage(chatId, { text: list }, { quoted: m });
            }

            const choice = ranksInInv[parseInt(text) - 1] || ranksInInv.find(r => r.includes(text.trim()));

            if (!choice) return await sock.sendMessage(chatId, { text: "｢ ❌ ｣ هذا اللقب غير موجود بمخزنك!" });

            userData.rank = choice;
            bankDB[cleanId] = userData;
            fs.writeJsonSync(bankPath, bankDB, { spaces: 2 });

            return await sock.sendMessage(chatId, { text: `*｢ ✅ ｣ تـم تـبـديـل لقـبـك الـآن إلـى: ${choice}*` }, { quoted: m });

        } catch (e) { console.error(e); }
    }
};