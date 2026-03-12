import fs from 'fs-extra';

export default {
    name: "مجموعاتي",
    aliases: ["جروباتي", "groups"],
    description: "عرض جميع المجموعات التي البوت فيها",
    developer: true,

    async run({ sock, m, reply }) {
        const chatId = m.key.remoteJid;
        
        try {
            await sock.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            const groupsData = await sock.groupFetchAllParticipating();
            const groups = [];
            
            for (const [id, metadata] of Object.entries(groupsData)) {
                const owner = metadata.owner || 
                              (metadata.participants?.find(p => p.admin === 'superadmin')?.id) || 
                              "غير معروف";
                
                const creationDate = metadata.creation 
                    ? new Date(metadata.creation * 1000).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      })
                    : "??";

                groups.push({
                    id: id,
                    name: metadata.subject || "بدون اسم",
                    members: metadata.participants?.length || 0,
                    owner: owner,
                    ownerNumber: owner.split('@')[0],
                    creation: creationDate
                });
            }

            if (groups.length === 0) {
                return reply("*📭 لا يوجد البوت في أي مجموعة حالياً.*");
            }

            groups.sort((a, b) => b.members - a.members);

            // ✅ البداية الفخمة
            let msg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

     *⌬ قـائـمـة الـمـجـمـوعـات ⌬*

*───━━━⊱  🔍 📊  ⊰━━━───*

*📊 إحصائيات عامة*
*┌────────────────*
*│ الـمـجـمـوعـات : ⦓ ${groups.length} ⦔*
*│ الأعـضـاء : ⦓ ${groups.reduce((sum, g) => sum + g.members, 0).toLocaleString()} ⦔*
*└────────────────*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
`;

            // ✅ عرض كل مجموعة بشكل منفصل
            const topGroups = groups.slice(0, 10);
            
            topGroups.forEach((group, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "📌";
                const groupId = group.id.split('@')[0];
                
                msg += `
${medal} *[#${rank}]*
*┌────────────────*
*│ اسـم : ⦓ ${group.name} ⦔*

*│ آيـدي : ⦓ ${groupId} ⦔*

*│ الأعـضـاء : ⦓ ${group.members} ⦔*

*│ الـمـالـك : ⦓ @${group.ownerNumber} ⦔*

*│ الإنـشـاء : ⦓ ${group.creation} ⦔*
*└────────────────*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
`;
            });

            if (groups.length > 10) {
                msg += `
*✧ وباقي ${groups.length - 10} مجموعة ✧*
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
`;
            }

            msg += `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            const mentions = topGroups.map(g => g.owner).filter(o => o !== "غير معروف");

            await sock.sendMessage(chatId, { 
                text: msg,
                mentions: mentions
            }, { quoted: m });

        } catch (error) {
            console.error("Error in 'مجموعاتي' command:", error);
            await reply(`❌ *حدث خطأ:*\n${error.message}`);
        }
    }
};