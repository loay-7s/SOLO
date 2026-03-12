import fs from 'fs-extra';
const soloPath = './data/SOLO_LEVELING.json';

// ==================== قائمة المنتجات (للبحث عن الأسلحة) ====================
const products = [
    // ⚔️ أسلحة المقاتل
    { id: 1, name: "🗡️ سيف الظلام", price: 200, type: "weapon", class: "مـقـاتـل", power: 5 },
    { id: 2, name: "⚔️ سيف كاسر العظام", price: 500, type: "weapon", class: "مـقـاتـل", power: 12 },
    { id: 3, name: "🗡️◾ نصل الإمبراطور الأسود", price: 1200, type: "weapon", class: "مـقـاتـل", power: 25, crit: 5 },

    // 🔥 أسلحة الساحر
    { id: 4, name: "🔮 عصا المانا", price: 200, type: "weapon", class: "سـاحـر", magic: 5 },
    { id: 5, name: "✨ صولجان النجوم", price: 500, type: "weapon", class: "سـاحـر", magic: 12 },
    { id: 6, name: "🔥◾ جوهرة التنين الأحمر", price: 1200, type: "weapon", class: "سـاحـر", magic: 25, burn: 5 },

    // 🥷 أسلحة المغتال
    { id: 7, name: "🗡️ سكاكين الظل", price: 200, type: "weapon", class: "مـغـتـال", power: 5, dodge: 2 },
    { id: 8, name: "🥷 خناجر الشبح", price: 500, type: "weapon", class: "مـغـتـال", power: 12, dodge: 5 },
    { id: 9, name: "🌑◾ نصل العدم", price: 1200, type: "weapon", class: "مـغـتـال", power: 25, dodge: 10 },

    // 🏹 أسلحة الرامي
    { id: 10, name: "🏹 قوس الصياد", price: 200, type: "weapon", class: "رامـي سـهـام", power: 5 },
    { id: 11, name: "🎯 قوس الرياح", price: 500, type: "weapon", class: "رامـي سـهـام", power: 12, accuracy: 3 },
    { id: 12, name: "🌪️◾ قوس العاصفة", price: 1200, type: "weapon", class: "رامـي سـهـام", power: 25, accuracy: 7 },

    // 🧬 أسلحة المعالج
    { id: 13, name: "🧬 طاقم الشفاء", price: 200, type: "weapon", class: "مـعـالـج", heal: 5 },
    { id: 14, name: "✨ صولجان الحياة", price: 500, type: "weapon", class: "مـعـالـج", heal: 12 },
    { id: 15, name: "💫◾ طاقم الخلود", price: 1200, type: "weapon", class: "مـعـالـج", heal: 25, regen: 5 },

    // 💀 أسلحة مستحضر الأرواح
    { id: 16, name: "💀 كتاب الموتى", price: 300, type: "weapon", class: "مـسـتـحـضـر الأرواح", dark: 8 },
    { id: 17, name: "🦴 صولجان العظام", price: 800, type: "weapon", class: "مـسـتـحـضـر الأرواح", dark: 18 },
    { id: 18, name: "👑◾ تاج الظلال", price: 2000, type: "weapon", class: "مـسـتـحـضـر الأرواح", dark: 35, summon: true },

    // 🛡️ دروع عامة
    { id: 19, name: "🧥 معطف المسافر", price: 100, type: "armor", defense: 2 },
    { id: 20, name: "🥼 درع الجلد", price: 300, type: "armor", defense: 5 },
    { id: 21, name: "⚜️ درع الفارس", price: 800, type: "armor", defense: 12 },
    { id: 22, name: "👑◾ درع الملك الظلام", price: 2000, type: "armor", defense: 25, resist: 10 }
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

// ==================== دالة حساب القوة الكلية للصياد ====================
function calculateTotalPower(hunter) {
    let basePower = (hunter.level * 2) + getRankPower(hunter.rank);
    let weaponBonus = 0;

    if (hunter.equipped?.weapon) {
        const weapon = products.find(p => p.id === hunter.equipped.weapon);
        if (weapon) {
            weaponBonus = weapon.power || weapon.magic || weapon.dark || 0;
        }
    }

    return basePower + weaponBonus;
}

export default {
    name: "معرفة",
    aliases: ["check", "know", "اعرف", "تحقق"],
    category: "solo",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        
        // قراءة قاعدة البيانات
        let soloDB = fs.readJsonSync(soloPath, { throws: false }) || {};
        
        // التحقق من وجود الصياد
        if (!soloDB[userJid]) {
            return sock.sendMessage(chatId, { 
                text: `*⚠️ لـم تـسـتـيـقـظ بـعـد!*\n*🔹 .استيقاظ لـبـدء الـمـغـامـرة*` 
            }, { quoted: m });
        }

        const hunter = soloDB[userJid];
        
        // التأكد من وجود مخزون
        if (!hunter.inventory) hunter.inventory = [];

        // البحث عن لفافة المعرفة (رقم 36)
        const knowledgeScroll = hunter.inventory.find(item => item.id === 36);
        
        if (!knowledgeScroll) {
            return sock.sendMessage(chatId, { 
                text: `*❌ لـيـس لـديـك لـفـافـة الـمـعـرفـة!*\n\n*🔹 اشـتـرها مـن:* .مخزن_الصيادين شراء 36` 
            }, { quoted: m });
        }

        // تحديد الهدف (إذا تم منشنة صياد)
        const contextInfo = m.message?.extendedTextMessage?.contextInfo;
        let targetJid = contextInfo?.participant || contextInfo?.mentionedJid?.[0];
        
        // إذا ما في منشن، اختار صياد عشوائي
        if (!targetJid || targetJid === userJid) {
            const otherHunters = Object.keys(soloDB).filter(jid => 
                jid !== userJid && 
                soloDB[jid].level
            );
            
            if (otherHunters.length === 0) {
                return sock.sendMessage(chatId, { 
                    text: `*❌ لا يـوجـد صـيـادين آخـرين لـتـحـقـيـقـهم!*` 
                }, { quoted: m });
            }
            
            targetJid = otherHunters[Math.floor(Math.random() * otherHunters.length)];
        }

        const target = soloDB[targetJid];
        if (!target) {
            return sock.sendMessage(chatId, { 
                text: `*❌ الـصـيـاد الـمـذكـور غـيـر مـوجـود!*` 
            }, { quoted: m });
        }

        // إزالة اللفافة من المخزون
        hunter.inventory = hunter.inventory.filter(item => item.id !== 36);
        
        // حساب القوى
        const hunterPower = calculateTotalPower(hunter);
        const targetPower = calculateTotalPower(target);

        // تحديد مستوى الخطر
        let dangerLevel = "";
        let dangerEmoji = "";
        let powerDiff = targetPower - hunterPower;
        
        if (powerDiff > 100) {
            dangerLevel = "خـطـر مـمـيـت";
            dangerEmoji = "💀";
        } else if (powerDiff > 50) {
            dangerLevel = "خـطـر عـالـي";
            dangerEmoji = "⚡";
        } else if (powerDiff > 0) {
            dangerLevel = "خـطـر مـتـوسـط";
            dangerEmoji = "⚠️";
        } else if (powerDiff > -50) {
            dangerLevel = "فـرصـة واردة";
            dangerEmoji = "⚔️";
        } else {
            dangerLevel = "فـريـسـة سـهـلـة";
            dangerEmoji = "🎯";
        }

        // حفظ التغييرات
        soloDB[userJid] = hunter;
        fs.writeJsonSync(soloPath, soloDB, { spaces: 2 });

        // تفاعل
        await sock.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

        const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ مـعـلـومـات الـخـصـم ⌬*

*───━━━⊱  🔍  ⊰━━━───*


*📜 تـم اسـتـخـدام:* *لفافة المعرفة*


*❑ [ مـعـلـومـات الـصـيـاد ] 👤*

*👤 الاسـم:* ⦓ @${targetJid.split('@')[0]} ⦔

*🛡️ الـفـئـة:* *${target.class}*

*🏅 الـرتـبـة:* ⦓ *[${target.rank}]* ⦔

*📊 الـمـسـتـوى:* *${target.level}*

*💰 الـذهـب:* *${target.gold || 0}*

*✨ الـخـبـرة:* *${target.xp || 0}*


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*❑ [ الـقـوى ] ⚔️*

*⚡ قـوة الـخـصـم:* *${targetPower}*

*💪 قـوتـك الـحـالـيـة:* *${hunterPower}*


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*❑ [ مـسـتـوى الـخـطـر ] ⚠️*

*${dangerEmoji} الـتـقـيـيـم:* *${dangerLevel}*


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*🔹 رتـبـتـك:* ⦓ *[${hunter.rank}]* ⦔

*🔹 لـلـهـجـوم:* *.هجوم @${targetJid.split('@')[0]}*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

        await sock.sendMessage(chatId, { 
            text: msg, 
            mentions: [userJid, targetJid] 
        }, { quoted: m });
    }
};