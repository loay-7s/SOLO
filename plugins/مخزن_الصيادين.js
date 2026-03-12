import fs from 'fs-extra';
const soloPath = './data/SOLO_LEVELING.json';

// ==================== قائمة المنتجات (مع تحديث الأوصاف) ====================
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
    { id: 22, name: "👑◾ درع الملك الظلام", price: 2000, type: "armor", defense: 25, resist: 10, desc: "درع أسطوري للملوك" },

    // 🔮 أحجار رونية (مع تأثيرات حقيقية)
    { id: 23, name: "🔴 حجر النار", price: 150, type: "rune", desc: "يمنح قوة نارية لـ 3 معارك (الاستخدام: .استخدام حجر 23)" },
    { id: 24, name: "🔵 حجر الجليد", price: 150, type: "rune", desc: "يجمد الخصم 10% في المعركة (الاستخدام: .استخدام حجر 24)" },
    { id: 25, name: "⚡ حجر البرق", price: 200, type: "rune", desc: "فرصة 5% لضربة صاعقة (الاستخدام: .استخدام حجر 25)" },
    { id: 26, name: "🟣 حجر الظل", price: 250, type: "rune", desc: "يخفي وجودك في الهجوم (الاستخدام: .استخدام حجر 26)" },
    { id: 27, name: "🟢 حجر الحياة", price: 300, type: "rune", desc: "يستعيد 10% من XP بعد الخسارة (الاستخدام: .استخدام حجر 27)" },
    { id: 28, name: "🟡 حجر التنين", price: 500, type: "rune", desc: "يضاعف XP من المعركة مرة واحدة (الاستخدام: .استخدام حجر 28)" },
    { id: 29, name: "⚫◾ حجر الروني الأسطوري", price: 300, type: "rune", desc: "يلغي كول داون المغارة نهائياً (الاستخدام: .استخدام حجر 29)" },

    // 🧪 جرعات (مع تحديث وصف حبة الشفاء)
    { id: 30, name: "🧪 جرعة خبرة صغيرة", price: 100, type: "potion", xp: 100, desc: "تمنحك 100 XP (الاستخدام: .استخدام جرعة 30)" },
    { id: 31, name: "🧪 جرعة خبرة متوسطة", price: 300, type: "potion", xp: 300, desc: "تمنحك 300 XP (الاستخدام: .استخدام جرعة 31)" },
    { id: 32, name: "🧪◾ جرعة خبرة كبيرة", price: 500, type: "potion", xp: 500, desc: "تمنحك 500 XP (الاستخدام: .استخدام جرعة 32)" },
    { id: 33, name: "💊 حبة شفاء", price: 200, type: "potion", desc: "تسترجع XP اللي خسرته في آخر هجوم (الاستخدام: .استخدام شفاء)" },
    { id: 34, name: "💊◾ إكسير القوة", price: 500, type: "potion", power: 15, desc: "يمنحك +15 قوة لمعركة واحدة (الاستخدام: .استخدام جرعة 34)" },

    // 📜 لفافات (مع توضيح أوامرها)
    { id: 35, name: "📜 لفافة النقل", price: 150, type: "scroll", desc: "تخرج من المغارة بدون خسارة (الاستخدام: .هروب)" },
    { id: 36, name: "📜 لفافة المعرفة", price: 250, type: "scroll", desc: "تكشف رتبة الخصم قبل الهجوم (الاستخدام: .معرفة)" },
    { id: 37, name: "📜◾ لفافة البطل", price: 2000, type: "scroll", desc: "تضمن الفوز في معركة واحدة (الاستخدام: .تأكيد_فوز)" },
    { id: 38, name: "📜◾ لفافة تغيير الفئة", price: 500, type: "scroll", desc: "تغير فئتك إلى فئة عشوائية (الاستخدام: .تغيير_فئتي)" }
];

export default {
    name: "مخزن_الصيادين",
    aliases: ["مخزن"],
    description: "متجر الصيادين - اشترِ أسلحة ودروع وأدوات سحرية",
    category: "solo",

    async run({ sock, m, args }) {
        const chatId = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const cleanSender = sender.split('@')[0];

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

        // التأكد من وجود المخزن
        if (!hunter.inventory) hunter.inventory = [];
        if (!hunter.equipped) hunter.equipped = { weapon: null, armor: null };

        const subCommand = args[0]?.toLowerCase();

        // ==================== عرض المساعدة (الافتراضي) ====================
        if (!subCommand) {
            return showHelp(sock, chatId, hunter, cleanSender, m);
        }

        // ==================== عرض المخزن ====================
        if (subCommand === "عرض" || subCommand === "shop" || subCommand === "store") {
            return showShop(sock, chatId, hunter, cleanSender, m);
        }

        // ==================== شراء ====================
        if (subCommand === "شراء" || subCommand === "buy") {
            return buyItem(sock, chatId, hunter, hunterJid, args[1], soloData, soloPath, cleanSender, m);
        }

        // ==================== مخزني ====================
        if (subCommand === "مخزني" || subCommand === "inventory" || subCommand === "inv") {
            return showInventory(sock, chatId, hunter, cleanSender, m);
        }

        // ==================== تجهيز ====================
        if (subCommand === "تجهيز" || subCommand === "equip") {
            return equipItem(sock, chatId, hunter, hunterJid, args[1], soloData, soloPath, cleanSender, m);
        }

        // ==================== بيع ====================
        if (subCommand === "بيع" || subCommand === "sell") {
            return sellItem(sock, chatId, hunter, hunterJid, args[1], soloData, soloPath, cleanSender, m);
        }

        // ==================== معلومات ====================
        if (subCommand === "معلومات" || subCommand === "info") {
            return showItemInfo(sock, chatId, args[1], m);
        }

        // ==================== مساعدة ====================
        return showHelp(sock, chatId, hunter, cleanSender, m);
    }
};

// ==================== عرض المساعدة (الافتراضي) ====================
async function showHelp(sock, chatId, hunter, sender, m) {
    const helpMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ مـخـزن الـصـيـاديـن ⌬*

*───━━━⊱  📖  ⊰━━━───*


*👤 الـصـيـاد:* ⦓ *@${sender}* ⦔

*💰 الـذهـب:* ⦓ *${hunter.gold || 0}* 🪙 ⦔

*🏅 الـرتـبـة:* ⦓ *[${hunter.rank}]* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*📋 الأوامـر الـرئـيـسـيـة:*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🛒* *.مخزن_الصيادين عرض*

└─ *عرض جميع المنتجات في المتجر*


*💰* *.مخزن_الصيادين شراء* *[رقم]*

└─ *شراء منتج معين*


*📦* *.مخزن_الصيادين مخزني*

└─ *عرض الأغراض اللي معاك*


*⚔️* *.مخزن_الصيادين تجهيز* *[رقم]*

└─ *تجهيز سلاح أو درع من مخزونك*


*💸* *.مخزن_الصيادين بيع* *[رقم]*

└─ *بيع غرض من مخزونك بنصف السعر*


*ℹ️* *.مخزن_الصيادين معلومات* *[رقم]*

└─ *تفاصيل كاملة عن المنتج*


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*💡 طـريـقـة اسـتـخـدام الـمـشـتـريـات:*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🔮 الأحـجـار الـرونـيـة:*

• *.استخدام حجر* *[رقم]* - لتفعيل الحجر


*🧪 الـجـرعـات:*

• *.استخدام جرعة* *[رقم]* - لشرب جرعة XP

• *.استخدام شفاء* - لاستعادة XP بعد الخسارة (حبة 33)


*📜 الـلفافـات:*

• *.هروب* - للهروب من المغارة (لفافة 35)

• *.معرفة* - لمعرفة قوة الخصم (لفافة 36)

• *.تأكيد_فوز* - لضمان الفوز في المعركة (لفافة 37)

• *.تغيير_فئتي* - لتغيير فئتك (لفافات 38-39)


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🔹* *.مخزن_الصيادين عرض* - لمشاهدة المنتجات

*🔹* *.مخزن_الصيادين* - هذه القائمة


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { 
        text: helpMsg, 
        mentions: [sender] 
    }, { quoted: m });
}

// ==================== عرض المخزن ====================
async function showShop(sock, chatId, hunter, sender, m) {
    const weapons = products.filter(p => p.type === "weapon");
    const armors = products.filter(p => p.type === "armor");
    const runes = products.filter(p => p.type === "rune");
    const potions = products.filter(p => p.type === "potion");
    const scrolls = products.filter(p => p.type === "scroll");

    let shopMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ مـخـزن الـصـيـاديـن ⌬*

*───━━━⊱  🛒  ⊰━━━───*


*👤 الـصـيـاد:* ⦓ *@${sender}* ⦔

*💰 الـذهـب:* ⦓ *${hunter.gold || 0}* 🪙 ⦔

*🏅 الـرتـبـة:* ⦓ *[${hunter.rank}]* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*⚔️ [ الأسـلـحـة ]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

`;

    weapons.forEach(w => {
        let classInfo = w.class ? ` *[${w.class}]*` : "";
        shopMsg += `*${w.id}.* *${w.name}${classInfo}* - ⦓ *${w.price}* 🪙 ⦔

└─ ${w.desc}

`;
    });

    shopMsg += `*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🛡️ [ الـدروع ]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

`;

    armors.forEach(a => {
        shopMsg += `*${a.id}.* *${a.name}* - ⦓ *${a.price}* 🪙 ⦔

└─ ${a.desc}

`;
    });

    shopMsg += `*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🔮 [ الأحـجـار الـرونـيـة ]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

`;

    runes.forEach(r => {
        shopMsg += `*${r.id}.* *${r.name}* - ⦓ *${r.price}* 🪙 ⦔

└─ ${r.desc}

`;
    });

    shopMsg += `*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🧪 [ الجـرعات ]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

`;

    potions.forEach(p => {
        shopMsg += `*${p.id}.* *${p.name}* - ⦓ *${p.price}* 🪙 ⦔

└─ ${p.desc}

`;
    });

    shopMsg += `*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*📜 [ الـلفافـات ]*

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

`;

    scrolls.forEach(s => {
        shopMsg += `*${s.id}.* *${s.name}* - ⦓ *${s.price}* 🪙 ⦔

└─ ${s.desc}

`;
    });

    shopMsg += `*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🔹 لـلـشـراء:* ⦓ *.مخزن_الصيادين شراء* *[رقم]* ⦔

*🔹لـلـمـعـلـومـات:⦓  .مخزن_الصيادين   معلومات [رقم]  ⦔*

*🔹 لـلـعـودة:* ⦓ *.مخزن_الصيادين* ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { 
        text: shopMsg, 
        mentions: [sender] 
    }, { quoted: m });
}

// ==================== شراء ====================
async function buyItem(sock, chatId, hunter, hunterJid, itemId, soloData, soloPath, sender, m) {
    if (!itemId) {
        return sock.sendMessage(chatId, { text: "*⚠️ يـرجـى إدخـال رقـم الـمـنـتـج!*" });
    }

    const item = products.find(p => p.id === parseInt(itemId));
    if (!item) {
        return sock.sendMessage(chatId, { text: "*❌ رقـم مـنـتـج غـيـر صـحـيـح!*" });
    }

    // ✅ التعديل هنا
    if (item.class) {
        // استخراج اسم الفئة من hunter.class (إزالة الرموز)
        const hunterClassName = hunter.class.replace(/[⚔️🥷🏻🧬🔥🏹💀☞]/g, '').trim();
        if (item.class !== hunterClassName) {
            return sock.sendMessage(chatId, { text: `*❌ هـذا الـسـلاح مـنـاسـب لـفـئـة ${item.class} فـقـط!*` });
        }
    }

    if (hunter.gold < item.price) {
        return sock.sendMessage(chatId, { text: `*❌ لـديـك ⦓ ${hunter.gold} 🪙 ⦔.. تـحـتـاج ⦓ ${item.price} 🪙 ⦔*` });
    }

    // إضافة للمخزن
    const purchasedItem = {
        id: item.id,
        name: item.name,
        type: item.type,
        purchasedAt: Date.now()
    };

    if (item.power) purchasedItem.power = item.power;
    if (item.magic) purchasedItem.magic = item.magic;
    if (item.defense) purchasedItem.defense = item.defense;
    if (item.class) purchasedItem.class = item.class;

    hunter.inventory.push(purchasedItem);
    hunter.gold -= item.price;

    soloData[hunterJid] = hunter;
    await fs.writeJson(soloPath, soloData, { spaces: 2 });

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ تـم الـشـراء بـنـجـاح ⌬*

*───━━━⊱  ✅  ⊰━━━───*


*🛒 الـمـنـتـج:* ⦓ *${item.name}* ⦔

*💰 الـذهـب الـمـدفـوع:* ⦓ *${item.price}* 🪙 ⦔

*📦 مـوجـود فـي مـخـزنـك الآن*

*🔹 طـريـقـة الاسـتـخـدام: ${item.desc.split('(')[1]?.replace(')', '') || 'انظر الوصف'}*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: msg }, { quoted: m });
}

// ==================== عرض المخزون ====================
async function showInventory(sock, chatId, hunter, sender, m) {
    if (!hunter.inventory || hunter.inventory.length === 0) {
        return sock.sendMessage(chatId, { text: "*📭 مـخـزنـك فـارغ! اشـتـر شـيئاً أولاً*" });
    }

    let invList = "";
    hunter.inventory.forEach((item, index) => {
        const isEquipped = (hunter.equipped?.weapon === item.id || hunter.equipped?.armor === item.id);
        const equipMark = isEquipped ? "*⚔️*" : "";
        const itemType = item.type === "weapon" ? "سلاح" : item.type === "armor" ? "درع" : item.type === "rune" ? "حجر" : item.type === "potion" ? "جرعة" : "لفافة";
        
        invList += `*${index + 1}.* ${equipMark} *${item.name}*

└─ *${itemType}*

`;
    });

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ مـخـزنـي الـشـخـصـي ⌬*

*───━━━⊱  📦  ⊰━━━───*


*👤 الـصـيـاد:* ⦓ *@${sender}* ⦔

*📊 عـدد الـمـقـتـنـيـات:* ⦓ *${hunter.inventory.length}* ⦔


*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


${invList}

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*


*🔹 لـتـجـهـيـز:* ⦓ *.مخزن_الصيادين تجهيز* *[رقم]* ⦔

*🔹 لـبـيـع:* ⦓ *.مخزن_الصيادين بيع* *[رقم]* ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { 
        text: msg, 
        mentions: [sender] 
    }, { quoted: m });
}

// ==================== تجهيز ====================
async function equipItem(sock, chatId, hunter, hunterJid, itemIndex, soloData, soloPath, sender, m) {
    if (!itemIndex) {
        return sock.sendMessage(chatId, { text: "*⚠️ يـرجـى إدخـال رقـم الـمـنـتـج فـي مـخـزنـك!*" });
    }

    const index = parseInt(itemIndex) - 1;
    if (index < 0 || index >= hunter.inventory.length) {
        return sock.sendMessage(chatId, { text: "*❌ رقـم مـنـتـج غـيـر صـحـيـح فـي مـخـزنـك!*" });
    }

    const item = hunter.inventory[index];
    
    if (item.type === "weapon") {
        hunter.equipped.weapon = item.id;
    } else if (item.type === "armor") {
        hunter.equipped.armor = item.id;
    } else {
        return sock.sendMessage(chatId, { text: "*⚠️ هـذه الأداة لا يمكن تجهيزها!*" });
    }

    soloData[hunterJid] = hunter;
    await fs.writeJson(soloPath, soloData, { spaces: 2 });

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ تـم تـجـهـيـز الـمـنـتـج ⌬*

*───━━━⊱  ⚔️  ⊰━━━───*


*🛡️ الـمـنـتـج:* ⦓ *${item.name}* ⦔

*📦 أصبح مجهزاً الآن*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: msg }, { quoted: m });
}

// ==================== بيع ====================
async function sellItem(sock, chatId, hunter, hunterJid, itemIndex, soloData, soloPath, sender, m) {
    if (!itemIndex) {
        return sock.sendMessage(chatId, { text: "*⚠️ يـرجـى إدخـال رقـم الـمـنـتـج فـي مـخـزنـك!*" });
    }

    const index = parseInt(itemIndex) - 1;
    if (index < 0 || index >= hunter.inventory.length) {
        return sock.sendMessage(chatId, { text: "*❌ رقـم مـنـتـج غـيـر صـحـيـح فـي مـخـزنـك!*" });
    }

    const item = hunter.inventory[index];
    const product = products.find(p => p.id === item.id);
    const sellPrice = Math.floor((product?.price || 100) / 2);

    if (hunter.equipped?.weapon === item.id || hunter.equipped?.armor === item.id) {
        return sock.sendMessage(chatId, { text: "*⚠️ لا يمكن بيع منتج مجهز! قم بإلغاء تجهيزه أولاً*" });
    }

    hunter.inventory.splice(index, 1);
    hunter.gold += sellPrice;

    soloData[hunterJid] = hunter;
    await fs.writeJson(soloPath, soloData, { spaces: 2 });

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ تـم الـبـيـع بـنـجـاح ⌬*

*───━━━⊱  💰  ⊰━━━───*


*📦 الـمـنـتـج:* ⦓ *${item.name}* ⦔

*💰 سـعـر الـبـيـع:* ⦓ *${sellPrice}* 🪙 ⦔


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: msg }, { quoted: m });
}

// ==================== معلومات المنتج ====================
async function showItemInfo(sock, chatId, itemId, m) {
    if (!itemId) {
        return sock.sendMessage(chatId, { text: "*⚠️ يـرجـى إدخـال رقـم الـمـنـتـج!*" });
    }

    const item = products.find(p => p.id === parseInt(itemId));
    if (!item) {
        return sock.sendMessage(chatId, { text: "*❌ رقـم مـنـتـج غـيـر صـحـيـح!*" });
    }

    let stats = "";
    if (item.power) stats += `\n*⚔️ قـوة:* ⦓ *+${item.power}* ⦔`;
    if (item.magic) stats += `\n*✨ سـحـر:* ⦓ *+${item.magic}* ⦔`;
    if (item.defense) stats += `\n*🛡️ دفـاع:* ⦓ *+${item.defense}* ⦔`;
    if (item.dodge) stats += `\n*🌪️ مـراوغـة:* ⦓ *+${item.dodge}%* ⦔`;
    if (item.crit) stats += `\n*💥 ضـربـة قـاضـيـة:* ⦓ *+${item.crit}%* ⦔`;
    if (item.xp) stats += `\n*✨ XP:* ⦓ *+${item.xp}* ⦔`;
    if (item.class) stats += `\n*🔰 الـفـئـة:* ⦓ *${item.class}* ⦔`;

    const typeName = item.type === "weapon" ? "سلاح" : 
                     item.type === "armor" ? "درع" : 
                     item.type === "rune" ? "حجر روني" : 
                     item.type === "potion" ? "جرعة" : "لفافة";

    const usage = item.desc.split('(')[1]?.replace(')', '') || 'انظر الوصف في المخزن';

    const msg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⌬ مـعـلـومـات الـمـنـتـج ⌬*

*───━━━⊱  ℹ️  ⊰━━━───*


*📦 الاسـم:* ⦓ *${item.name}* ⦔

*📝 الـوصـف:* ${item.desc.split('(')[0]}

*💰 الـسـعـر:* ⦓ *${item.price}* 🪙 ⦔

*🔖 الـنـوع:* ⦓ *${typeName}* ⦔
${stats}


*🔹 طـريـقـة الاسـتـخـدام:*

*${usage}*


*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*~*『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』*~*`.trim();

    await sock.sendMessage(chatId, { text: msg }, { quoted: m });
}