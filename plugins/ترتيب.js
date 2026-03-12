import fs from 'fs-extra';

export default {
    name: "ترتيب",
    aliases: ["المنصنفين", "top", "leaderboard"],
    category: "solo",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const soloPath = './data/SOLO_LEVELING.json';

        try {
            if (!fs.existsSync(soloPath)) return m.reply("｢ ⚠️ ｣ *لا يـوجـد بـيـانـات لـلـصـياديـن بـعـد!*");

            let soloDB = fs.readJsonSync(soloPath, { throws: false }) || {};
            
            // تحويل الكائن إلى مصفوفة للترتيب
            let sortedPlayers = Object.entries(soloDB)
                .map(([jid, data]) => ({ jid, ...data }))
                .sort((a, b) => (b.level || 0) - (a.level || 0) || (b.xp || 0) - (a.xp || 0));

            if (sortedPlayers.length === 0) return m.reply("｢ ⚠️ ｣ *الـقـائـمـة فـارغـة حـالـيـاً!*");

            await sock.sendMessage(chatId, { react: { text: "🏆", key: m.key } });

            // --- [ الجزء الأول: ملك الظلال (المركز الأول) ] ---
            const top1 = sortedPlayers[0];
            let topMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   *⌬ تـصـنـيـف الـنـخـبـة الـعـالـمـي ⌬*
*───━━━⊱  🏆 👑  ⊰━━━───*

*👑 مـلـك الـظـلال الـحـالـي :*
*👤 الـصـيـاد :⦓ @${top1.jid.split('@')[0]}  ⦔*

*🏅 الـرتـبـة : ⦓ [ ${top1.rank} ] ⦔ | 📈 الـلـفـل : ⦓ ${top1.level} ⦔*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ [ قـائـمـة أقـوى 10 صـيـاديـن ] ⚔️↯*
*──────────────────────*\n`;

            // --- [ الجزء الثاني: قائمة العشرة الأوائل ] ---
            const top10 = sortedPlayers.slice(0, 10);
            const medals = ["🥇", "🥈", "🥉", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅"];
            
            top10.forEach((player, index) => {
                topMsg += `${medals[index]} *#${index + 1}* | @${player.jid.split('@')[0]}\n`;
                topMsg += `└─ *الـرتـبـة:* [ ${player.rank} ] | *الـلـفـل:* ${player.level}\n\n`;
            });

            // --- [ الجزء الثالث: مركزك الشخصي ] ---
            const myRank = sortedPlayers.findIndex(p => p.jid === userJid) + 1;
            topMsg += `*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*📊 مـركـزك الـحـالـي : ⦓ #${myRank || '؟؟'} ⦔*

*🌑 اسـتـمـر فـي الـتـطـهـيـر لـتـصـل لـلـقـمـة!*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            const topImg = './media/leaderboard.jpg';
            const mentions = top10.map(p => p.jid).concat(userJid);

            if (fs.existsSync(topImg)) {
                await sock.sendMessage(chatId, { 
                    image: fs.readFileSync(topImg), 
                    caption: topMsg, 
                    mentions: mentions 
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { text: topMsg, mentions: mentions }, { quoted: m });
            }

        } catch (e) {
            console.error("Error in Top Command:", e);
        }
    }
};