import fs from 'fs-extra';

export default {
    name: "انذار",
    aliases: ["تحذير", "warn"],
    description: "إرسال إنذار لعضو مخالف (3 إنذارات = طرد)",
    category: "admin",
    admin: true,
    group: true,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        if (!isGroup) {
            return reply("❌ *هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط*");
        }

        // ✅ التحقق اليدوي من أن المستخدم مشرف
        try {
            const groupMetadata = await bot.sock.groupMetadata(jid);
            const senderParticipant = groupMetadata.participants.find(p => p.id === userJid);
            
            if (!senderParticipant?.admin) {
                return reply("*❌ هـذا الأمـࢪ لـلـمـشـࢪفـيـن فـقـط.*");
            }
        } catch (error) {
            console.error("❌ خطأ في جلب معلومات المجموعة:", error);
            return reply("*❌ فـشـل الـتـحـقـق مـن الـصـلـاحـيـات*");
        }

        // التحقق من وجود منشن أو رد
        const quoted = message.message?.extendedTextMessage?.contextInfo;
        let targetJid = quoted?.participant || quoted?.mentionedJid?.[0];

        if (!targetJid) {
            return reply("👤 *مـنـشـن الـعـضـو أو رد عـلـيـه*");
        }

        // التأكد أن العضو مش البوت
        if (targetJid === bot.sock.user.id) {
            return reply("❌ *لا يـمـكـن إنـذار الـبـوت*");
        }

        // سبب ثابت
        const reason = "مخالفة القوانين";

        // ملف تخزين الإنذارات
        const warnsPath = './data/warns.json';
        let warnsDB = fs.readJsonSync(warnsPath, { throws: false }) || {};

        // مفتاح الإنذار (مجموعة + عضو)
        const warnKey = `${jid}_${targetJid}`;

        // ✅ تنظيف البيانات القديمة المشوهة أولاً
        for (const key in warnsDB) {
            if (warnsDB[key]?.reason || warnsDB[key]?.date || warnsDB[key]?.expiresAt) {
                delete warnsDB[key].reason;
                delete warnsDB[key].date;
                delete warnsDB[key].expiresAt;
            }
        }

        // تنظيف الإنذارات المنتهية الصلاحية قبل إضافة الجديد
        await cleanExpiredWarns(warnsDB);

        // ✅ حساب تاريخ انتهاء الإنذار الجديد (3 أيام من الآن)
        const expiryDate = Date.now() + (3 * 24 * 60 * 60 * 1000);

        if (!warnsDB[warnKey]) {
            // أول إنذار
            warnsDB[warnKey] = {
                count: 1,
                reasons: [{
                    reason: reason,
                    date: Date.now(),
                    by: userJid,
                    expiresAt: expiryDate
                }]
            };
        } else {
            // إضافة إنذار جديد
            warnsDB[warnKey].count += 1;
            warnsDB[warnKey].reasons.push({
                reason: reason,
                date: Date.now(),
                by: userJid,
                expiresAt: expiryDate
            });
        }

        const warnCount = warnsDB[warnKey].count;

        // حفظ البيانات
        fs.writeJsonSync(warnsPath, warnsDB, { spaces: 2 });

        await react("⚠️");

        // حساب وقت انتهاء الصلاحية
        const expiryDateObj = new Date(expiryDate);
        const expiryFormatted = `${expiryDateObj.getDate()}/${expiryDateObj.getMonth() + 1}/${expiryDateObj.getFullYear()}`;

        // رسالة الإنذار
        const warnMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*⚠️ إنـذار إداري*

*───━━━⊱  📋  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*👥 الـعـضـو:* ⦓ *@${targetJid.split('@')[0]}* ⦔

*🔢 عـدد الإنـذارات:* ⦓ *${warnCount} / 3* ⦔

*📝 الـسـبـب:* ⦓ *مخالفة القوانين ⚠️* ⦔

*⏳ يـنـتـهـي:* ⦓ *${expiryFormatted}* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*`;

        // إذا وصل 3 إنذارات، اطرد العضو
        if (warnCount >= 3) {
            const kickMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*🚨 قـرار طـرد*

*───━━━⊱  ⚠️  ⊰━━━───*

*👤 الـمـشـرف:* ⦓ *@${userJid.split('@')[0]}* ⦔

*👥 الـعـضـو:* ⦓ *@${targetJid.split('@')[0]}* ⦔

*🔢 عـدد الإنـذارات:* ⦓ *3 / 3* ⦔

*📝 سـبـب الطـرد:* ⦓ *وصول الحد الأقصى للإنذارات (مخالفة القوانين)* ⦔

*⎔┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⎔*

*⏳ جـارٍ طـرد الـعـضـو...*`;

            await bot.sendMessage(jid, {
                text: kickMsg,
                mentions: [userJid, targetJid]
            }, { quoted: message });

            setTimeout(async () => {
                try {
                    await bot.sock.groupParticipantsUpdate(jid, [targetJid], "remove");
                    
                    delete warnsDB[warnKey];
                    fs.writeJsonSync(warnsPath, warnsDB, { spaces: 2 });

                } catch (error) {
                    await reply("❌ *فـشـل طـرد الـعـضـو (تـأكـد أن الـبـوت مـشـرف)*");
                }
            }, 1000);

        } else {
            await bot.sendMessage(jid, {
                text: warnMsg,
                mentions: [userJid, targetJid]
            }, { quoted: message });
        }
    }
};

// ✅ دالة تنظيف الإنذارات المنتهية الصلاحية
async function cleanExpiredWarns(warnsDB) {
    const now = Date.now();
    let changed = false;

    for (const key in warnsDB) {
        if (warnsDB[key]?.reasons) {
            const originalLength = warnsDB[key].reasons.length;
            
            // تصفية الإنذارات المنتهية
            warnsDB[key].reasons = warnsDB[key].reasons.filter(w => w.expiresAt > now);
            warnsDB[key].count = warnsDB[key].reasons.length;
            
            if (originalLength !== warnsDB[key].reasons.length) {
                changed = true;
            }

            if (warnsDB[key].reasons.length === 0) {
                delete warnsDB[key];
                changed = true;
            }
        }
    }

    if (changed) {
        fs.writeJsonSync('./data/warns.json', warnsDB, { spaces: 2 });
    }
}