import fs from 'fs-extra';

export default {
    name: "اي_دي2",
    aliases: ["ids", "groups2"],
    description: "عرض جميع أي دي المجموعات التي البوت فيها",
    developer: true,

    async run({ sock, m, reply }) {
        const chatId = m.key.remoteJid;
        
        try {
            await sock.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            const groupsData = await sock.groupFetchAllParticipating();
            const groups = [];
            
            for (const [id, metadata] of Object.entries(groupsData)) {
                groups.push({
                    id: id,
                    name: metadata.subject || "بدون اسم",
                    members: metadata.participants?.length || 0
                });
            }

            if (groups.length === 0) {
                return reply("*📭 لا يوجد البوت في أي مجموعة حالياً.*");
            }

            groups.sort((a, b) => b.members - a.members);

            let list = "";
            
            groups.forEach((group, index) => {
                const groupId = group.id.split('@')[0];
                list += `*${index + 1}.* ${group.name}\n   └ 🆔 ${groupId}\n`;
                
                // ✅ فاصل بين كل مجموعة والأخرى (ما عدا آخر مجموعة)
                if (index < groups.length - 1) {
                    list += `*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*\n`;
                }
            });

            const msg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   *⌬ قـائـمـة أيـدي جـمـيـع الـمـجـمـوعـات ⌬*
*───━━━⊱  🔢 📋  ⊰━━━───*

*📊 إحصائيات*
*┌────────────────*
*│ إجـمـالـي الـمـجـمـوعـات : ⦓ ${groups.length} ⦔*
*└────────────────*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

${list}
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`;

            await sock.sendMessage(chatId, { 
                text: msg
            }, { quoted: m });

        } catch (error) {
            console.error("Error in 'اي_دي2' command:", error);
            await reply(`❌ *حدث خطأ:*\n${error.message}`);
        }
    }
};