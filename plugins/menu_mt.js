import fs from "fs";

export default {
    name: "اوامر_MT",
    aliases: ["nulll"],
    description: "عرض قوائم النظام (عربي/إنجليزي)",
    usage: ".اوامر",
    async run({ sock, m, text }) {
        try {
            const pluginsDir = "./plugins";
            const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));
            const videoPath = "media/menu.mp4";
            const chatId = m.key.remoteJid;
            const checkText = text.trim().toUpperCase();

            // --- نظام الريأكت الذكي ---
            if (!text.trim()) {
                // لو كتب ".اوامر" بس
                await sock.sendMessage(chatId, { react: { text: "🏮", key: m.key } });
            } else if (checkText === "S" || checkText === "أ" || checkText === "E") {
                // لو اختار لغة معينة
                await sock.sendMessage(chatId, { react: { text: "🥂", key: m.key } });
            }

            // فصل الأوامر (عربي وإنجليزي)
            const englishCmds = files.filter(f => /^[a-zA-Z]/.test(f)).map(f => f.replace(".js", ""));
            const arabicCmds = files.filter(f => /^[^a-zA-Z]/.test(f)).map(f => f.replace(".js", ""));

            let menuText = "";
            let subTitle = "";

            // 1. القائمة الإنجليزية (E)
            if (checkText === "E") {
                subTitle = "الـقـدرات الـإقـلـيـمـيـة (𝐄𝐍𝐆𝐋𝐈𝐒𝐇)";
                menuText = englishCmds.map((cmd, i) => `*⎈┆﹝ ${i + 1 < 10 ? '0' + (i + 1) : i + 1} ﹞┋.${cmd.toUpperCase()}*`).join("\n");
            } 
            // 2. القائمة العربية (A)
            else if (checkText === "A" || checkText === "أ") {
                subTitle = "الـقـدرات الـمـحـلـيـة (الـعـربـيـة)";
                menuText = arabicCmds.map((cmd, i) => `*⎈┆﹝ ${i + 1 < 10 ? '0' + (i + 1) : i + 1} ﹞┋ .${cmd}*`).join("\n");
            } 
            // 3. رسالة الاختيار الأساسية
            else {
                const helpText = `
*★┇‏قـائـمـة أوامـر سـ👑ـولـو┇‏★*
*⎔┄┄── ⊱╎⌯🏮⌯╎⊰ ──┄┄⎔*

*⌠📜⌡ ا̍ڶـــــڜــــڔحۡ ↯*
*❑ اكتب الاوامر التي ترغب بعرضها.*
 
*⎈┆الأوامر العربية:〖.اوامر A〗*

*⎔┄┄── ⊱╎⌯🏮⌯╎⊰ ──┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

                return await sock.sendMessage(chatId, {
                    video: fs.existsSync(videoPath) ? fs.readFileSync(videoPath) : null,
                    caption: helpText,
                    gifPlayback: true
                }, { quoted: m });
            }

            // 4. النص النهائي عند عرض الأوامر
            const finalMenu = `
*★┇‏ ${subTitle} ┇‏★*
*⎔┄┄── ⊱╎⌯🏮⌯╎⊰ ──┄┄⎔*

${menuText}

*⎔┄┄── ⊱╎⌯🏮⌯╎⊰ ──┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            await sock.sendMessage(chatId, {
                video: fs.existsSync(videoPath) ? fs.readFileSync(videoPath) : null,
                caption: finalMenu,
                gifPlayback: true
            }, { quoted: m });

        } catch (err) {
            console.error(err);
        }
    }
};