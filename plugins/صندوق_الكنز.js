import fs from 'fs-extra';

export default {
    name: "صندوق_الكنز",
    aliases: ["كنز", "treasure", "box"],
    description: "افتح صندوق الكنز واحصل على جوائز حسب حظك",
    category: "solo",

    async run({ sock, m, userJid, args }) {
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

        // نظام الكول داون (10 دقائق)
        const cooldown = 10 * 60 * 1000; // 10 دقائق
        const lastBox = hunter.lastBox || 0;
        const now = Date.now();
        
        if (now - lastBox < cooldown) {
            const remaining = cooldown - (now - lastBox);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            return sock.sendMessage(chatId, { 
                text: `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ نـظـام الـتـبـريـد ⌬*

*───━━━⊱  ⏳  ⊰━━━───*


*⚡ الـصـنـدوق مـازال يـتـجـمـع..*

*⏰ تـبـقـى:* ⦓ *${minutes} د و ${seconds} ث* ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim() 
            }, { quoted: m });
        }

        // تحديد نوع الدفع
        const paymentType = args[0]?.toLowerCase();
        
        let price = 50;
        let luckMultiplier = 1;
        
        if (paymentType === "ضعف" || paymentType === "2x" || paymentType === "100") {
            price = 100;
            luckMultiplier = 2; // فرص مضاعفة
        }

        // التحقق من الرصيد
        if ((hunter.gold || 0) < price) {
            return sock.sendMessage(chatId, { 
                text: `*❌ رصيدك غير كاف!*\n*💰 تحتاج:* ⦓ *${price}* 🪙 ⦔` 
            }, { quoted: m });
        }

        // تفاعل
        await sock.sendMessage(chatId, { react: { text: "🎲", key: m.key } });

        // خصم ثمن الصندوق
        hunter.gold -= price;

        // ==================== نظام الجوائز ====================
        // كل جائزة ليها: اسم، وصف، مدى XP، مدى ذهب، ندرة (1 = أندر)
        
        const prizes = [
            // جوائز سيئة (نادرة لكنها موجودة)
            { 
                name: "🍃 حفنة تراب", 
                desc: "لم تجد سوى التراب في الصندوق!",
                xp: [0, 0],
                gold: [0, 0],
                rarity: 15 // نادر جداً
            },
            { 
                name: "🕸️ خيوط عنكبوت", 
                desc: "الصندوق مليء بخيوط العنكبوت فقط",
                xp: [0, 0],
                gold: [1, 5],
                rarity: 12
            },
            
            // جوائز عادية
            { 
                name: "🪙 عملات نحاسية", 
                desc: "وجدت بعض العملات النحاسية",
                xp: [0, 0],
                gold: [10, 30],
                rarity: 8
            },
            { 
                name: "🧪 جرعة صغيرة", 
                desc: "جرعة خبرة صغيرة الحجم",
                xp: [5, 15],
                gold: [0, 0],
                rarity: 7
            },
            
            // جوائز جيدة
            { 
                name: "💰 كيس نقود", 
                desc: "كيس صغير مليء بالذهب",
                xp: [0, 0],
                gold: [50, 150],
                rarity: 5
            },
            { 
                name: "⚔️ سيف صدئ", 
                desc: "سيف قديم يمكن بيعه",
                xp: [0, 0],
                gold: [100, 200],
                rarity: 4
            },
            
            // جوائز نادرة
            { 
                name: "💎 جوهرة زرقاء", 
                desc: "جوهرة ثمينة تلمع في الظلام",
                xp: [20, 50],
                gold: [200, 400],
                rarity: 3
            },
            { 
                name: "📜 لفافة المانا", 
                desc: "تمنحك خبرة كبيرة",
                xp: [50, 100],
                gold: [0, 0],
                rarity: 2
            },
            
            // جوائز أسطورية (نادرة جداً)
            { 
                name: "👑 تاج الملوك", 
                desc: "تاج قديم يقدر بثروة!",
                xp: [100, 200],
                gold: [500, 1000],
                rarity: 1
            },
            { 
                name: "✨ كريستالة الروح", 
                desc: "تمنحك قوة هائلة!",
                xp: [200, 500],
                gold: [200, 400],
                rarity: 1
            },
            { 
                name: "💀 جمجمة الظلال", 
                desc: "قطعة أثرية نادرة جداً",
                xp: [50, 150],
                gold: [1000, 2000],
                rarity: 1
            }
        ];

        // حساب الجائزة بناءً على الحظ
        function getPrize(luckMultiplier) {
            // حساب الوزن الكلي للجوائز
            let totalWeight = 0;
            prizes.forEach(p => {
                // الندرة العكسية (كل ما الرقم قل، كل ما الوزن قل)
                let weight = Math.max(1, 10 - p.rarity);
                totalWeight += weight;
            });

            // اختيار جائزة عشوائية
            let random = Math.random() * totalWeight;
            let cumulative = 0;
            
            for (const prize of prizes) {
                let weight = Math.max(1, 10 - prize.rarity);
                
                // إذا دفع ضعف، زود فرص الجوائز النادرة
                if (luckMultiplier > 1 && prize.rarity <= 3) {
                    weight *= luckMultiplier;
                }
                
                cumulative += weight;
                if (random < cumulative) {
                    return prize;
                }
            }
            
            return prizes[1]; // لو حصل خطأ
        }

        // اختيار الجائزة
        const prize = getPrize(luckMultiplier);
        
        // حساب المكسب
        const xpGained = Math.floor(Math.random() * (prize.xp[1] - prize.xp[0] + 1)) + prize.xp[0];
        const goldGained = Math.floor(Math.random() * (prize.gold[1] - prize.gold[0] + 1)) + prize.gold[0];
        
        // إضافة المكافأة
        if (xpGained > 0) hunter.xp = (hunter.xp || 0) + xpGained;
        if (goldGained > 0) hunter.gold += goldGained;

        // حساب رفع المستوى
        let levelUpMsg = "";
        const xpNeeded = hunter.level * 100;
        if (hunter.xp >= xpNeeded) {
            const oldLevel = hunter.level;
            hunter.level += Math.floor(hunter.xp / xpNeeded);
            hunter.xp = hunter.xp % xpNeeded;
            levelUpMsg = `\n\n*📈 ارتـفـع مـسـتـواك!* ⦓ *${oldLevel}* ➜ *${hunter.level}* ⦔`;
        }

        // تحديث وقت آخر صندوق
        hunter.lastBox = now;
        
        // حفظ البيانات
        soloDB[userJid] = hunter;
        fs.writeJsonSync(dbPath, soloDB, { spaces: 2 });

        // تحديد لون الرموز حسب نوع الجائزة
        let prizeEmoji = "📦";
        if (prize.rarity <= 2) prizeEmoji = "💫";
        else if (prize.rarity <= 4) prizeEmoji = "🏆";
        else if (prize.rarity <= 6) prizeEmoji = "💰";
        
        const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ صـنـدوق الـكـنـز ⌬*

*───━━━⊱  ${prizeEmoji}  ⊰━━━───*


*👤 الـصـيـاد:* ⦓ *@${userJid.split('@')[0]}* ⦔

*💰 الـمـدفـوع:* ⦓ *${price}* 🪙 ⦔


*❑ [ الـنـتـيـجـة ] ✨*

*${prizeEmoji} الـجـائـزة:* *${prize.name}*

*📝 الـوصـف:* ${prize.desc}


*❑ [ الـمـكـسـب ] 💰*

${xpGained > 0 ? `*✨ XP:* ⦓ *+${xpGained}* ⦔` : ""}
${goldGained > 0 ? `*🪙 ذهـب:* ⦓ *+${goldGained}* ⦔` : ""}
${xpGained === 0 && goldGained === 0 ? "*💔 للأسف... لا شيء هذه المرة*" : ""}
${levelUpMsg}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*📊 الـرصـيـد الـحـالـي:*

*✨ XP:* ⦓ *${hunter.xp}* ⦔

*🪙 ذهـب:* ⦓ *${hunter.gold}* ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

        await sock.sendMessage(chatId, { 
            text: resultMsg, 
            mentions: [userJid] 
        }, { quoted: m });
    }
};