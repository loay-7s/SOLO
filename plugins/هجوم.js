import fs from 'fs-extra';
const dataPath = './data/SOLO_LEVELING.json';

// ==================== قائمة المنتجات (نفس اللي في المخزن) ====================
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
    let critChance = 0;
    let dodgeChance = 0;

    if (hunter.equipped?.weapon) {
        const weapon = products.find(p => p.id === hunter.equipped.weapon);
        if (weapon) {
            weaponBonus = weapon.power || weapon.magic || weapon.dark || 0;
            critChance = weapon.crit || 0;
            dodgeChance = weapon.dodge || 0;
        }
    }

    return {
        total: basePower + weaponBonus,
        base: basePower,
        weapon: weaponBonus,
        crit: critChance,
        dodge: dodgeChance
    };
}

export default {
    name: "هجوم",
    aliases: ["اغارة", "قتال"],
    description: "شن هجوم على صياد آخر وسلب نقاط خبرته",
    category: "solo",

    async run({ sock, m }) {
        try {
            const chatId = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;
            
            // قراءة الملف
            let soloData = {};
            try {
                soloData = await fs.readJson(dataPath);
            } catch {
                return sock.sendMessage(chatId, { text: "*⚠️ لا تـوجـد بـيـانـات لـلـصـيـاديـن بـعـد!*" });
            }

            // البحث عن المهاجم
            const cleanSender = sender.split('@')[0].split(':')[0];
            let attackerJid = null;
            let attacker = null;

            if (soloData[sender]) {
                attackerJid = sender;
                attacker = soloData[sender];
            } else {
                for (const [jid, data] of Object.entries(soloData)) {
                    if (jid.includes(cleanSender)) {
                        attackerJid = jid;
                        attacker = data;
                        break;
                    }
                }
            }

            if (!attacker) {
                return sock.sendMessage(chatId, { text: "*⚠️ اكـتـب .استيقظ أولاً لـتـسـتـيـقـظ!*" });
            }

            // تحديد الهدف
            const contextInfo = m.message?.extendedTextMessage?.contextInfo;
            const target = contextInfo?.participant || contextInfo?.mentionedJid?.[0];

            if (!target || target === sender) {
                return sock.sendMessage(chatId, { text: "*⚠️ مـنـشـن الـضـحـيـة الـتـي تـريـد سـحـقـهـا!*" }, { quoted: m });
            }

            // البحث عن الضحية
            const cleanTarget = target.split('@')[0].split(':')[0];
            let victimJid = null;
            let victim = { xp: 0, level: 1, rank: "E", class: "*مـواطـن عـادي*" };

            if (soloData[target]) {
                victimJid = target;
                victim = soloData[target];
            } else {
                for (const [jid, data] of Object.entries(soloData)) {
                    if (jid.includes(cleanTarget)) {
                        victimJid = jid;
                        victim = data;
                        break;
                    }
                }
            }

            // نظام المؤقت الأسطوري (6 ساعات)
            const now = Date.now();
            const cooldown = 6 * 60 * 60 * 1000;
            if (now - (attacker.lastAttack || 0) < cooldown) {
                const remaining = cooldown - (now - attacker.lastAttack);
                const hours = Math.floor(remaining / 3600000);
                const minutes = Math.floor((remaining % 3600000) / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                
                const cooldownMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
      *⌬ نـظـام الـتـبـريـد الـقـتـالـي ⌬*
*───━━━⊱  ⏳  ⊰━━━───*

*⚡ قـوتـك مـازالـت تـتـجـمـع..*

*⏰ الـوقـت الـمـتـبـقـي:*
*┌─────────────────┐*
*│ ⦓ ${hours} سـاعـة ${minutes} دقـيـقـة ${seconds} ثـانـيـة ⦔*
*└─────────────────┘*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();
                
                return sock.sendMessage(chatId, { text: cooldownMsg }, { quoted: m });
            }

            await sock.sendMessage(chatId, { react: { text: "⚔️", key: m.key } });

            // حساب قوة المهاجم والضحية
            const attackerPower = calculateTotalPower(attacker);
            const victimPower = calculateTotalPower(victim);

            // مهارات الفئات الأسطورية
            const classSkills = {
                "مـقـاتـل ⚔️ ☞": [
                    { name: "*قـطـع الـرأس 🗡️*", power: "*قـوة مـدمـرة*", desc: "*ضربة قاضية تخترق الدروع*" },
                    { name: "*الـزلـزال 🌋*", power: "*هـائـل*", desc: "*يهز الأرض ويسقط الأعداء*" },
                    { name: "*الـعـاصـفـة 🌪️*", power: "*جـبـارة*", desc: "*سلسلة ضربات سريعة كالريح*" }
                ],
                "مـغـتـال 🥷🏻 ☞": [
                    { name: "*طـعـنـة الـظـل 🌑*", power: "*قـاتـلـة*", desc: "*يهاجم من العدم بصمت*" },
                    { name: "*سـم قـاتـل ☠️*", power: "*مـمـيـت*", desc: "*يسبب نزيف داخلي للخصم*" },
                    { name: "*الـتـخـفـي 👤*", power: "*مـخـادع*", desc: "*يختفي ثم يضرب من الخلف*" }
                ],
                "مـعـالـج 🧬 ☞": [
                    { name: "*انـفـجـار الـمـانـا ✨*", power: "*روحـانـي*", desc: "*يطلق طاقة شافية مدمرة*" },
                    { name: "*الـصـدمـة الـعـكـسـيـة ⚡*", power: "*مـربـك*", desc: "*يعكس الضرر على المهاجم*" },
                    { name: "*درع الـنـور 🛡️*", power: "*حـامـي*", desc: "*يشكل درعاً ضوئياً واقياً*" }
                ],
                "سـاحـر 🔥 ☞": [
                    { name: "*جـحـيـم الأرواح 🔥*", power: "*مـحـرق*", desc: "*كرة نارية تحرق كل شيء*" },
                    { name: "*الـتـفـجـيـر الـمـظـلـم 💥*", power: "*مـدمر*", desc: "*انفجار هائل من الطاقة الظلامية*" },
                    { name: "*عـاصـفـة الـبـرد ❄️*", power: "*مـجـمـدة*", desc: "*تجمد الخصم في مكانه*" }
                ],
                "رامـي سـهـام 🏹 ☞": [
                    { name: "*سـهـم الـتـخـرق 🎯*", power: "*دقـيـق*", desc: "*يخترق دفاعات الخصم*" },
                    { name: "*مـطـر الـسـهـام ☄️*", power: "*غـزيـر*", desc: "*وابل من الأسهم لا يُرد*" },
                    { name: "*عـيـن الـصـقـر 👁️*", power: "*حـاد*", desc: "*يسدد ضربة قاتلة في نقطة الضعف*" }
                ],
                "مـسـتـحـضـر الأرواح 💀": [
                    { name: "*سـلـطـة الـمـنـاهـض 👑*", power: "*أسـطـوري*", desc: "*يستدعي روح البطل المناهض للمساعدة*" },
                    { name: "*قـبـضـة الـظـلال 🌑*", power: "*مـخـيـف*", desc: "*أيدي من الظلام تمسك بالخصم*" },
                    { name: "*جـيـش الـمـوتـى 💀*", power: "*رهـيـب*", desc: "*يستدعي جيشاً من الهياكل العظمية*" }
                ]
            };

            const attackerClass = attacker.class || "مـقـاتـل ⚔️ ☞";
            const currentSkills = classSkills[attackerClass] || [
                { name: "*هـجـوم يـدوي 👊*", power: "*عـادي*", desc: "*لكمة بسيطة بدون تأثيرات*" }
            ];
            
            const selectedSkill = currentSkills[Math.floor(Math.random() * currentSkills.length)];

            // نظام المراوغة (مع إضافة فرصة المراوغة من السلاح)
            const dodgeChance = attackerPower.dodge;
            const isDodge = Math.random() < (0.05 + dodgeChance / 100);
            
            if (isDodge) {
                attacker.lastAttack = now;
                soloData[attackerJid] = attacker;
                await fs.writeJson(dataPath, soloData, { spaces: 2 });
                
                const dodgeMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
     *⌬ مـراوغـة قـتـالـيـة ⌬*
*───━━━⊱  🌪️  ⊰━━━───*

*⚡ @${cleanTarget} تـمـكـن مـن الـمـراوغـة!*

*💠 بـمـهـارة [ الـتـحـرك الـسـريـع ] افـلـت الـخـصـم مـن الـهـجـوم*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();
                
                return sock.sendMessage(chatId, { 
                    text: dodgeMsg, 
                    mentions: [target]
                }, { quoted: m });
            }

            // نظام الضربة القاضية
            const critChance = attackerPower.crit;
            const isCritical = Math.random() < (0.1 + critChance / 100);

            // حساب نتيجة المعركة بناءً على القوة
            let resultText = "";
            let stolenXp = 0;
            let lostXp = 0;

            // ✅ تحديث مهمة النقابة (استخدام هجوم)
            if (attacker.guild?.currentQuest) {
                const attackUseQuests = ["B5"];
                if (attackUseQuests.includes(attacker.guild.currentQuest)) {
                    attacker.guild.questProgress = (attacker.guild.questProgress || 0) + 1;
                    console.log("✅ تم تحديث مهمة استخدام هجوم:", attacker.guild.questProgress);
                }
            }

            // مقارنة القوة الكلية
            if (attackerPower.total >= victimPower.total || isCritical) {
                let multiplier = 0.20; // افتراضي 20%
                if (attackerPower.total > victimPower.total * 1.5) multiplier = 0.30; // فوز ساحق 30%
                else if (isCritical) multiplier = 0.25; // ضربة قاضية 25%
                
                stolenXp = Math.floor((victim.xp || 0) * multiplier);
                attacker.xp = (attacker.xp || 0) + stolenXp;
                victim.xp = Math.max(0, (victim.xp || 0) - stolenXp);
                
                // 🔥 حفظ آخر خسارة للضحية (عشان حبة الشفاء)
                victim.lastLostXP = stolenXp;
                
                if (attackerPower.total > victimPower.total * 1.2) {
                    victim.level = Math.max(1, (victim.level || 1) - 2);
                } else {
                    victim.level = Math.max(1, (victim.level || 1) - 1);
                }
                
                // ✅ تحديث مهمة النقابة (الفوز في هجوم)
                if (attacker.guild?.currentQuest) {
                    const attackWinQuests = ["A3", "S3", "SS3"];
                    if (attackWinQuests.includes(attacker.guild.currentQuest)) {
                        attacker.guild.questProgress = (attacker.guild.questProgress || 0) + 1;
                        console.log("✅ تم تحديث مهمة الفوز في هجوم:", attacker.guild.questProgress);
                    }
                }
                
                resultText = `
*🏆 الـنـتـيـجـة: ⦓ انـتـصـار سـاحـق ⦔*
*⚡ قـوة الـمـهـاجـم: ⦓ ${attackerPower.total} ⦔*
*⚡ قـوة الـخـصـم: ⦓ ${victimPower.total} ⦔*
*💰 الـمـكـسـب: ⦓ +${stolenXp} XP ⦔ (${Math.round(multiplier*100)}% مـن XP الـخـصـم)*
*📉 الـخـصـم: ⦓ تـراجـع إلـى الـمـسـتـوى ${victim.level} ⦔
*💔 خـسـارة الـخـصـم: ⦓ -${stolenXp} XP ⦔ (يمكن استعادتها بحبة الشفاء)*`;
                
            } else {
                lostXp = Math.floor((attacker.xp || 0) * 0.15);
                attacker.xp = Math.max(0, (attacker.xp || 0) - lostXp);
                
                // 🔥 حفظ آخر خسارة للمهاجم (عشان حبة الشفاء)
                attacker.lastLostXP = lostXp;
                
                attacker.level = Math.max(1, (attacker.level || 1) - 1);
                
                resultText = `
*💔 الـنـتـيـجـة: ⦓ هـزيـمـة مـذلـة ⦔*
*⚡ قـوة الـمـهـاجـم: ⦓ ${attackerPower.total} ⦔*
*⚡ قـوة الـخـصـم: ⦓ ${victimPower.total} ⦔*
*💸 الـخـسـارة: ⦓ -${lostXp} XP ⦔ 15% مـما تـمـلـك*
*📉 الـعـقـاب:* ⦓ تـراجـع إلـى الـمـسـتـوى ${attacker.level} ⦔
*💊 اسـتـعـد مـا خـسـرتـه بـ: .استخدام شفاء*`;
            }

            // تحديث بيانات المهاجم
            attacker.lastAttack = now;
            
            // حفظ البيانات
            soloData[attackerJid] = attacker;
            if (victimJid) soloData[victimJid] = victim;
            await fs.writeJson(dataPath, soloData, { spaces: 2 });

            // تنسيق الوقت الحالي
            const attackTime = new Date(now).toLocaleString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // الاستمارة الأسطورية النهائية
            const battleMsg = `
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
      *⌬ مـلـحـمـة قـتـالـيـة ⌬*
*───━━━⊱  ⚔️ 🛡️  ⊰━━━───*

*👤 الـمـهـاجـم:* ⦓ @${cleanSender} ⦔

*🏅 الـرتـبـة:* ⦓ [${attacker.rank}] ⦔ *📊 الـمـسـتـوى:* ⦓ ${attacker.level} ⦔
*⚡ الـقـوة:* ⦓ ${attackerPower.total} ⦔ *(أساسي ${attackerPower.base} + سلاح ${attackerPower.weapon})*

*🛡️ الـفـئـة:* ⦓ ${attacker.class} ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*👤 الـخـصـم:* ⦓ @${cleanTarget} ⦔

*🏅 الـرتـبـة:* ⦓ [${victim.rank}] ⦔ *📊 الـمـسـتـوى:* ⦓ ${victim.level || 1} ⦔
*⚡ الـقـوة:* ⦓ ${victimPower.total} ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*✨ الـمـهـارة الـمـسـتـخـدمـة:*
*${selectedSkill.name}* *(${selectedSkill.power})*
*${selectedSkill.desc}*

*⚡ تـفـاصـيـل الـمـعـركـة:*
*${resultText}*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*⏰ تـاريـخ الـمـعـركـة:* ⦓ ${attackTime} ⦔
*⌠⏳⌡ مـهـلـة الـهـجـوم الـقـادم:* ⦓ 6 سـاعـات ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*
*💠 " فـي عـالـم الـصـيـاديـن، الـقـوي يـأكـل الـضـعـيـف "*
*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~`.trim();

            await sock.sendMessage(chatId, { 
                text: battleMsg, 
                mentions: [sender, target] 
            }, { quoted: m });

        } catch (e) {
            console.error("❌ خطأ في نظام الهجوم:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "*❌ فـشـل الـنـظـام فـي تـنـفـيذ الـهـجـوم!*" });
        }
    }
};