import fs from 'fs-extra';

export default {
    name: "انذاراتي",
    aliases: ["تحذيراتي", "mywarns"],
    description: "عرض إنذاراتك",
    category: "general",
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("❌ *هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        const warnsPath = './data/warns.json';
        let warnsDB = fs.readJsonSync(warnsPath, { throws: false }) || {};

        // تنظيف الإنذارات المنتهية قبل العرض
        let changed = false;
        for (const key in warnsDB) {
            if (warnsDB[key]?.reasons) {
                const originalLength = warnsDB[key].reasons.length;
                warnsDB[key].reasons = warnsDB[key].reasons.filter(w => w.expiresAt > Date.now());
                warnsDB[key].count = warnsDB[key].reasons.length;
                
                if (originalLength !== warnsDB[key].reasons.length) changed = true;
                if (warnsDB[key].reasons.length === 0) {
                    delete warnsDB[key];
                    changed = true;
                }
            }
        }

        if (changed) fs.writeJsonSync(warnsPath, warnsDB, { spaces: 2 });

        const warnKey = `${jid}_${userJid}`;
        if (!warnsDB[warnKey]) return reply("✅ *لـيـس لـديـك أي إنـذارات*");

        const warns = warnsDB[warnKey];
        const sortedReasons = [...warns.reasons].sort((a, b) => b.date - a.date);
        
        let reasonsList = '';

        sortedReasons.forEach((w, i) => {
            // تواريخ إنجليزية
            const date = new Date(w.date).toLocaleDateString('en-GB');
            const expiryDate = new Date(w.expiresAt).toLocaleDateString('en-GB');
            const timeLeft = w.expiresAt - Date.now();
            const daysLeft = timeLeft > 0 ? Math.ceil(timeLeft / (24 * 60 * 60 * 1000)) : 0;
            
            reasonsList += `\n*${i+1}. ${w.reason}*\n\n`;
            reasonsList += `   *└─ 📅 مـن:* ${date}\n\n`;
            reasonsList += `   *└─ ⏳ يـنـتـهـي:* ${expiryDate}\n\n`;
            
            if (w.by) {
                const byNumber = w.by.split('@')[0];
                reasonsList += `   *└─ 👤 بـواسـطـة:* @${byNumber}\n\n`;
            }
        });

        // التاريخ العربي لانتهاء الإنذارات
        const soonest = warns.reasons.reduce((min, w) => w.expiresAt < min.expiresAt ? w : min);
        const nextExpiryArabic = new Date(soonest.expiresAt).toLocaleDateString('ar-EG');
        const nextExpiryDays = Math.ceil((soonest.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));

        const activeCount = warns.reasons.filter(w => w.expiresAt > Date.now()).length;

        const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*📋 إنـذاراتـك*

*───━━━⊱  ⚠️  ⊰━━━───*

*👤 الـعـضـو:* ⦓ *@${userJid.split('@')[0]}* ⦔


*🔢 الـعـدد:* ⦓ *${activeCount} / 3* ⦔


*📝 الإنـذارات :* 

${reasonsList}
*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*⏳ تـنـتـهـي الإنـذارات :* 

⦓ *${nextExpiryArabic}* ⦔ *(بـعـد ${nextExpiryDays} أيـام)*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

        await bot.sendMessage(jid, {
            text: msg,
            mentions: [userJid, ...warns.reasons.map(w => w.by)]
        }, { quoted: message });
    }
};