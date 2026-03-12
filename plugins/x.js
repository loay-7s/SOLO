import fs from 'fs-extra';

export default {
    name: "لا",
    aliases: ["no"],
    category: "solo",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const dbPath = './data/SOLO_LEVELING.json';
        
        let soloDB = fs.readJsonSync(dbPath, { throws: false }) || {};

        // إذا كان لاعباً بالفعل، نتجاهل الأمر تماماً
        if (soloDB[userJid]) {
            return; 
        }

        // تفاعل برمز الموت أو السقوط
        await sock.sendMessage(chatId, { react: { text: "💀", key: m.key } });

        // الاستمارة المميتة والأسطورية (3 أجزاء)
        const ripText = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

   *⚠️ [ عـقـوبـة الـمـنـظـومـة ] ⚠️*

*───━━━⊱  🩸 🩸  ⊰━━━───*

*❑ [ قـرار مـتـهـور ] 🥀↯*
*──────────────────────*
*لـقـد رفـضـت الـيـد الـمـمـتـدة إلـيـك مـن الـظـلال.*

*الـنـظـام لا يـقـبـل الـرفـض مـن الـكـائـنـات الـفـانـيـة.*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ [ الـنـهـايـة ] ⚰️↯*
*──────────────────────*
*تـم تـنـفـيـذ الـشـرط الـقـاتـل فـي الـحـال.*

*قـلـبـك يـتـوقـف عـن الـنـبـض.. وروحـك تـتـلاشـى.*

*⎔┄┄─── ⊱╎⌯ 🌑 ⌯╎⊰ ───┄┄⎔*

*❑ [ الـحـالـة ] 💀↯*
*──────────────────────*
*تـم الـقـضـاء عـلـيـك نـهـائـيـاً مـن الـسـجـلات.*

*⦓ الـحـالـة : مـيـت ⦔*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   ~*『𝑮𝑨𝑴𝑬⊰🩸⊱𝑶𝑽𝑬𝑹』*~`.trim();

        const ripImg = './media/rip.jpg';
        const ripAudio = './media/rip.mp3';

        try {
            if (fs.existsSync(ripImg)) {
                await sock.sendMessage(chatId, { 
                    image: fs.readFileSync(ripImg), 
                    caption: ripText,
                    mentions: [userJid]
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { text: ripText, mentions: [userJid] }, { quoted: m });
            }

            if (fs.existsSync(ripAudio)) {
                await sock.sendMessage(chatId, { 
                    audio: fs.readFileSync(ripAudio), 
                    mimetype: 'audio/mp4', 
                    ptt: false 
                }, { quoted: m });
            }
        } catch (e) {
            console.error("Error in No Command:", e);
        }
    }
};
