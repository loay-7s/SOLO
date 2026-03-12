import fs from 'fs-extra';

export default {
    name: "صيد",
    aliases: ["hunt", "مطاردة", "اصطياد"],
    description: "انطلق في رحلة صيد للحصول على غنائم ثمينة",
    category: "solo",

    async run({ sock, m, userJid }) {
        const chatId = m.key.remoteJid;
        const dbPath = './data/SOLO_LEVELING.json';
        
        // قراءة بيانات الصياد
        let soloDB = fs.readJsonSync(dbPath, { throws: false }) || {};
        const hunter = soloDB[userJid];
        
        if (!hunter) {
            return sock.sendMessage(chatId, { 
                text: `*⚠️ لـم تـسـتـيـقـظ بـعـد!*\n*🔹 .استيقظ لـبـدء الـمـغـامـرة*` 
            }, { quoted: m });
        }

        // نظام الكول داون (3 ساعات)
        const cooldown = 3 * 60 * 60 * 1000; // 3 ساعات
        const lastHunt = hunter.lastHunt || 0;
        const now = Date.now();
        
        if (now - lastHunt < cooldown) {
            const remaining = cooldown - (now - lastHunt);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            
            return sock.sendMessage(chatId, { 
                text: `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ نـظـام الـتـبـريـد ⌬*

*───━━━⊱  ⏳  ⊰━━━───*


*⚡ طـاقـتـك مـازالـت تـتـجـمـع..*

*⏰ الـوقـت الـمـتـبـقـي:* ⦓ *${hours} سـاعـة ${minutes} دقـيـقـة* ⦔


*🌑 عـد لاحـقاً لـمـواصـلـة الـصـيـد*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim() 
            }, { quoted: m });
        }

        // تفاعل
        await sock.sendMessage(chatId, { react: { text: "🏹", key: m.key } });

        // ==================== نظام الصيد الأسطوري ====================
        
        // تحديد نوع الفريسة حسب قوة الصياد
        const hunterPower = (hunter.level * 2) + (hunter.rank === "E" ? 10 : hunter.rank === "D" ? 25 : hunter.rank === "C" ? 50 : hunter.rank === "B" ? 100 : hunter.rank === "A" ? 200 : hunter.rank === "S" ? 400 : hunter.rank === "SS" ? 800 : 1500);
        
        // أنواع الفرائس
        const preys = [
            { 
                name: "🐇 أرنب الظلال", 
                rank: "E",
                power: 10,
                desc: "مخلوق سريع يختبئ بين الأشجار",
                xp: Math.floor(Math.random() * 50) + 30, // 30-80 XP
                gold: Math.floor(Math.random() * 40) + 20, // 20-60 ذهب
                chance: 0.4 // 40% فرصة للظهور
            },
            { 
                name: "🦊 ثعلب النار", 
                rank: "D",
                power: 30,
                desc: "فرائه ملتهب، يركض كالشرر",
                xp: Math.floor(Math.random() * 80) + 50, // 50-130 XP
                gold: Math.floor(Math.random() * 60) + 30, // 30-90 ذهب
                chance: 0.3
            },
            { 
                name: "🐗 خنزير الجحيم", 
                rank: "C",
                power: 60,
                desc: "وحش ضخم بأنياب ملتهبة",
                xp: Math.floor(Math.random() * 120) + 80, // 80-200 XP
                gold: Math.floor(Math.random() * 80) + 50, // 50-130 ذهب
                chance: 0.2
            },
            { 
                name: "🐺 ذئب القمر", 
                rank: "B",
                power: 120,
                desc: "يعوي تحت ضوء القمر، زعيم القطيع",
                xp: Math.floor(Math.random() * 200) + 150, // 150-350 XP
                gold: Math.floor(Math.random() * 150) + 100, // 100-250 ذهب
                chance: 0.15
            },
            { 
                name: "🐻 دب العاصفة", 
                rank: "A",
                power: 250,
                desc: "جلده ي crackle بالبرق، خطوته تزلزل الأرض",
                xp: Math.floor(Math.random() * 300) + 250, // 250-550 XP
                gold: Math.floor(Math.random() * 200) + 150, // 150-350 ذهب
                chance: 0.1
            },
            { 
                name: "🐉 تنين صغير", 
                rank: "S",
                power: 500,
                desc: "تنين حديث الفقس، لكنه لا يزال خطراً",
                xp: Math.floor(Math.random() * 500) + 400, // 400-900 XP
                gold: Math.floor(Math.random() * 300) + 200, // 200-500 ذهب
                chance: 0.05
            },
            { 
                name: "👑 ملك الغابة", 
                rank: "SS",
                power: 900,
                desc: "حارس الغابة الأسطوري، لم يهزمه أحد",
                xp: Math.floor(Math.random() * 800) + 600, // 600-1400 XP
                gold: Math.floor(Math.random() * 500) + 300, // 300-800 ذهب
                chance: 0.02
            },
            { 
                name: "🌑 كيان الظل", 
                rank: "SSS",
                power: 1500,
                desc: "كائن من عالم آخر، الصيادون يهابونه",
                xp: Math.floor(Math.random() * 1200) + 800, // 800-2000 XP
                gold: Math.floor(Math.random() * 800) + 500, // 500-1300 ذهب
                chance: 0.01
            }
        ];

        // اختيار الفريسة بناءً على القوة والفرص
        let selectedPrey = null;
        let roll = Math.random();
        let cumulativeChance = 0;
        
        // ترتيب الفرائس حسب القوة (من الأضعف للأقوى)
        const sortedPreys = [...preys].sort((a, b) => a.power - b.power);
        
        for (const prey of sortedPreys) {
            cumulativeChance += prey.chance;
            if (roll < cumulativeChance) {
                selectedPrey = prey;
                break;
            }
        }
        
        // لو ما اتنخبتش حاجة (نادر)، اختار أرنب
        if (!selectedPrey) selectedPrey = preys[0];

        // حساب فرصة النجاح حسب قوة الصياد
        const successRate = Math.min(0.95, (hunterPower / selectedPrey.power) * 0.8);
        const isSuccess = Math.random() < successRate;

        // انتظار درامي (محاكاة التوتر)
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (isSuccess) {
            // صيد ناجح!
            const xpGained = Math.floor(selectedPrey.xp * (0.8 + Math.random() * 0.4)); // 80% - 120% من القيمة
            const goldGained = Math.floor(selectedPrey.gold * (0.8 + Math.random() * 0.4));
            
            hunter.xp = (hunter.xp || 0) + xpGained;
            hunter.gold = (hunter.gold || 0) + goldGained;
            
            // حساب رفع المستوى
            let levelUpMsg = "";
            const xpNeeded = hunter.level * 100;
            if (hunter.xp >= xpNeeded) {
                const oldLevel = hunter.level;
                hunter.level += Math.floor(hunter.xp / xpNeeded);
                hunter.xp = hunter.xp % xpNeeded;
                levelUpMsg = `\n\n*📈 ارتـفـع مـسـتـواك!* ⦓ *${oldLevel}* ➜ *${hunter.level}* ⦔`;
            }
            
            // تحديث وقت آخر صيد
            hunter.lastHunt = now;
            
            // حفظ البيانات
            soloDB[userJid] = hunter;
            fs.writeJsonSync(dbPath, soloDB, { spaces: 2 });

            const successMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ صـيـد نـاجـح! ⌬*

*───━━━⊱  🏹  ⊰━━━───*


*👤 الـصـيـاد:* ⦓ *@${userJid.split('@')[0]}* ⦔


*❑ [ الـفـريـسـة ] 🦌*

*👾 الاسـم:* *${selectedPrey.name}*

*🏅 الـرتـبـة:* ⦓ *[${selectedPrey.rank}]* ⦔

*📝 الـوصـف:* ${selectedPrey.desc}


*❑ [ الـغـنـائـم ] 💰*

*✨ XP:* ⦓ *+${xpGained}* ⦔

*🪙 ذهـب:* ⦓ *+${goldGained}* ⦔
${levelUpMsg}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📊 الـرصـيـد الـحـالـي:*

*✨ XP:* ⦓ *${hunter.xp}* ⦔

*🪙 ذهـب:* ⦓ *${hunter.gold}* ⦔

*📈 الـمـسـتـوى:* ⦓ *${hunter.level}* ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

            await sock.sendMessage(chatId, { 
                text: successMsg, 
                mentions: [userJid] 
            }, { quoted: m });

        } else {
            // صيد فاشل (الفرايسة هربت)
            const failMessages = [
                "أخطأت السهم وهربت الفريسة",
                "سمعت الفريسة وقع خطواتك",
                "كانت سريعة جداً ولم تستطع اللحاق بها",
                "اختفت في الظلال قبل أن ترمي",
                "انقضضت ولكن أخطأتها"
            ];
            
            const failMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ صـيـد فـاشـل ⌬*

*───━━━⊱  💔  ⊰━━━───*


*👤 الـصـيـاد:* ⦓ *@${userJid.split('@')[0]}* ⦔


*❑ [ الـفـريـسـة ] 🦌*

*👾 الاسـم:* *${selectedPrey.name}*

*🏅 الـرتـبـة:* ⦓ *[${selectedPrey.rank}]* ⦔


*❑ [ الـنـتـيـجـة ] 😔*

*💔 ${failMessages[Math.floor(Math.random() * failMessages.length)]}*

*🌑 عـد وحـاول مـرة أخـرى بـعـد 3 سـاعـات*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

            // حتى في الفشل، بيتم تحديث وقت آخر صيد
            hunter.lastHunt = now;
            soloDB[userJid] = hunter;
            fs.writeJsonSync(dbPath, soloDB, { spaces: 2 });

            await sock.sendMessage(chatId, { 
                text: failMsg, 
                mentions: [userJid] 
            }, { quoted: m });
        }
    }
};