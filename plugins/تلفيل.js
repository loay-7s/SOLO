import fs from 'fs-extra';

export default {
    name: "تلفيل",
    aliases: ["تحويل_الخبرة", "ارتقاء"],
    category: "solo_leveling",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const soloPath = './data/SOLO_LEVELING.json';

        try {
            const userLid = m.key.participant || m.key.remoteJid;
            let soloDB = fs.readJsonSync(soloPath, { throws: false }) || {};

            if (!soloDB[userLid]) {
                return await sock.sendMessage(chatId, { text: "｢ ⚠️ ｣ *لـم يـتـم الـعـثـور عـلـى بـيـانـات سـولـو الـخـاصـة بـك!*" }, { quoted: m });
            }

            let player = soloDB[userLid];
            let currentXP = player.xp || 0;
            const costPerLevel = 50; 

            if (currentXP < costPerLevel) {
                return await sock.sendMessage(chatId, { text: `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*\n*⌬ نـظـام الـتـلـفـيـل ⌬*\n*───━━━⊱  ❌  ⊰━━━───*\n\n*❌ لـا يـمـكـن الـتـلـفـيـل!*\n*┌────────────────* \n*│ تـحـتـاج : ⦓ ${costPerLevel} XP ⦔*\n*│ لـديـك : ⦓ ${currentXP} XP ⦔*\n*└────────────────*\n\n*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*\n~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~` }, { quoted: m });
            }

            if (player.level >= 500) {
                return await sock.sendMessage(chatId, { text: "*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*\n*⌬ نـظـام الـتـلـفـيـل ⌬*\n*───━━━⊱  🏆  ⊰━━━───*\n\n*🏆 لـقـد وصـلـت إلـى الـحـد الأقـصـى!*\n*┌────────────────* \n*│ الـمـسـتـوى : ⦓ 500 ⦔*\n*│ رتـبـتـك : ⦓ SSS ⦔*\n*└────────────────*\n\n*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*\n~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~" }, { quoted: m });
            }

            let levelsToAdd = Math.floor(currentXP / costPerLevel);
            let oldLevel = player.level || 1;
            let newLevel = oldLevel + levelsToAdd;

            if (newLevel > 500) {
                newLevel = 500;
                player.xp = 0;
            } else {
                player.xp = currentXP % costPerLevel;
            }

            player.level = newLevel;

            // ✅ سجل أن المستوى تغير (للمهمة)
            if (newLevel > oldLevel) {
                player.levelChanged = true;  // 👈 هذا السطر المهم
            }

            // تحديث الرتبة
            let newRank = "E";
            if (newLevel >= 500) newRank = "SSS";
            else if (newLevel >= 350) newRank = "SS";
            else if (newLevel >= 250) newRank = "S";
            else if (newLevel >= 120) newRank = "A";
            else if (newLevel >= 50) newRank = "B";
            else if (newLevel >= 20) newRank = "C";
            else newRank = "E";
            player.rank = newRank;

            soloDB[userLid] = player;
            fs.writeJsonSync(soloPath, soloDB, { spaces: 2 });

            await sock.sendMessage(chatId, { react: { text: "🆙", key: m.key } });

            // الاستمارة الأسطورية
            const upgradeTemplate = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
    
     *⌬ نـظـام الـتـلـفـيـل الـمـطـور ⌬*

*───━━━⊱  ⚡ 🆙  ⊰━━━───*

*❑ [ بـيـانـات الـصـيـاد ] 👤↯*
*┌─────────────────────────────────┐*
*│ 👤 الـصـيـاد : ⦓ @${userLid.split('@')[0]} ⦔*
*│ 📈 الـمـسـتـوى الـجـديـد : ⦓ ${player.level} ⦔*
*│ 🏅 الـرتـبـة : ⦓ [ ${player.rank} ] ⦔*
*└─────────────────────────────────┘*

*❑ [ تـفـاصـيـل الـتـطـويـر ] 📊↯*
*┌─────────────────────────────────┐*
*│ 📊 الـخـبـرة الـمـسـتـهـلـكـة : ⦓ ${levelsToAdd * costPerLevel} XP ⦔*
*│ 🔄 عـدد الـمـسـتـويـات : ⦓ +${levelsToAdd} ⦔*
*│ ✨ الـخـبـرة الـمـتـبـقـيـة : ⦓ ${player.xp} XP ⦔*
*└─────────────────────────────────┘*

*❑ [ سـجـل الـتـطـويـر ] 📜↯*
*┌─────────────────────────────────┐*
*│ 🌑 الـنـظـام يـراقـب كـسـر حـدودك الـبـشـريـة..*
*└─────────────────────────────────┘*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            return await sock.sendMessage(chatId, { 
                text: upgradeTemplate, 
                mentions: [userLid] 
            }, { quoted: m });

        } catch (e) { 
            console.error("❌ Error in تلفيل:", e);
            await sock.sendMessage(chatId, { text: "❌ حدث خطأ في نظام التلفيل" }, { quoted: m });
        }
    }
};