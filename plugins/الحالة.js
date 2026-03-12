import fs from 'fs-extra';

// ==================== قائمة المنتجات (نفس اللي في المخزن) ====================
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

export default {
    name: "الحالة",
    aliases: ["status", "حالتي", "ملفي"],
    category: "solo",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const dbPath = './data/SOLO_LEVELING.json';
        
        let soloDB = fs.readJsonSync(dbPath, { throws: false }) || {};
        
        if (!soloDB[userJid]) {
            return sock.sendMessage(chatId, { 
                text: `*｢ ⚠️ ｣ تـنـبـيـه: الـنـظـام لـم يـرصـد طـاقـتـك بـعـد.. قـم بـالاسـتـيـقـاظ أولاً (.اسـتـيـقـاظ)*` 
            }, { quoted: m });
        }

        const user = soloDB[userJid];

        // ✅ حساب القوة الكلية
        let basePower = (user.level * 2) + getRankPower(user.rank);
        let weaponBonus = 0;
        let armorBonus = 0;
        let weaponName = "لا يوجد";
        let armorName = "لا يوجد";

        // البحث عن السلاح المجهز
        if (user.equipped?.weapon) {
            const weapon = products.find(p => p.id === user.equipped.weapon);
            if (weapon) {
                weaponBonus = weapon.power || weapon.magic || weapon.dark || 0;
                weaponName = weapon.name;
            }
        }

        // البحث عن الدرع المجهز
        if (user.equipped?.armor) {
            const armor = products.find(p => p.id === user.equipped.armor);
            if (armor) {
                armorBonus = armor.defense || 0;
                armorName = armor.name;
            }
        }

        const totalPower = basePower + weaponBonus;

        // ✅ معلومات النقابة
        const guildInfo = user.guild?.currentQuest 
            ? `*⚔️ مـهـمـة الـنـقـابـة:* ⦓ ${user.guild.currentQuest} ⦔\n*📊 الـتـقـدم:* ⦓ ${user.guild.questProgress || 0}/${getQuestTarget(user)} ⦔`
            : "*⚔️ لا تـوجـد مـهـمـة حـالـيـة*";

        // 1. التفاعل برمز نافذة النظام
        await sock.sendMessage(chatId, { react: { text: "💻", key: m.key } });

        // 2. منطق تحديد حالة الاستعداد بناءً على الرتبة
        const readiness = user.rank === "E" 
            ? "غـيـر مـسـتـعـد (ضـعـيـف جـداً) ⚠️" 
            : "مـسـتـعـد لـلـتـطـهـيـر 🔥";

        // 3. تصميم الاستمارة الأسطورية (تقسيم 4 أجزاء)
        const statusText = `*───━━⊱  𝐒 𝐓 𝐀 𝐓 𝐔 𝐒  ⊰━━───*

*⌬ نـافـذة الـحـالـة الـشـخـصـيـة ⌬*

*───━━━⊱  💠 💠  ⊰━━━───*


*❑ [ الـمـعـلـومـات الأسـاسـيـة ] 👤*

*👤 الـصـيـاد :* ⦓ *@${userJid.split('@')[0]}* ⦔

*🛡️ الـفـئـة :* ⦓ *${user.class}* ⦔

*🏅 الـرتـبـة :* ⦓ *[${user.rank}]* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*❑ [ قـدرات الـتـسـويـة ] 📊*

*📈 الـمـسـتـوى :* ⦓ *${user.level}* ⦔

*✨ الـخـبـرة (XP) :* ⦓ *${user.xp}* ⦔

*💰 الـذهـب :* ⦓ *${user.gold}* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*❑ [ الـقـوة الـقـتـالـيـة ] ⚔️*

*⚡ الـقـوة الأسـاسـيـة :* ⦓ *${basePower}* ⦔

*🗡️ الـسـلاح الـمـجـهـز :* ⦓ *${weaponName}* ⦔
*   └─ قـوة إضـافـيـة :* ⦓ *+${weaponBonus}* ⦔

*🛡️ الـدرع الـمـجـهـز :* ⦓ *${armorName}* ⦔
*   └─ دفـاع إضـافـي :* ⦓ *+${armorBonus}* ⦔

*💥 الـقـوة الـكـلـيـة :* ⦓ *${totalPower}* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*❑ [ مـعـلـومـات الـنـقـابـة ] 🏛️*

${guildInfo}


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*❑ [ سـجـل الـنـظـام ] 📜*

*📅 تـاريـخ الاسـتـيـقـاظ :* ⦓ *${user.awakenedAt}* ⦔

*🔥 الـحـالـة :* ⦓ *${readiness}* ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`.trim();

        const statusImg = './media/status.jpg';

        try {
            if (fs.existsSync(statusImg)) {
                await sock.sendMessage(chatId, { 
                    image: fs.readFileSync(statusImg), 
                    caption: statusText, 
                    mentions: [userJid] 
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { text: statusText, mentions: [userJid] }, { quoted: m });
            }
        } catch (e) {
            console.error("Error in Status Command:", e);
        }
    }
};

// ==================== دالة مساعدة لجلب هدف المهمة ====================
function getQuestTarget(user) {
    if (!user.guild?.currentQuest) return 0;
    
    const questsByRank = {
        "E": { "E1": 50, "E2": 10, "E3": 15 },
        "C": { "C1": 150, "C2": 1, "C3": 15, "C4": 25 },
        "B": { "B1": 300, "B2": 3, "B3": 20, "B4": 30, "B5": 1 },
        "A": { "A1": 500, "A2": 5, "A3": 1, "A4": 25, "A5": 40 },
        "S": { "S1": 800, "S2": 8, "S3": 3, "S4": 30, "S5": 50 },
        "SS": { "SS1": 1200, "SS2": 12, "SS3": 5, "SS4": 40, "SS5": 60 }
    };
    
    const rank = user.rank || "E";
    return questsByRank[rank]?.[user.guild.currentQuest] || 0;
}