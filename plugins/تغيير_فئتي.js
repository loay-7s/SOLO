import fs from 'fs-extra';
const soloPath = './data/SOLO_LEVELING.json';

// قائمة الفئات المتاحة (مطابقة 100% لأمر استيقظ)
const availableClasses = [
    "مـقـاتـل ⚔️ ☞",
    "سـاحـر 🔥 ☞", 
    "مـغـتـال 🥷🏻 ☞",
    "رامـي سـهـام 🏹 ☞",
    "مـعـالـج 🧬 ☞",
    "مـسـتـحـضـر الأرواح 💀"
];

export default {
    name: "تغيير_فئتي",
    aliases: ["تغيير", "changeclass", "تبديل"],
    description: "تغيير فئتك باستخدام لفافة تغيير الفئة",
    category: "solo",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const cleanSender = sender.split('@')[0];

        // قراءة بيانات الصياد
        let soloData = {};
        try {
            soloData = await fs.readJson(soloPath);
        } catch {
            return sock.sendMessage(chatId, { text: "*⚠️ لا تـوجـد بـيـانـات لـلـصـيـاديـن بـعـد!*" });
        }

        // البحث عن الصياد
        let hunterJid = null;
        let hunter = null;

        if (soloData[sender]) {
            hunterJid = sender;
            hunter = soloData[sender];
        } else {
            for (const [jid, data] of Object.entries(soloData)) {
                if (jid.includes(cleanSender)) {
                    hunterJid = jid;
                    hunter = data;
                    break;
                }
            }
        }

        if (!hunter) {
            return sock.sendMessage(chatId, { text: "*⚠️ اكـتـب .استيقظ أولاً لـتـصـبـح صـيـاداً!*" });
        }

        // التأكد من وجود المخزن
        if (!hunter.inventory) hunter.inventory = [];

        // التحقق من وجود لفافة تغيير الفئة (رقم 38)
        const scrollIndex = hunter.inventory.findIndex(item => item.id === 38);
        if (scrollIndex === -1) {
            return sock.sendMessage(chatId, { text: "*❌ لـيـس لـديـك لـفـافـة تـغـيـيـر الـفـئـة! اشـتـرها من المخزن (رقم 38)*" });
        }

        await sock.sendMessage(chatId, { react: { text: "🔄", key: m.key } });

        // اختيار فئة عشوائية (غير الفئة الحالية)
        const currentClass = hunter.class;
        let newClass = currentClass;
        
        while (newClass === currentClass) {
            newClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
        }

        // حفظ الفئة الجديدة
        const oldClass = hunter.class;
        hunter.class = newClass;
        
        // إزالة اللفافة من المخزن
        hunter.inventory.splice(scrollIndex, 1);

        // حفظ البيانات
        soloData[hunterJid] = hunter;
        await fs.writeJson(soloPath, soloData, { spaces: 2 });

        // رسالة النجاح الأسطورية
        const successMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   *⌬ تـغـيـيـر الـفـئـة ⌬*
*───━━━⊱  🔄  ⊰━━━───*

*👤 الـصـيـاد:* ⦓ @${cleanSender} ⦔

*📜 الـفـئـة الـقـديـمـة:* ⦓ ${oldClass} ⦔

*✨ الـفـئـة الـجـديـدة:* ⦓ ${newClass} ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*💠 " مـن يـتـغـيـر يـتـطـور، ومـن يـتـطـور يـصـبـح أسـطـورة "*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

        await sock.sendMessage(chatId, { 
            text: successMsg, 
            mentions: [sender] 
        }, { quoted: m });

        await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });
    }
};