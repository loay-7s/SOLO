import fs from 'fs-extra';

export default {
    name: "مهامي",
    aliases: ["المهام", "daily"],
    category: "solo_leveling",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const soloPath = './data/SOLO_LEVELING.json';

        try {
            const userLid = m.key.participant || m.key.remoteJid;
            
            if (!fs.existsSync(soloPath)) return;
            let soloDB = fs.readJsonSync(soloPath, { throws: false }) || {};

            if (!soloDB[userLid]) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *لـم يـتـم الـعـثـور عـلـى بـيـانـاتـك فـي الـنـظـام!*" }, { quoted: m });
            }

            let player = soloDB[userLid];
            let now = Date.now();
            let oneDay = 24 * 60 * 60 * 1000;

            if (!player.dailyQuests) {
                player.dailyQuests = { step: 1, msgCount: 0, cmdCount: 0, lastReset: now };
            }

            if (now - (player.dailyQuests.lastReset || 0) > oneDay) {
                player.dailyQuests = { step: 1, msgCount: 0, cmdCount: 0, lastReset: now };
            }

            const q = player.dailyQuests;
            const check = (s) => q.step > s ? '✅' : (q.step === s ? '🟡' : '🔒');
            const isAllDone = q.step === 6;

            // ✅ الترتيب الجديد:
            // step 1: 100 رسالة
            // step 2: النص المقدس
            // step 3: 20 أمر
            // step 4: التلفيل (ارتقاء بالمستوى)
            // step 5: مغارة
            // step 6: مكتمل

            const questTemplate = `
*⎔┄┄─ ⊱╎⌯ 𝐒 𝐎 𝐋 𝐎 ⌯╎⊰─┄┄⎔*
*★┇ مـهـامـك الـيـومـيـة 📋 ┇★*
*⎔┄┄─── ⊱╎⌯ ⚡ ⌯╎⊰ ───┄┄⎔*

*👤 الـلاعـب : ⦓ @${userLid.split('@')[0]} ⦔*

*╼━━━━━━━━━━━━━━━━━━╾*
*${check(1)} 1. إرسـال 100 رسـالـة (${q.msgCount}/100)*
*${check(2)} 2. اخـتـبـار الـنـص الـمُـقـدس.*
*${check(3)} 3. اسـتـخـدام 20 أمـر (${q.cmdCount || 0}/20)*
*${check(4)} 4. الـتـلـفـيـل (الارتـقـاء بـالـمـسـتـوى).*
*${check(5)} 5. تـطـهـيـر مـغـارة واحـدة.*
*╼━━━━━━━━━━━━━━━━━━╾*

${isAllDone ? "*🏆 تـم إكـمـال جـمـيـع مـهـام الـيـوم! عُـد غـداً.*" : "*💰 جائزة كل مهمة: 10 ذهبات + 5 XP*\n*🏆 جائزة الإكمال: 100 ذهبة + 150 XP*"}
*⎔┄┄── ⊱╎⌯ 🏮 ⌯╎⊰ ──┄┄⎔*`.trim();

            await sock.sendMessage(chatId, { text: questTemplate, mentions: [userLid] }, { quoted: m });

            soloDB[userLid] = player;
            fs.writeJsonSync(soloPath, soloDB, { spaces: 2 });

        } catch (e) {
            console.error("Error in Daily Quests:", e);
        }
    }
};