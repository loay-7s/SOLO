import fs from 'fs-extra';
const soloPath = './data/SOLO_LEVELING.json';
const dungeonPath = './data/active_dungeons.json';

export default {
    name: "تأكيد_فوز",
    aliases: ["win", "فوز", "اكيد"],
    description: "تضمن الفوز في المعركة باستخدام لفافة البطل",
    category: "solo",

    async run({ sock, m }) {
        const chatId = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        // قراءة البيانات
        let soloData = fs.readJsonSync(soloPath, { throws: false }) || {};
        let dungeons = fs.readJsonSync(dungeonPath, { throws: false }) || {};
        
        const player = soloData[sender];
        const currentDungeon = dungeons[chatId];

        if (!currentDungeon) {
            return sock.sendMessage(chatId, { text: "*❌ لا تـوجـد مـغـارة نـشـطـة!*" }, { quoted: m });
        }

        if (currentDungeon.playerId !== sender) {
            return sock.sendMessage(chatId, { text: "*❌ هـذه الـمـغـارة لـيـس لـك!*" }, { quoted: m });
        }

        // التحقق من وجود لفافة البطل (رقم 37)
        const scrollIndex = player?.inventory?.findIndex(item => item.id === 37);
        if (scrollIndex === -1 || scrollIndex === undefined) {
            return sock.sendMessage(chatId, { text: "*❌ لـيـس لـديـك لـفـافـة الـبـطـل! اشـتـرها من المخزن (رقم 37)*" }, { quoted: m });
        }

        // إزالة اللفافة من المخزن
        player.inventory.splice(scrollIndex, 1);
        
        // تسجيل أن المعركة القادمة فوز مضمون
        currentDungeon.guaranteedWin = true;
        
        dungeons[chatId] = currentDungeon;
        
        fs.writeJsonSync(soloPath, soloData, { spaces: 2 });
        fs.writeJsonSync(dungeonPath, dungeons, { spaces: 2 });

        const msg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   *⌬ تـأكـيـد الـفـوز ⌬*
*───━━━⊱  🏆  ⊰━━━───*

*📜 اسـتـخـدمـت لـفـافـة الـبـطـل*

*⚔️ مـعـركـتـك الـقـادمـة فـوز مـضـمـون 100%*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

        await sock.sendMessage(chatId, { text: msg }, { quoted: m });
        await sock.sendMessage(chatId, { react: { text: "🏆", key: m.key } });
    }
};