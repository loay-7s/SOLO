import fs from 'fs-extra';

export default {
    name: "نعم",
    aliases: ["yes"],
    category: "solo",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const dbPath = './data/SOLO_LEVELING.json';
        
        let soloDB = fs.readJsonSync(dbPath, { throws: false }) || {};
        if (soloDB[userJid]) return; 

        // 1. نظام الفئات (القدر المحتوم)
        const categories = ["مـقـاتـل ⚔️", "مـغـتـال 🥷🏻", "مـعـالـج 🧬", "سـاحـر 🔥", "رامـي سـهـام 🏹"];
        let finalClass = "";
        
        if (Math.random() <= 0.10) {
            finalClass = "مـسـتـحـضـر الأرواح 💀";
        } else {
            finalClass = categories[Math.floor(Math.random() * categories.length)];
        }

        // 2. تسجيل البيانات الأساسية (مع إضافة الأنظمة الجديدة)
        soloDB[userJid] = {
            class: finalClass,
            level: 1,
            rank: "E",
            xp: 0,
            gold: 100, // ✅ هدية بسيطة للبداية
            inventory: [], // ✅ مخزن فارغ
            equipped: { weapon: null, armor: null }, // ✅ معدات فارغة
            lastWinInDungeon: false,
            dailyQuests: { step: 1, msgCount: 0, cmdCount: 0 },
            guild: { // ✅ نظام النقابة
                currentQuest: null,
                questProgress: 0,
                completedQuests: [],
                lastReset: Date.now()
            },
            lastBox: 0, // ✅ لصندوق الكنز
            lastArena: 0, // ✅ لساحة القتال
            awakenedAt: new Date().toDateString()
        };
        
        fs.writeJsonSync(dbPath, soloDB, { spaces: 2 });

        // 3. التفاعل برمز الاستيقاظ الكوني
        await sock.sendMessage(chatId, { react: { text: "💠", key: m.key } });

        const rankText = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
    *⚠️ [ تـم كـسـر الـحـدود ] ⚠️*
*───━━━⊱  💠 💠  ⊰━━━───*

*📜 تـم تـحـديـد مـصـيـرك أيـهـا الـصـيـاد!*
*الـنـظـام يـرحـب بـك فـي عـالـمـه الـمُـظـلـم..*

*👤 الـمـسـتـخـدم : ⦓ @${userJid.split('@')[0]} ⦔*

*🛡️ الـفـئـة الـمُـقـدرة : ⦓ ${finalClass} ⦔*

*🏅 الـرتـبـة الأولـيـة : ⦓ [ 𝐄 ] ⦔*

*📈 الـمـسـتـوى الـحـالـي : ⦓ 𝟏 ⦔*

*💰 هـديـة الـبـدايـة : ⦓ 100 ذهـب ⦔*

*───━━━⊱  🏮 🏮  ⊰━━━───*

*⚠️ تـذكـر: الـنـظـام لا يـقـبـل الـتـراجع.*

*إمـا أن تـرتـقـي وتـصـبـح مـلـكـاً، أو تـسـقـط وتـصـبـح ظـلاً.*

*🎮 ابـدأ أول مـهـامـك الآن بـالـتـفـاعـل!*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
   ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

        const rankImg = './media/ranke.jpg';
        const awakeAudio = './media/awake.mp3';

        try {
            if (fs.existsSync(rankImg)) {
                await sock.sendMessage(chatId, { 
                    image: fs.readFileSync(rankImg), 
                    caption: rankText, 
                    mentions: [userJid] 
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { text: rankText, mentions: [userJid] }, { quoted: m });
            }

            if (fs.existsSync(awakeAudio)) {
                await sock.sendMessage(chatId, { 
                    audio: fs.readFileSync(awakeAudio), 
                    mimetype: 'audio/mp4',
                    ptt: false
                }, { quoted: m });
            }
        } catch (e) {
            console.error("Error in Yes Command:", e);
        }
    }
};