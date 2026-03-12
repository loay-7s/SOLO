import fs from 'fs-extra';

export default {
    name: "استيقاظ",
    aliases: ["awaken", "استيقظ"],
    category: "solo",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const dbPath = './data/SOLO_LEVELING.json';
        
        if (!fs.existsSync('./data')) fs.mkdirSync('./data');
        let soloDB = fs.readJsonSync(dbPath, { throws: false }) || {};

        if (soloDB[userJid]) {
            return sock.sendMessage(chatId, { 
                text: `*｢ 🌑 ｣ الـنـظـام: أنـت مـسـتـيـقـظ بـالـفـعـل.. حدودك البشرية تم كسرها سابقاً!*` 
            }, { quoted: m });
        }

        // --- [ المنشور الترحيبي الفخم ] ---
        const initialText = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
    *⌬ ⚠️ الـــنــظــــام ⚠️ ⌬*
*───━━━⊱  🏮 🏮  ⊰━━━───*

*⚠️ ⦓ تـنـبـيـه مـن الـمـنـظـومـة ⦔*

*تـم اخـتـيـارك كـمُـشـارك فـي الـنـظـام.*

*لـقـد اسـتـشـعـرت الأرض رغـبـتـك فـي الـقـوة..*

*⎔⋅• صـنـفـك الـحـالـي : ⦓ بـشـري (فـانٍ) ⦔*

*⎔⋅• مـسـتـوى الـطـاقـة : ⦓ غـيـر مـسـتـقـر ⦔*

*──────────────────────*
*🌑 هـل تـقـبـل الـعـهـد وتـصـبـح لـاعـبـاً؟*

*قـد تـواجـه الـمـوت، لـكـنـك سـتـكـسـب الـخـلـود.*
*──────────────────────*

    *☜  ⦓ .نـعـم ⦔  |  ⦓ .لا ⦔*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*⌬〔️ 𝐋𝐄𝐕𝐄𝐋𝐈𝐍𝐆 𝐔𝐏 𝐎𝐑 𝐃𝐈𝐄 〕⌬*`.trim();

        // التفاعل برمز الاستيقاظ
        await sock.sendMessage(chatId, { react: { text: "👁️‍🗨️", key: m.key } });

        const awakeImg = './media/awake.jpg';
        if (fs.existsSync(awakeImg)) {
            await sock.sendMessage(chatId, { 
                image: fs.readFileSync(awakeImg), 
                caption: initialText,
                mentions: [userJid] 
            }, { quoted: m });
        } else {
            await sock.sendMessage(chatId, { text: initialText, mentions: [userJid] }, { quoted: m });
        }
    }
};