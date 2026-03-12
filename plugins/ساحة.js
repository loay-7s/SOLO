import fs from 'fs-extra';

export default {
    name: "ساحة",
    aliases: ["قتال", "arena", "fight"],
    description: "دخل ساحة القتال وواجه موجات من الوحوش",
    category: "solo",

    async run({ sock, m, userJid, args }) {
        const chatId = m.key.remoteJid;
        const dbPath = './data/SOLO_LEVELING.json';
        const arenaPath = './data/arena_sessions.json';
        
        // قراءة بيانات الصياد
        let soloDB = fs.readJsonSync(dbPath, { throws: false }) || {};
        let arenaSessions = fs.readJsonSync(arenaPath, { throws: false }) || {};
        
        const hunter = soloDB[userJid];
        
        if (!hunter) {
            return sock.sendMessage(chatId, { 
                text: `*⚠️ لـم تـسـتـيـقـظ بـعـد!*\n*🔹 .استيقظ لـبـدء الـمـغـامـرة*` 
            }, { quoted: m });
        }

        const subCommand = args[0]?.toLowerCase();

        // ==================== عرض حالة الساحة ====================
        if (!subCommand || subCommand === "حالتي") {
            const currentSession = arenaSessions[userJid];
            
            if (!currentSession) {
                return showArenaMenu(sock, chatId, userJid, m);
            }
            
            return showArenaStatus(sock, chatId, userJid, currentSession, m);
        }

        // ==================== دخول الساحة ====================
        if (subCommand === "دخول" || subCommand === "start") {
            return enterArena(sock, chatId, userJid, hunter, arenaSessions, arenaPath, m);
        }

        // ==================== قتال الموجة الحالية ====================
        if (subCommand === "قتال" || subCommand === "fight") {
            return fightWave(sock, chatId, userJid, hunter, soloDB, arenaSessions, dbPath, arenaPath, m);
        }

        // ==================== الانسحاب ====================
        if (subCommand === "انسحاب" || subCommand === "exit") {
            return exitArena(sock, chatId, userJid, arenaSessions, arenaPath, m);
        }

        return showArenaMenu(sock, chatId, userJid, m);
    }
};

// ==================== عرض قائمة الساحة ====================
async function showArenaMenu(sock, chatId, userJid, m) {
    const menuMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ سـاحـة الـقـتـال ⌬*

*───━━━⊱  ⚔️  ⊰━━━───*


*❑ [ مـعـلـومـات ] ℹ️*

*🏆 ساحة القتال تتكون من 10 موجات*

*📈 كل موجة وحوش أقوى ومكافآت أكبر*

*💀 إذا خسرت، تخسر تقدمك وتبدأ من الأول*

*💰 المكافآت تراكمية (كل ما توصل لأبعد، مكسبك أكبر)*


*❑ [ الأوامـر ] 📋*

*⚔️ .ساحة دخول* - دخول الساحة

*⚔️ .ساحة حالتي* - عرض تقدمك الحالي

*⚔️ .ساحة قتال* - مواجهة الموجة الحالية

*⚔️ .ساحة انسحاب* - الخروج من الساحة (مع الاحتفاظ بالمكافآت)


*❑ [ مـلاحـظـة ] 📝*

*⚠️ إذا انقطعت أو خرجت، راح تبدأ من الأول!*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: menuMsg }, { quoted: m });
}

// ==================== عرض حالة الساحة الحالية ====================
async function showArenaStatus(sock, chatId, userJid, session, m) {
    const wave = session.currentWave;
    const totalXP = session.totalXP;
    const totalGold = session.totalGold;
    
    const statusMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ حـالـة الـسـاحـة ⌬*

*───━━━⊱  ⚔️  ⊰━━━───*


*❑ [ الـتـقـدم ] 📊*

*📈 الـمـوجـة:* ⦓ *${wave} / 10* ⦔


*❑ [ الـمـكـافـآت ] 🏆*

*✨ XP الـمـجـمـع:* ⦓ *${totalXP}* ⦔

*🪙 ذهـب الـمـجـمـع:* ⦓ *${totalGold}* ⦔


*❑ [ الأمـر ] ⚔️*

*🔹 .ساحة قتال* - لمواجهة الموجة ${wave}


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: statusMsg }, { quoted: m });
}

// ==================== دخول الساحة ====================
async function enterArena(sock, chatId, userJid, hunter, arenaSessions, arenaPath, m) {
    // رسوم الدخول 30 ذهب فقط
    if ((hunter.gold || 0) < 30) {
        return sock.sendMessage(chatId, { 
            text: `*❌ تحتاج 30 ذهب لدخول الساحة!*` 
        }, { quoted: m });
    }

    // التحقق إذا كان في جلسة نشطة
    if (arenaSessions[userJid]) {
        return sock.sendMessage(chatId, { 
            text: `*⚠️ أنت بالفعل في ساحة القتال!*\n*🔹 .ساحة حالتي*` 
        }, { quoted: m });
    }

    // خصم رسوم الدخول
    hunter.gold -= 30;

    // إنشاء جلسة جديدة
    arenaSessions[userJid] = {
        currentWave: 1,
        totalXP: 0,
        totalGold: 0,
        startTime: Date.now()
    };

    // حفظ البيانات
    fs.writeJsonSync(arenaPath, arenaSessions, { spaces: 2 });

    // تفاعل
    await sock.sendMessage(chatId, { react: { text: "⚔️", key: m.key } });

    const enterMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ دخـول سـاحـة الـقـتـال ⌬*

*───━━━⊱  🚪  ⊰━━━───*


*✅ تم دخول الساحة بنجاح!*

*💰 تم خصم:* ⦓ *30* 🪙 ⦔


*❑ [ الـمـوجـة الأولـى ] ⚔️*

*👾 وحش:* متوحش الغابة

*🏅 رتبته:* E

*⚡ قوته:* 30

*💰 المكافأة:* 20 XP + 30 ذهب


*🔹 .ساحة قتال* - لبدء القتال


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: enterMsg }, { quoted: m });
}

// ==================== قتال الموجة الحالية ====================
async function fightWave(sock, chatId, userJid, hunter, soloDB, arenaSessions, dbPath, arenaPath, m) {
    const session = arenaSessions[userJid];
    
    if (!session) {
        return sock.sendMessage(chatId, { 
            text: `*⚠️ أنت لست في ساحة القتال!*\n*🔹 .ساحة دخول*` 
        }, { quoted: m });
    }

    const wave = session.currentWave;

    // تعريف الوحوش حسب الموجة
    const waves = [
        { name: "👾 متوحش الغابة", rank: "E", power: 30, xp: 20, gold: 30 },
        { name: "🐺 ذئب الظلام", rank: "E", power: 45, xp: 30, gold: 40 },
        { name: "🦴 هيكل عظمي", rank: "D", power: 60, xp: 40, gold: 50 },
        { name: "🕷️ عنكبوت عملاق", rank: "D", power: 80, xp: 50, gold: 60 },
        { name: "👹 عفريت النار", rank: "C", power: 110, xp: 70, gold: 80 },
        { name: "🧟 زومبي متوحش", rank: "C", power: 150, xp: 90, gold: 100 },
        { name: "🗿 جوليم حجري", rank: "B", power: 200, xp: 120, gold: 130 },
        { name: "🐉 سحلية التنين", rank: "B", power: 260, xp: 160, gold: 170 },
        { name: "👺 شيطان الظل", rank: "A", power: 350, xp: 220, gold: 230 },
        { name: "👑 ملك الساحة", rank: "S", power: 500, xp: 300, gold: 350 }
    ];

    const enemy = waves[wave - 1];

    // حساب قوة الصياد
    let hunterPower = (hunter.level * 2);
    if (hunter.rank === "E") hunterPower += 10;
    else if (hunter.rank === "D") hunterPower += 25;
    else if (hunter.rank === "C") hunterPower += 50;
    else if (hunter.rank === "B") hunterPower += 100;
    else if (hunter.rank === "A") hunterPower += 200;
    else if (hunter.rank === "S") hunterPower += 400;
    else if (hunter.rank === "SS") hunterPower += 800;
    else if (hunter.rank === "SSS") hunterPower += 1500;

    // إضافة قوة السلاح
    if (hunter.equipped?.weapon) {
        const products = [
            { id: 1, power: 5 }, { id: 2, power: 12 }, { id: 3, power: 25 },
            { id: 4, magic: 5 }, { id: 5, magic: 12 }, { id: 6, magic: 25 },
            { id: 7, power: 5 }, { id: 8, power: 12 }, { id: 9, power: 25 },
            { id: 10, power: 5 }, { id: 11, power: 12 }, { id: 12, power: 25 },
            { id: 13, heal: 5 }, { id: 14, heal: 12 }, { id: 15, heal: 25 },
            { id: 16, dark: 8 }, { id: 17, dark: 18 }, { id: 18, dark: 35 }
        ];
        const weapon = products.find(p => p.id === hunter.equipped.weapon);
        if (weapon) {
            hunterPower += weapon.power || weapon.magic || weapon.dark || 0;
        }
    }

    // حساب فرصة الفوز
    const winChance = Math.min(0.95, hunterPower / enemy.power);
    const isWin = Math.random() < winChance;

    // انتظار درامي
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isWin) {
        // فوز
        const xpGained = enemy.xp;
        const goldGained = enemy.gold;

        // إضافة للمكافآت التراكمية
        session.totalXP += xpGained;
        session.totalGold += goldGained;

        // تحديث الموجة
        if (wave < 10) {
            session.currentWave++;
        }

        // إضافة XP وذهب للصياد
        hunter.xp = (hunter.xp || 0) + xpGained;
        hunter.gold = (hunter.gold || 0) + goldGained;

        // حفظ البيانات
        soloDB[userJid] = hunter;
        arenaSessions[userJid] = session;
        fs.writeJsonSync(dbPath, soloDB, { spaces: 2 });
        fs.writeJsonSync(arenaPath, arenaSessions, { spaces: 2 });

        // تفاعل
        await sock.sendMessage(chatId, { react: { text: "🏆", key: m.key } });

        let resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ انـتـصـار! ⌬*

*───━━━⊱  ⚔️  ⊰━━━───*


*❑ [ الـمـوجـة ${wave} ] 👾*

*👾 الـوحـش:* *${enemy.name}*

*🏅 رتـبـته:* *[${enemy.rank}]*

*⚡ قـوته:* *${enemy.power}*


*❑ [ الـمـكـافـأة ] 🏆*

*✨ XP:* ⦓ *+${xpGained}* ⦔

*🪙 ذهـب:* ⦓ *+${goldGained}* ⦔


*❑ [ إجـمـالـي ] 📊*

*✨ XP:* ⦓ *${session.totalXP}* ⦔

*🪙 ذهـب:* ⦓ *${session.totalGold}* ⦔`;

        if (wave < 10) {
            const nextEnemy = waves[wave];
            resultMsg += `\n\n*❑ [ الـمـوجـة الـقـادمـة ] ⚔️*\n\n*👾 الـوحـش:* *${nextEnemy.name}*\n*⚡ قـوته:* *${nextEnemy.power}*\n\n*🔹 .ساحة قتال* - لمواصلة القتال`;
        } else {
            // أكمل الساحة كلها!
            resultMsg += `\n\n*🏆 مـبـروك! أكـمـلـت الـسـاحـة!*\n\n*💰 الـمـكـافـأة الـنـهـائـيـة:* ⦓ *+500 XP* + *+500 ذهـب* ⦔`;
            
            // مكافأة نهاية الساحة
            hunter.xp += 500;
            hunter.gold += 500;
            session.totalXP += 500;
            session.totalGold += 500;
            
            // حذف الجلسة
            delete arenaSessions[userJid];
            
            soloDB[userJid] = hunter;
            fs.writeJsonSync(dbPath, soloDB, { spaces: 2 });
            fs.writeJsonSync(arenaPath, arenaSessions, { spaces: 2 });
        }

        resultMsg += `\n\n*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*\n*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`;

        await sock.sendMessage(chatId, { text: resultMsg }, { quoted: m });

    } else {
        // خسارة
        await sock.sendMessage(chatId, { react: { text: "💀", key: m.key } });

        const loseMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ هـزيـمـة! ⌬*

*───━━━⊱  💔  ⊰━━━───*


*❑ [ الـمـوجـة ${wave} ] 👾*

*👾 الـوحـش:* *${enemy.name}*

*🏅 رتـبـته:* *[${enemy.rank}]*

*⚡ قـوته:* *${enemy.power}*


*❑ [ الـنـتـيـجـة ] 😔*

*💀 هـزمـك الـوحـش وخـرجـت مـن الـسـاحـة*


*💰 الـمـكـافـآت الـمـفـقـودة:* ⦓ *${session.totalXP} XP* + *${session.totalGold} ذهـب* ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

        // حذف الجلسة
        delete arenaSessions[userJid];
        fs.writeJsonSync(arenaPath, arenaSessions, { spaces: 2 });

        await sock.sendMessage(chatId, { text: loseMsg }, { quoted: m });
    }
}

// ==================== الانسحاب من الساحة ====================
async function exitArena(sock, chatId, userJid, arenaSessions, arenaPath, m) {
    const session = arenaSessions[userJid];
    
    if (!session) {
        return sock.sendMessage(chatId, { 
            text: `*⚠️ أنت لست في ساحة القتال!*` 
        }, { quoted: m });
    }

    const totalXP = session.totalXP;
    const totalGold = session.totalGold;

    // حذف الجلسة
    delete arenaSessions[userJid];
    fs.writeJsonSync(arenaPath, arenaSessions, { spaces: 2 });

    const exitMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ انـسـحـاب مـن الـسـاحـة ⌬*

*───━━━⊱  🚪  ⊰━━━───*


*✅ تم الانسحاب بنجاح*

*💰 الـمـكـافـآت الـمـحـتـفـظ بـها:*


*✨ XP:* ⦓ *${totalXP}* ⦔

*🪙 ذهـب:* ⦓ *${totalGold}* ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: exitMsg }, { quoted: m });
}