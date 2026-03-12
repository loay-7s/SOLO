import fs from 'fs';

const databasePath = './data/ba9ma.json';

export default {
    name: "بصمة",
    aliases: ["بصمتي", "البصمة"],
    category: "fun",

    async run({ sock, m, text }) {
        const chatId = m.key.remoteJid;
        
        // --- [ حل مشكلة الـ split ] ---
        const sender = m.sender || m.key.participant || "";
        const senderId = sender ? sender.split('@')[0] : "User";
        // ------------------------------

        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        if (!fs.existsSync(databasePath) || fs.readFileSync(databasePath, 'utf8').trim() === "") {
            fs.writeFileSync(databasePath, JSON.stringify({}));
        }

        let db;
        try {
            db = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        } catch (e) {
            db = {};
        }

        if (text === 'حذف') {
            if (db[sender]) {
                delete db[sender];
                fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
                await sock.sendMessage(chatId, { react: { text: "🗑️", key: m.key } });
                return await sock.sendMessage(chatId, { 
                    text: `*╭─━━━━━━  𝐒𝐎𝐋𝐎  ━━━━━━─╮*\n*│ 🗑️ تـم حـذف بـصـمـتـك بـنـجـاح !*\n*╰─━━━━━━━━━━━━━━━━━━─╯*`, 
                    mentions: [sender] 
                }, { quoted: m });
            } else {
                return await sock.sendMessage(chatId, { text: "*⚠️ لا توجد بصمة مسجلة لحذفها.*" }, { quoted: m });
            }
        }

        if (!text) {
            if (db[sender]) {
                const userBasma = db[sender];
                const msg = `
*╭─━━━  𝐒𝐎𝐋𝐎 𝐋𝐄𝐆𝐀𝐂𝐘  ━━━─╮*

*│ ◈ الـمُـسَجـِـل : ⦓ @${senderId} ⦔*
*│*
*│ ◈ البـصـمـة : ⦓ ${userBasma.text} ⦔*

*│ ◈ الـتـاࢪيـخ : ⦓ ${userBasma.date} ⦔*
*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();
                return await sock.sendMessage(chatId, { text: msg, mentions: [sender] }, { quoted: m });
            } else {
                const helpMsg = `
*╭─━━━  𝐒𝐎𝐋𝐎 𝐇𝐄𝐋𝐏  ━━━─╮*
*│ ◈ طـريـقـة اسـتـخدام الأمـر: ◈*
*│*
*│ 💾 لتسجيل بصمة:*
*│ ⦓ .بصمة + نصك ⦔*
*│*
*│ 🗑️ لحذف بصمتك:*
*│ ⦓ .بصمة حذف ⦔*
*│*
*│ 🔍 لعرض بصمتك:*
*│ ⦓ .بصمتي ⦔*
*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();
                return await sock.sendMessage(chatId, { text: helpMsg }, { quoted: m });
            }
        }

        const date = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        db[sender] = { text: text, date: date };
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await sock.sendMessage(chatId, { react: { text: "✍️", key: m.key } });
        
        const successMsg = `
*╭─━━━━━━  𝐒𝐎𝐋𝐎  ━━━━━━─╮*
*│ ✅ تـم تـحـديـث بـصـمـتـك بـنـجـاح !*
*│*
*│ ◈ لـرؤيـة بـصـمـتـك اكـتـب :*
                    *⦓ .بصمتي ⦔*
*╰─━━━━━━━━━━━━━━━━━━─╯*`.trim();

        await sock.sendMessage(chatId, { text: successMsg, mentions: [sender] }, { quoted: m });
    }
};