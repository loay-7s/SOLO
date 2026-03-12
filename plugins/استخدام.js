import fs from 'fs-extra';
const soloPath = './data/SOLO_LEVELING.json';

export default {
    name: "استخدام",
    aliases: ["use", "شرب", "تفعيل"],
    description: "استخدام جرعة أو حجر روني من مخزنك",
    category: "solo",

    async run({ sock, m, args }) {
        const chatId = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const cleanSender = sender.split('@')[0];

        if (!args[0]) {
            return sock.sendMessage(chatId, { text: "*⚠️ اسـتـخـدام: .استخدام [نوع] [رقم]*\n*مثـال: .استخدام جرعة 30*\n*أو: .استخدام حجر 23*\n*أو: .استخدام شفاء*" }, { quoted: m });
        }

        const type = args[0].toLowerCase();
        const itemId = args[1] ? parseInt(args[1]) : null;

        // قراءة بيانات الصياد
        let soloData = {};
        try {
            soloData = await fs.readJson(soloPath);
        } catch {
            return sock.sendMessage(chatId, { text: "*⚠️ لا تـوجـد بـيـانـات لـلـصـيـاديـن بـعـد!*" });
        }

        // البحث عن الصياد
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
            return sock.sendMessage(chatId, { text: "*⚠️ اكـتـب .استيقظ أولاً لـتـصـبـح صـيـاداً!*" });
        }

        if (!hunter.inventory) hunter.inventory = [];

        // ==================== استخدام الجرعات ====================
        if (type === "جرعة" || type === "potion") {
            if (!itemId) {
                return sock.sendMessage(chatId, { text: "*⚠️ أدخـل رقـم الـجـرعـة: .استخدام جرعة 30*" });
            }

            const potions = {
                30: { name: "🧪 جرعة خبرة صغيرة", xp: 100 },
                31: { name: "🧪 جرعة خبرة متوسطة", xp: 300 },
                32: { name: "🧪◾ جرعة خبرة كبيرة", xp: 500 },
                33: { name: "💊 حبة شفاء" }, // هنستخدمها بشكل منفصل
                34: { name: "💊◾ إكسير القوة", power: 15 }
            };

            const potion = potions[itemId];
            if (!potion) {
                return sock.sendMessage(chatId, { text: "*❌ رقـم جـرعـة غـيـر صـحـيـح!*" });
            }

            const itemIndex = hunter.inventory.findIndex(item => item.id === itemId);
            if (itemIndex === -1) {
                return sock.sendMessage(chatId, { text: "*❌ لـيـس لـديـك هـذه الـجـرعـة فـي مـخـزنـك!*" });
            }

            // تأثير الجرعة
            hunter.inventory.splice(itemIndex, 1);
            let effectMsg = "";

            if (potion.xp) {
                hunter.xp = (hunter.xp || 0) + potion.xp;
                effectMsg = `✨ حـصـلـت عـلى ⦓ *+${potion.xp} XP* ⦔`;
            } else if (potion.power) {
                hunter.tempPower = (hunter.tempPower || 0) + potion.power;
                effectMsg = `⚡ زادت قـوتـك ⦓ *+${potion.power}* ⦔ لـمـعـركـة واحـدة`;
            }

            await fs.writeJson(soloPath, soloData, { spaces: 2 });

            const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ اسـتـخـدام جـرعـة ⌬*

*───━━━⊱  🧪  ⊰━━━───*


*📦 الـجـرعـة:* ⦓ *${potion.name}* ⦔

*${effectMsg}*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

            await sock.sendMessage(chatId, { text: msg }, { quoted: m });
        }

        // ==================== استخدام الأحجار الرونية ====================
        else if (type === "حجر" || type === "rune") {
            if (!itemId) {
                return sock.sendMessage(chatId, { text: "*⚠️ أدخـل رقـم الـحـجـر: .استخدام حجر 23*" });
            }

            const runes = {
                23: { name: "🔴 حجر النار", effect: "قوة نارية لـ 3 معارك" },
                24: { name: "🔵 حجر الجليد", effect: "تجميد الخصم 10%" },
                25: { name: "⚡ حجر البرق", effect: "فرصة 5% لضربة صاعقة" },
                26: { name: "🟣 حجر الظل", effect: "إخفاء في الهجوم" },
                27: { name: "🟢 حجر الحياة", effect: "استعادة 10% XP بعد الخسارة" },
                28: { name: "🟡 حجر التنين", effect: "مضاعفة XP مرة واحدة" },
                29: { name: "⚫◾ حجر الروني الأسطوري", effect: "إلغاء كول داون المغارة" }
            };

            const rune = runes[itemId];
            if (!rune) {
                return sock.sendMessage(chatId, { text: "*❌ رقـم حـجـر غـيـر صـحـيـح!*" });
            }

            const itemIndex = hunter.inventory.findIndex(item => item.id === itemId);
            if (itemIndex === -1) {
                return sock.sendMessage(chatId, { text: "*❌ لـيـس لـديـك هـذا الـحـجـر فـي مـخـزنـك!*" });
            }

            // إزالة الحجر من المخزن
            hunter.inventory.splice(itemIndex, 1);
            
            // تطبيق تأثير الحجر
            if (itemId === 27) {
                hunter.runeLife = true; // حجر الحياة: استعادة 10% XP بعد الخسارة
            } else if (itemId === 28) {
                hunter.runeDragon = true; // حجر التنين: مضاعفة XP مرة واحدة
            } else if (itemId === 29) {
                hunter.runeLegendary = true; // حجر أسطوري: إلغاء كول داون المغارة
            }

            await fs.writeJson(soloPath, soloData, { spaces: 2 });

            const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ اسـتـخـدام حـجـر رونـي ⌬*

*───━━━⊱  🔮  ⊰━━━───*


*📦 الـحـجـر:* ⦓ *${rune.name}* ⦔

*✨ الـتـأثـيـر:* ⦓ ${rune.effect} ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

            await sock.sendMessage(chatId, { text: msg }, { quoted: m });
        }

        // ==================== استخدام حبة الشفاء (استعادة XP المفقود) ====================
        else if (type === "شفاء" || type === "heal" || (type === "جرعة" && itemId === 33)) {
            const itemIndex = hunter.inventory.findIndex(item => item.id === 33);
            if (itemIndex === -1) {
                return sock.sendMessage(chatId, { text: "*❌ لـيـس لـديـك حـبـة شـفـاء! اشـتـرها من المخزن (رقم 33)*" });
            }

            // التحقق من وجود آخر خسارة
            if (!hunter.lastLostXP || hunter.lastLostXP === 0) {
                return sock.sendMessage(chatId, { 
                    text: `*❌ لا يـوجـد XP مـفـقـود لاسـتـعـادتـه!*\n\n*اخـسـر أولاً فـي هـجـوم ثـم اسـتـخـدم الـحـبـة*` 
                }, { quoted: m });
            }

            // استعادة XP المفقود
            const recoveredXP = hunter.lastLostXP;
            hunter.xp = (hunter.xp || 0) + recoveredXP;
            
            // إزالة الحبة
            hunter.inventory.splice(itemIndex, 1);
            
            // مسح آخر خسارة
            delete hunter.lastLostXP;

            await fs.writeJson(soloPath, soloData, { spaces: 2 });

            const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ اسـتـخـدام حـبـة شـفـاء ⌬*

*───━━━⊱  💊  ⊰━━━───*


*📦 الـجـرعـة:* ⦓ *💊 حبة شفاء* ⦔

*✨ اسـتـعـدت:* ⦓ *+${recoveredXP} XP* ⦔

*💚 عـدت أقـوى مـن قـبـل*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

            await sock.sendMessage(chatId, { text: msg }, { quoted: m });
        }

        else {
            return sock.sendMessage(chatId, { text: "*⚠️ اسـتـخـدام: .استخدام جرعة [رقم] أو .استخدام حجر [رقم] أو .استخدام شفاء*" });
        }

        await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });
    }
};