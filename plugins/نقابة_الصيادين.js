import fs from 'fs-extra';
const dataPath = './data/SOLO_LEVELING.json';

export default {
    name: "نقابة_الصيادين",
    aliases: ["الصيادين"],
    description: "نظام المهام الأسبوعية لتطوير XP",
    category: "solo",

    async run({ sock, m, args }) {
        try {
            const chatId = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;
            
            // قراءة بيانات الصياد
            let soloData = {};
            try {
                soloData = await fs.readJson(dataPath);
            } catch {
                return sock.sendMessage(chatId, { text: "*⚠️ لا تـوجـد بـيـانـات لـلـصـيـاديـن بـعـد!*" });
            }

            // البحث عن الصياد
            const cleanSender = sender.split('@')[0].split(':')[0];
            let hunterJid = null;
            let hunter = null;

            if (soloData[sender]) {
                hunterJid = sender;
                hunter = soloData[sender];
            } else {
                for (const [jid, data] of Object.entries(soloData)) {
                    if (jid.includes(cleanSender)) {
                        hunterJid = jid;
                        hunter = data;
                        break;
                    }
                }
            }

            if (!hunter) {
                return sock.sendMessage(chatId, { text: "*⚠️ اكـتـب .استيقظ أولاً لـتـنـضـم لـلـنـقـابـة!*" });
            }

            // ✅ التأكد من وجود نظام النقابة
            if (!hunter.guild) {
                if (hunter.build) {
                    hunter.guild = {
                        currentQuest: hunter.build.currentQuest || null,
                        questProgress: hunter.build.questProgress || 0,
                        questStartTime: hunter.build.questStartTime || null,
                        completedQuests: hunter.build.completedQuests || [],
                        lastReset: hunter.build.lastReset || Date.now()
                    };
                    delete hunter.build;
                } else {
                    hunter.guild = {
                        currentQuest: null,
                        questProgress: 0,
                        questStartTime: null,
                        completedQuests: [],
                        lastReset: Date.now()
                    };
                }
            }

            // التحقق من التجديد اليومي (24 ساعة)
            const oneDay = 24 * 60 * 60 * 1000;
            if (Date.now() - (hunter.guild.lastReset || 0) > oneDay) {
                hunter.guild.currentQuest = null;
                hunter.guild.questProgress = 0;
                hunter.guild.questStartTime = null;
                hunter.guild.completedQuests = [];
                hunter.guild.lastReset = Date.now();
            }

            const subCommand = args[0]?.toLowerCase();

            // ==================== عرض المساعدة ====================
            if (!subCommand) {
                return showHelp(sock, chatId, m);
            }

            // ==================== عرض مهامي ====================
            if (subCommand === "مهامي" || subCommand === "my") {
                return showMyQuests(sock, chatId, hunter, cleanSender, m);
            }

            // ==================== قبول مهمة ====================
            if (subCommand === "قبول" || subCommand === "accept") {
                return acceptQuest(sock, chatId, hunter, hunterJid, args[1], soloData, dataPath, cleanSender, m);
            }

            // ==================== إلغاء مهمة ====================
            if (subCommand === "الغاء" || subCommand === "cancel") {
                return cancelQuest(sock, chatId, hunter, hunterJid, soloData, dataPath, cleanSender, m);
            }

            // ==================== استلام المكافأة ====================
            if (subCommand === "استلام" || subCommand === "claim") {
                return claimReward(sock, chatId, hunter, hunterJid, soloData, dataPath, cleanSender, m);
            }

            return showHelp(sock, chatId, m);

        } catch (e) {
            console.error("❌ خطأ في نظام النقابة:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "*❌ فـشـل الـنـظـام!*" });
        }
    }
};

// ==================== المهام حسب الرتبة ====================
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
            { id: "B3", name: "مـديـر الأوامـر", desc: "اسـتـخـدم 20 أمـراً", target: 20, type: "commands" },
            { id: "B4", name: "الـمـتـفـاعـل الأسـطـورة", desc: "رد عـلى 30 رسـالـة", target: 30, type: "replies" },
            { id: "B5", name: "الـمـتـحـدي", desc: "اسـتـخـدم هـجـوم مـرة", target: 1, type: "attack_use" }
        ],
        "A": [
            { id: "A1", name: "الـمـرسـل الأسـطـورة", desc: "أرسـل 500 رسـالـة", target: 500, type: "messages" },
            { id: "A2", name: "الـمـغـامـر الأسـطـورة", desc: "افـتـح 5 مـغـارات", target: 5, type: "dungeon_open" },
            { id: "A3", name: "الـقـاتـل الأسـطـورة", desc: "اربـح مـعـركـة هـجـوم", target: 1, type: "attack_win" },
            { id: "A4", name: "مـلـك الأوامـر", desc: "اسـتـخـدم 25 أمـراً", target: 25, type: "commands" },
            { id: "A5", name: "مـلـك الـردود", desc: "رد عـلى 40 رسـالـة", target: 40, type: "replies" }
        ],
        "S": [
            { id: "S1", name: "الـمـرسـل الـعـمـلاق", desc: "أرسـل 800 رسـالـة", target: 800, type: "messages" },
            { id: "S2", name: "الـمـغـامـر الـعـمـلاق", desc: "افـتـح 8 مـغـارات", target: 8, type: "dungeon_open" },
            { id: "S3", name: "الـقـاتـل الـعـمـلاق", desc: "اربـح 3 مـعـارك", target: 3, type: "attack_win" },
            { id: "S4", name: "إمـبـراطـور الأوامـر", desc: "اسـتـخـدم 30 أمـراً", target: 30, type: "commands" },
            { id: "S5", name: "إمـبـراطـور الـردود", desc: "رد عـلى 50 رسـالـة", target: 50, type: "replies" }
        ],
        "SS": [
            { id: "SS1", name: "الـمـرسـل الـمـلـكـي", desc: "أرسـل 1200 رسـالـة", target: 1200, type: "messages" },
            { id: "SS2", name: "الـمـغـامـر الـمـلـكـي", desc: "افـتـح 12 مـغـارة", target: 12, type: "dungeon_open" },
            { id: "SS3", name: "الـقـاتـل الـمـلـكـي", desc: "اربـح 5 مـعـارك", target: 5, type: "attack_win" },
            { id: "SS4", name: "مـلـك الأوامـر", desc: "اسـتـخـدم 40 أمـراً", target: 40, type: "commands" },
            { id: "SS5", name: "مـلـك الـردود", desc: "رد عـلى 60 رسـالـة", target: 60, type: "replies" }
        ]
    };
    
    return quests[rank] || quests["E"];
}

// ==================== عرض المساعدة (بتنسيق جديد) ====================
async function showHelp(sock, chatId, m) {
    const helpMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ نـقـابـة الـصـيـاديـن ⌬*

*───━━━⊱  ❓  ⊰━━━───*


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*📋 الأوامـر الـرئـيـسـيـة:*


*🔹* *.نقابة_الصيادين*

└─ *عرض قائمة المساعدة*


*🔹* *.نقابة_الصيادين مهامي*

└─ *عرض جميع مهام رتبتك*


*🔹* *.نقابة_الصيادين قبول* *[رمز]*

└─ *قبول مهمة جديدة (مثال: E1)*


*🔹* *.نقابة_الصيادين الغاء*

└─ *إلغاء المهمة الحالية*


*🔹* *.نقابة_الصيادين استلام*

└─ *استلام مكافأة المهمة*


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*ℹ️ مـعـلـومـات الـنـظـام:*


*⏰* *تجديد المهام:* كل 24 ساعة

*💰* *المكافأة:* *200 XP* + *20 ذهب*

*🎯* *مهمة واحدة فقط* في اليوم

*📌* *رموز المهام:* E1, C2, B3, A4, S5, SS1


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: helpMsg }, { quoted: m });
}

// ==================== عرض مهامي (بتنسيق جديد) ====================
async function showMyQuests(sock, chatId, hunter, sender, m) {
    const rank = hunter.rank || "E";
    const allQuests = getQuestsByRank(rank);
    
    let questList = "";
    allQuests.forEach(q => {
        const isCurrent = hunter.guild?.currentQuest === q.id;
        const isCompleted = hunter.guild?.completedQuests?.includes(q.id);
        
        let status = isCompleted ? "✅" : (isCurrent ? "⚔️" : "🔴");
        
        questList += `*${status}* *${q.id}.* *${q.name}*

└─ ${q.desc} ⦓ *${q.target}* ⦔

`;
    });

    const currentQuestInfo = hunter.guild?.currentQuest 
        ? `*⚔️ مـهـمـتـي الـحـالـيـة:* ⦓ *${hunter.guild.currentQuest}* ⦔

*📊 الـتـقـدم:* ⦓ *${hunter.guild.questProgress || 0} / ${allQuests.find(q => q.id === hunter.guild.currentQuest)?.target || 0}* ⦔`
        : "*⚔️ لا تـوجـد مـهـمـة حـالـيـة*";

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ مـهـامـي فـي الـنـقـابـة ⌬*

*───━━━⊱  📋  ⊰━━━───*


*👤 الـصـيـاد:* ⦓ *@${sender}* ⦔

*🏅 الـرتـبـة:* ⦓ *[${rank}]* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*📋 قـائـمـة الـمـهـام:*

${questList}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


${currentQuestInfo}


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🔹* *.نقابة_الصيادين قبول* *[رمز]*

*🔹* *.نقابة_الصيادين الغاء*

*🔹* *.نقابة_الصيادين استلام*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { 
        text: msg, 
        mentions: [sender] 
    }, { quoted: m });
}

// ==================== قبول مهمة (بتنسيق جديد) ====================
async function acceptQuest(sock, chatId, hunter, hunterJid, questId, soloData, dataPath, sender, m) {
    if (!questId) {
        return sock.sendMessage(chatId, { text: "*⚠️ يـرجـى إدخـال رمـز الـمـهـمـة! مـثـال: E1*" });
    }

    if (hunter.guild.currentQuest) {
        return sock.sendMessage(chatId, { text: "*⚠️ لـديـك مـهـمـة حـالـيـاً! .نقابة_الصيادين الغاء لإلغائها*" });
    }

    const rank = hunter.rank || "E";
    const availableQuests = getQuestsByRank(rank);
    const selectedQuest = availableQuests.find(q => q.id === questId.toUpperCase());

    if (!selectedQuest) {
        return sock.sendMessage(chatId, { text: "*❌ رمـز مـهـمـة غـيـر صـحـيـح لـرتـبـتـك!*" });
    }

    if (hunter.guild.completedQuests?.includes(selectedQuest.id)) {
        return sock.sendMessage(chatId, { text: "*⚠️ لـقـد أكـمـلـت هـذه الـمـهـمـة الـيـوم!*" });
    }

    hunter.guild.currentQuest = selectedQuest.id;
    hunter.guild.questProgress = 0;
    hunter.guild.questStartTime = Date.now();

    soloData[hunterJid] = hunter;
    await fs.writeJson(dataPath, soloData, { spaces: 2 });

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ تـم قـبـول الـمـهـمـة ⌬*

*───━━━⊱  ✅  ⊰━━━───*


*📋 اسـم الـمـهـمـة:* ⦓ *${selectedQuest.name}* ⦔

*🎯 الـهـدف:* ⦓ ${selectedQuest.desc} ( *${selectedQuest.target}* ) ⦔

*💰 الـمـكـافـأة:* ⦓ *200 XP* + *20 ذهـب* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*💠 ابـدأ فـي تـنـفـيـذ الـمـهـمـة الآن!*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: msg }, { quoted: m });
}

// ==================== إلغاء مهمة (بتنسيق جديد) ====================
async function cancelQuest(sock, chatId, hunter, hunterJid, soloData, dataPath, sender, m) {
    if (!hunter.guild.currentQuest) {
        return sock.sendMessage(chatId, { text: "*⚠️ لا تـوجـد مـهـمـة لـإلـغائـها!*" });
    }

    hunter.guild.currentQuest = null;
    hunter.guild.questProgress = 0;
    hunter.guild.questStartTime = null;

    soloData[hunterJid] = hunter;
    await fs.writeJson(dataPath, soloData, { spaces: 2 });

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ تـم إلـغـاء الـمـهـمـة ⌬*

*───━━━⊱  ❌  ⊰━━━───*


*💠 يـمـكـنـك اخـتـيـار مـهـمـة جـديـدة الآن*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: msg }, { quoted: m });
}

// ==================== استلام المكافأة (بتنسيق جديد + 200XP + 20 ذهب) ====================
async function claimReward(sock, chatId, hunter, hunterJid, soloData, dataPath, sender, m) {
    if (!hunter.guild.currentQuest) {
        return sock.sendMessage(chatId, { text: "*⚠️ لا تـوجـد مـهـمـة لاسـتـلام مـكـافـأتـها!*" });
    }

    const rank = hunter.rank || "E";
    const availableQuests = getQuestsByRank(rank);
    const quest = availableQuests.find(q => q.id === hunter.guild.currentQuest);

    if (!quest) {
        hunter.guild.currentQuest = null;
        return sock.sendMessage(chatId, { text: "*⚠️ خطأ في بيانات المهمة*" });
    }

    if (hunter.guild.questProgress < quest.target) {
        return sock.sendMessage(chatId, { text: `*⚠️ لـم تـكـمـل الـمـهـمـة بـعـد! الـتـقـدم: ${hunter.guild.questProgress}/${quest.target}*` });
    }

    // ✅ حفظ القيم القديمة للعرض
    const oldXP = hunter.xp || 0;
    const oldGold = hunter.gold || 0;
    
    // ✅ إضافة المكافأة (200 XP + 20 ذهب)
    hunter.xp = oldXP + 200;
    hunter.gold = oldGold + 20;
    
    // ✅ تسجيل المهمة كمكتملة
    if (!hunter.guild.completedQuests) hunter.guild.completedQuests = [];
    hunter.guild.completedQuests.push(quest.id);

    // ✅ إعادة تعيين المهمة الحالية
    hunter.guild.currentQuest = null;
    hunter.guild.questProgress = 0;

    // ✅ حفظ البيانات
    soloData[hunterJid] = hunter;
    await fs.writeJson(dataPath, soloData, { spaces: 2 });

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ تـم اسـتـلام الـمـكـافـأة ⌬*

*───━━━⊱  🎁  ⊰━━━───*


*📋 اسـم الـمـهـمـة:* ⦓ *${quest.name}* ⦔


*💰 الـمـكـافـأة الـمـسـتـلـمـة:*

*✨ XP:* ⦓ *+200* ⦔

*🪙 ذهـب:* ⦓ *+20* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*📊 الـرصـيـد الـحـالـي:*

*✨ XP:* ⦓ *${hunter.xp}* ⦔

*🪙 ذهـب:* ⦓ *${hunter.gold}* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*💠 مـبـروك! يـمـكـنـك اخـتـيـار مـهـمـة جـديـدة*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: msg }, { quoted: m });
}