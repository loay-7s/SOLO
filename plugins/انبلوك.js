import fs from 'fs-extra';

export default {
    name: "انبلوك",
    aliases: ["فك_الحظر", "unblock"],
    async run({ handler, m, isDeveloper }) {
        // 1. الرد على غير المطورين
        if (!isDeveloper) {
            return handler.sendMessage(m.key.remoteJid, { 
                text: "*⚠️الأمـر ده لـلـمـطـوࢪ بـس يـحـبـي!*" 
            }, { quoted: m });
        }

        // 2. جلب الهدف (المنشن أو الرد) بنفس دقة كود ارايز
        let target = m.mentionedJid?.[0] || m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target) {
            return handler.sendMessage(m.key.remoteJid, { 
                text: "*⚠️ حـددلـي الـمـسـتـخـدم عـشـان افـك حـظـࢪه (مـنـشـنـه أو ࢪد عـلـى ࢪسـالـتـه)*" 
            }, { quoted: m });
        }

        const path = './data/blacklist.json';
        const userNumber = target.split('@')[0];
        
        if (fs.existsSync(path)) {
            let blacklist = fs.readJSONSync(path);
            
            // 3. حالة إذا كان الشخص غير محظور أصلاً
            if (!blacklist.includes(target)) {
                return handler.sendMessage(m.key.remoteJid, { 
                    text: `*┏─━━━━ • ◈ • ━━━━─┓*\n\n*👤 الـمـسـتـخـدم : ⦓ @${userNumber} ⦔*\n\n*✨ الـحـالـة : هـذا الـمـسـتـخـدم غـيـر مـحـظـوࢪ اسـاسـا*\n\n*┗─━━━━ • ◈ • ━━━━─┛*`, 
                    mentions: [target] 
                }, { quoted: m });
            }

            // 4. تنفيذ فك الحظر بنجاح
            blacklist = blacklist.filter(id => id !== target);
            fs.writeJSONSync(path, blacklist);

            return handler.sendMessage(m.key.remoteJid, { 
                text: `*┏─━━━━ • ◈ • ━━━━─┓*\n\n*👤 الـمـسـتـخـدم : ⦓ @${userNumber} ⦔*\n\n*✅ الـحـالـة : تـم فـك الـحـظـࢪ عـنـه وعـاد لـلاسـتـخـدام بـنـجـاح🤝🏼*\n\n*┗─━━━━ • ◈ • ━━━━─┛*`, 
                mentions: [target] 
            }, { quoted: m });
        } else {
            return handler.sendMessage(m.key.remoteJid, { text: "*⚠️ مـلـف الـبـلاك لـسـت غـيـر مـوجـود بـعـد!*" }, { quoted: m });
        }
    }
};