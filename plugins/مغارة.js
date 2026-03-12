import fs from 'fs-extra';

// ==================== قائمة المنتجات (لحساب قوة الأسلحة) ====================
const products = [
    // ⚔️ أسلحة المقاتل
    { id: 1, name: "🗡️ سيف الظلام", price: 200, type: "weapon", class: "مـقـاتـل", power: 5, desc: "سيف صغير من ظلال الموتى" },
    { id: 2, name: "⚔️ سيف كاسر العظام", price: 500, type: "weapon", class: "مـقـاتـل", power: 12, desc: "سيف ثقيل يكسر عظام الأعداء" },
    { id: 3, name: "🗡️◾ نصل الإمبراطور الأسود", price: 1200, type: "weapon", class: "مـقـاتـل", power: 25, crit: 5, desc: "سلاح أسطوري للإمبراطور" },

    // 🔥 أسلحة الساحر
    { id: 4, name: "🔮 عصا المانا", price: 200, type: "weapon", class: "سـاحـر", magic: 5, desc: "عصا بسيطة تركز المانا" },
    { id: 5, name: "✨ صولجان النجوم", price: 500, type: "weapon", class: "سـاحـر", magic: 12, desc: "صولجان مرصع بنجوم الظلام" },
    { id: 6, name: "🔥◾ جوهرة التنين الأحمر", price: 1200, type: "weapon", class: "سـاحـر", magic: 25, burn: 5, desc: "جوهرة تنين تحرق الأعداء" },

    // 🥷 أسلحة المغتال
    { id: 7, name: "🗡️ سكاكين الظل", price: 200, type: "weapon", class: "مـغـتـال", power: 5, dodge: 2, desc: "سكاكين صغيرة للهجمات السريعة" },
    { id: 8, name: "🥷 خناجر الشبح", price: 500, type: "weapon", class: "مـغـتـال", power: 12, dodge: 5, desc: "خناجر شبحية تخفي أثرك" },
    { id: 9, name: "🌑◾ نصل العدم", price: 1200, type: "weapon", class: "مـغـتـال", power: 25, dodge: 10, desc: "نصل من العدم نفسه" },

    // 🏹 أسلحة الرامي
    { id: 10, name: "🏹 قوس الصياد", price: 200, type: "weapon", class: "رامـي سـهـام", power: 5, desc: "قوس بسيط للصيادين" },
    { id: 11, name: "🎯 قوس الرياح", price: 500, type: "weapon", class: "رامـي سـهـام", power: 12, accuracy: 3, desc: "قوس يتبع الرياح" },
    { id: 12, name: "🌪️◾ قوس العاصفة", price: 1200, type: "weapon", class: "رامـي سـهـام", power: 25, accuracy: 7, desc: "قوس يستدعي العواصف" },

    // 🧬 أسلحة المعالج
    { id: 13, name: "🧬 طاقم الشفاء", price: 200, type: "weapon", class: "مـعـالـج", heal: 5, desc: "طاقم للشفاء البسيط" },
    { id: 14, name: "✨ صولجان الحياة", price: 500, type: "weapon", class: "مـعـالـج", heal: 12, desc: "صولجان يمنح الحياة" },
    { id: 15, name: "💫◾ طاقم الخلود", price: 1200, type: "weapon", class: "مـعـالـج", heal: 25, regen: 5, desc: "طاقم أسطوري للتجديد" },

    // 💀 أسلحة مستحضر الأرواح
    { id: 16, name: "💀 كتاب الموتى", price: 300, type: "weapon", class: "مـسـتـحـضـر الأرواح", dark: 8, desc: "كتاب قديم يستدعي الأرواح" },
    { id: 17, name: "🦴 صولجان العظام", price: 800, type: "weapon", class: "مـسـتـحـضـر الأرواح", dark: 18, desc: "صولجان من عظام الأعداء" },
    { id: 18, name: "👑◾ تاج الظلال", price: 2000, type: "weapon", class: "مـسـتـحـضـر الأرواح", dark: 35, summon: true, desc: "تاج الظلال يستدعي جيشاً من الموتى" },

    // 🛡️ دروع عامة
    { id: 19, name: "🧥 معطف المسافر", price: 100, type: "armor", defense: 2, desc: "معطف بسيط يحميك قليلاً" },
    { id: 20, name: "🥼 درع الجلد", price: 300, type: "armor", defense: 5, desc: "درع جلدي متين" },
    { id: 21, name: "⚜️ درع الفارس", price: 800, type: "armor", defense: 12, desc: "درع فولاذي ثقيل" },
    { id: 22, name: "👑◾ درع الملك الظلام", price: 2000, type: "armor", defense: 25, resist: 10, desc: "درع أسطوري للملوك" }
];

// ==================== دالة حساب قوة الرتبة ====================
function getRankPower(rank) {
    const powers = {
        "E": 10,
        "D": 25,
        "C": 50,
        "B": 100,
        "A": 200,
        "S": 400,
        "SS": 800,
        "SSS": 1500
    };
    return powers[rank] || 10;
}

// ==================== دالة حساب قوة الصياد ====================
function calculatePlayerPower(player) {
    let power = (player.level * 2) + getRankPower(player.rank);
    
    if (player.equipped?.weapon) {
        const weapon = products.find(p => p.id === player.equipped.weapon);
        if (weapon) {
            power += weapon.power || weapon.magic || weapon.dark || 0;
        }
    }
    
    return power;
}

// ==================== تعريف مهام النقابة حسب الرتبة ====================
function getQuestsByRank(rank) {
    const quests = {
        "E": [
            { id: "E1", name: "الـمـرسـل الـنـشـيـط", desc: "أرسـل 50 رسـالـة", target: 50, type: "messages" },
            { id: "E2", name: "مـسـتـخـدم الأوامـر", desc: "اسـتـخـدم 10 أوامـر", target: 10, type: "commands" },
            { id: "E3", name: "الـمـتـفـاعـل", desc: "رد عـلى 15 رسـالـة", target: 15, type: "replies" }
        ],
        "C": [
            { id: "C1", name: "الـمـرسـل الـمـتـقـدم", desc: "أرسـل 150 رسـالـة", target: 150, type: "messages" },
            { id: "C2", name: "الـمـغـامـر", desc: "افـتـح مـغـارة واحـدة", target: 1, type: "dungeon_open" },
            { id: "C3", name: "مـسـتـخـدم مـتـمـرس", desc: "اسـتـخـدم 15 أمـراً", target: 15, type: "commands" },
            { id: "C4", name: "الـمـتـفـاعـل الـمـحـتـرف", desc: "رد عـلى 25 رسـالـة", target: 25, type: "replies" }
        ],
        "B": [
            { id: "B1", name: "الـمـرسـل الـمـحـتـرف", desc: "أرسـل 300 رسـالـة", target: 300, type: "messages" },
            { id: "B2", name: "الـمـغـامـر الـمـحـتـرف", desc: "افـتـح 3 مـغـارات", target: 3, type: "dungeon_open" },
            { id: "B3", name: "قـاهـر الـمـغـارات", desc: "اربـح فـي مـغـارة واحـدة", target: 1, type: "dungeon_win" },
            { id: "B4", name: "مـديـر الأوامـر", desc: "اسـتـخـدم 20 أمـراً", target: 20, type: "commands" },
            { id: "B5", name: "الـمـتـفـاعـل الأسـطـورة", desc: "رد عـلى 30 رسـالـة", target: 30, type: "replies" }
        ],
        "A": [
            { id: "A1", name: "الـمـرسـل الأسـطـورة", desc: "أرسـل 500 رسـالـة", target: 500, type: "messages" },
            { id: "A2", name: "الـمـغـامـر الأسـطـورة", desc: "افـتـح 5 مـغـارات", target: 5, type: "dungeon_open" },
            { id: "A3", name: "بـطـل الـمـغـارات", desc: "اربـح فـي 3 مـغـارات", target: 3, type: "dungeon_win" },
            { id: "A4", name: "الـقـاتـل الأسـطـورة", desc: "اربـح مـعـركـة هـجـوم", target: 1, type: "attack_win" },
            { id: "A5", name: "مـلـك الأوامـر", desc: "اسـتـخـدم 25 أمـراً", target: 25, type: "commands" }
        ],
        "S": [
            { id: "S1", name: "الـمـرسـل الـعـمـلاق", desc: "أرسـل 800 رسـالـة", target: 800, type: "messages" },
            { id: "S2", name: "الـمـغـامـر الـعـمـلاق", desc: "افـتـح 8 مـغـارات", target: 8, type: "dungeon_open" },
            { id: "S3", name: "مـديـر الـمـغـارات", desc: "اربـح فـي 5 مـغـارات", target: 5, type: "dungeon_win" },
            { id: "S4", name: "الـقـاتـل الـعـمـلاق", desc: "اربـح 3 مـعـارك هـجـوم", target: 3, type: "attack_win" },
            { id: "S5", name: "إمـبـراطـور الأوامـر", desc: "اسـتـخـدم 30 أمـراً", target: 30, type: "commands" }
        ],
        "SS": [
            { id: "SS1", name: "الـمـرسـل الـمـلـكـي", desc: "أرسـل 1200 رسـالـة", target: 1200, type: "messages" },
            { id: "SS2", name: "الـمـغـامـر الـمـلـكـي", desc: "افـتـح 12 مـغـارة", target: 12, type: "dungeon_open" },
            { id: "SS3", name: "مـلـك الـمـغـارات", desc: "اربـح فـي 8 مـغـارات", target: 8, type: "dungeon_win" },
            { id: "SS4", name: "الـقـاتـل الـمـلـكـي", desc: "اربـح 5 مـعـارك هـجـوم", target: 5, type: "attack_win" },
            { id: "SS5", name: "مـلـك الأوامـر", desc: "اسـتـخـدم 40 أمـراً", target: 40, type: "commands" }
        ]
    };
    
    return quests[rank] || quests["E"];
}

export default {
    name: "مغارة",
    aliases: ["غارة", "dungeon"],
    category: "solo",

    async run({ sock, m, userJid, reply }) {
        const soloPath = './data/SOLO_LEVELING.json';
        const dungeonPath = './data/active_dungeons.json';
        
        let soloDB = fs.readJsonSync(soloPath, { throws: false }) || {};
        const player = soloDB[userJid];

        if (!player) return reply("｢ ⚠️ ｣ *لـم يـتـم الـعـثـور عـلى بـيـانـاتـك!*");
        if (player.rank === "E") return reply("｢ ❌ ｣ *رتبـتك [ E ] ضعـيفة جـداً.. ارتقِ أولاً!*");

        // ✅ التحقق من وجود مخزون
        if (!player.inventory) player.inventory = [];

        const lastDungeon = player.lastDungeonTime || 0;
        const now = Date.now();

        // ✅ التحقق من الأمر (دفع أو عادي)
        const args = m.message?.conversation?.split(' ') || [];
        const isPaying = args[1] === "فلوس" || args[1] === "ذهب" || args[1] === "دفع";

        // ✅ 1. التحقق من حجر الروني الأسطوري (رقم 29) - أهم حاجة
        const hasLegendaryRune = player.inventory.some(item => item.id === 29);

        if (hasLegendaryRune) {
            // استخدم الحجر تلقائياً
            player.inventory = player.inventory.filter(item => item.id !== 29);
            await sock.sendMessage(m.key.remoteJid, { 
                text: `*✨ تـم اسـتـخـدام الـحـجـر الأسـطـوري (رقم 29)!*\n*✅ دخلـت الـمـغـارة بـدون انـتـظـار*` 
            }, { quoted: m });
            // استمر في تنفيذ باقي الكود (دخول المغارة)
        }
        // ✅ 2. التحقق من الدفع بالذهب (50 ذهب فقط)
        else if (isPaying) {
            if (player.gold >= 350) {
                player.gold -= 350;
                await sock.sendMessage(m.key.remoteJid, { 
                    text: `*💰 دفـعـت 350 ذهـب*\n*✅ دخلـت الـمـغـارة بـدون انـتـظـار*` 
                }, { quoted: m });
                // استمر في تنفيذ باقي الكود
            } else {
                return reply(`*❌ مـعـاكش 350 ذهـب!*\n*🔹 الـذهـب الـمـوجـود:* ${player.gold || 0}`);
            }
        }
        // ✅ 3. التحقق من الكول داون العادي
        else if (now - lastDungeon < 3 * 60 * 60 * 1000) {
            const diff = (lastDungeon + 3 * 60 * 60 * 1000) - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return reply(`｢ ⏳ ｣ *تـبـقـى [ ${hours} س و ${mins} د ]*\n*🔹 أو ادفع 350 ذهـب:* .مغارة دفع\n*🔹 أو استخدم حجر أسطوري (رقم 29)*`);
        }

        // تفاعل بالرموز التعبيرية
        await sock.sendMessage(m.key.remoteJid, { react: { text: "⚔️", key: m.key } });

        const ranks = ["E", "D", "C", "B", "A", "S", "SS", "SSS"];
        let pIdx = ranks.indexOf(player.rank || "D");
        let dRank = "";
        let roll = Math.random() * 100;

        if (player.rank === "SSS") {
            dRank = roll < 30 ? "SS" : "SSS";
        } else {
            if (roll < 50) dRank = ranks[pIdx];
            else if (roll < 85) dRank = ranks[Math.min(pIdx + 1, ranks.length - 1)];
            else dRank = ranks[Math.min(pIdx + 2, ranks.length - 1)];
        }

        if (dRank === "E" || dRank === "D") dRank = "C";

        // ✅ حساب قوة الصياد
        const playerPower = calculatePlayerPower(player);

        // اختيار تصميم العنوان حسب الخطورة
        let designHeader = "💠  𝐃 𝐔 𝐍 𝐆 𝐄 𝐎 𝐍  💠";
        let statusIcon = "✨";
        if (["S", "SS", "SSS"].includes(dRank)) {
            designHeader ="💀𝐃𝐀𝐍𝐆𝐄𝐑: 𝐑𝐄-𝐀𝐖𝐀𝐊𝐄𝐍𝐄𝐃💀";
            statusIcon = "🚨";
        }

        // ✅ رسالة بوابة المغارة مع إضافة القوة
        const gateMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
      ${designHeader}
*───━━━⊱  💠 💠  ⊰━━━───*

*${statusIcon} الـحـالـة : ⦓ تـم رصـد طـاقـة مـانـا مـنـبـعـثـة ⦔*

*📜 رتـبـة الـمـغـارة : ⦓ [ ${dRank} ] ⦔*

*👤 الـمـسـتـكـشـف : ⦓ @${userJid.split('@')[0]} ⦔*

*🛡️ الـفـئـة الـقـتـالـيـة : ⦓ ${player.class} ⦔*

*⚡ قـوة الـصـيـاد : ⦓ ${playerPower} ⦔*

*🏅 رتـبـة الـصـيـاد : ⦓ ${player.rank} ⦔*

*───━━━⊱  🏮 🏮  ⊰━━━───*

*🌑 الـظـلام يـسـتـدعـيـك لـلـداخـل.. هـل تـجـرؤ؟*

*🎮 لـبـدء الـتـطـهـيـر، قـم بـالـرد بـ:*
*☜  ⦓ .اقتحام ⦔*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
     ~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

        const sent = await sock.sendMessage(m.key.remoteJid, { text: gateMsg, mentions: [userJid] }, { quoted: m });

        let dungeons = fs.readJsonSync(dungeonPath, { throws: false }) || {};
        dungeons[m.key.remoteJid] = { 
            playerId: userJid, 
            dRank: dRank, 
            dIdx: ranks.indexOf(dRank), 
            pIdx: pIdx, 
            msgId: sent.key.id,
            pClass: player.class,
            playerPower: playerPower
        };
        fs.writeJsonSync(dungeonPath, dungeons);

        // ✅ تحديث مهمة النقابة (فتح مغارة)
        if (player.guild?.currentQuest) {
            const questId = player.guild.currentQuest;
            const dungeonOpenQuests = ["C2", "B2", "A2", "S2", "SS2"];
            
            if (dungeonOpenQuests.includes(questId)) {
                player.guild.questProgress = (player.guild.questProgress || 0) + 1;
                
                const rank = player.rank || "E";
                const quests = getQuestsByRank(rank);
                const quest = quests.find(q => q.id === questId);
                if (quest && player.guild.questProgress > quest.target) {
                    player.guild.questProgress = quest.target;
                }
            }
        }

        player.lastDungeonTime = Date.now();
        player.lastWinInDungeon = false; 
        
        fs.writeJsonSync(soloPath, soloDB, { spaces: 2 });
    }
};