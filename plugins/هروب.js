import fs from 'fs-extra';
const soloPath = './data/SOLO_LEVELING.json';
const dungeonPath = './data/active_dungeons.json';

export default {
    name: "هروب",
    aliases: ["escape"],
    category: "solo",

    async run({ sock, m }) {
        const chatId = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const cleanSender = sender.split('@')[0];

        // قراءة البيانات
        let soloDB = fs.readJsonSync(soloPath, { throws: false }) || {};
        let dungeons = fs.readJsonSync(dungeonPath, { throws: false }) || {};
        
        const player = soloDB[sender];
        const currentDungeon = dungeons[chatId];

        // التحقق من وجود اللاعب
        if (!player) {
            return sock.sendMessage(chatId, { 
                text: `*⚠️ اكـتـب .استيقظ أولاً لـتـصـبـح صـيـاداً!*` 
            }, { quoted: m });
        }

        // التحقق من وجود مغارة
        if (!currentDungeon) {
            return sock.sendMessage(chatId, { 
                text: `*❌ لا تـوجـد مـغـارة نـشـطـة لـتـهـرب مـنـهـا!*\n\n*🔹 ادخـل مـغـارة أولاً:* .مغارة` 
            }, { quoted: m });
        }

        // التحقق من ملكية المغارة
        if (currentDungeon.playerId !== sender) {
            return sock.sendMessage(chatId, { 
                text: `*❌ هـذه الـمـغـارة لـيـس لـك!*` 
            }, { quoted: m });
        }

        // التأكد من وجود مخزون
        if (!player.inventory) player.inventory = [];

        // التحقق من وجود لفافة النقل (رقم 35)
        const hasScroll = player.inventory.some(item => item.id === 35);
        
        if (!hasScroll) {
            return sock.sendMessage(chatId, { 
                text: `*❌ لـيـس لـديـك لـفـافـة الـنـقـل!*\n\n*🔹 اشـتـرها من:* .مخزن_الصيادين شراء 35` 
            }, { quoted: m });
        }

        // تفاعل
        await sock.sendMessage(chatId, { react: { text: "🏃", key: m.key } });

        // إزالة اللفافة من المخزن
        const scrollIndex = player.inventory.findIndex(item => item.id === 35);
        player.inventory.splice(scrollIndex, 1);
        
        // حفظ اسم المغارة للرسالة
        const dungeonName = currentDungeon.name || "الـمـغـارة الـمـجهـولـة";
        
        // حذف المغارة
        delete dungeons[chatId];
        
        // حفظ البيانات
        fs.writeJsonSync(soloPath, soloDB, { spaces: 2 });
        fs.writeJsonSync(dungeonPath, dungeons, { spaces: 2 });

        const escapeMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ هـروب مـن الـمـغـارة ⌬*

*───━━━⊱  🏃  ⊰━━━───*


*👤 الـصـيـاد:* ⦓ @${cleanSender} ⦔

*🏰 الـمـغـارة:* *${dungeonName}*


*📜 تـم اسـتـخـدام:* *لفافة النقل* (رقم 35)

*✅ هـربـت بـأمـان بـدون خـسـائـر*

*💨 عـدت إلـى الـسـاحـة الـرئـيـسـيـة*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

        await sock.sendMessage(chatId, { 
            text: escapeMsg, 
            mentions: [sender] 
        }, { quoted: m });
    }
};