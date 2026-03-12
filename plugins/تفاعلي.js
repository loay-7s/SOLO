import fs from 'fs';

const dbPath = './data/activity.json';

export default {
    name: "تفاعلي",
    aliases: ["نشاطي", "تفاعل"],
    category: "stats",

    async run({ sock, m, text }) {
        const chatId = m.key.remoteJid;
        const sender = m.sender || m.key.participant || "";
        const senderId = sender.split('@')[0];
        const cleanId = sender.split('@')[0].split(':')[0] + "@s.whatsapp.net";

        // قراءة البيانات التي يسجلها الهندلر
        if (!fs.existsSync(dbPath)) {
            return await sock.sendMessage(chatId, { text: "*⚠️ لا توجد بيانات تفاعل مسجلة حتى الآن.*" }, { quoted: m });
        }

        let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

        // جلب عدد رسائل المستخدم من الداتابيز
        const userActivity = db.users[cleanId] ? db.users[cleanId].count : 0;

        // تصميم رسالة العرض الفخمة
        const activityMsg = `
*╭─━━━━  𝐒𝐎𝐋𝐎 𝐒𝐓𝐀𝐓𝐒  ━━━─╮*
*│*
*│ 👤┇ الـمُـسـتـخـدم : ⦓ @${senderId} ⦔*
*│*
*│ 📊┇ نـشـاطـك الـيـومـي :*
*│ ⦓ ${userActivity} ⦔ رسـالـة*
*│*
*│ 📅┇ الـتـاريـخ : ⦓ ${today} ⦔*
*│*
*│ ⚙️┇ يـتـم الـتـصـفـيـر الـتـلـقـائـي كـل 24 سـاعـة*
*│*
*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();

        await sock.sendMessage(chatId, { react: { text: "📊", key: m.key } });
        
        return await sock.sendMessage(chatId, { 
            text: activityMsg, 
            mentions: [sender] 
        }, { quoted: m });
    }
};