import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';

export default {
    name: "القمر",
    aliases: ["moon"],
    description: "عرض مرحلة القمر اليوم مع صورة ثابتة",
    category: "tools",
    group: false,

    async run({ bot, message, args, isGroup, userJid, reply, react }) {
        const jid = message.key.remoteJid;

        await react("🌕");

        try {
            // جلب التاريخ الهجري
            const response = await fetch('https://api.aladhan.com/v1/gToH');
            const data = await response.json();

            const hijriDay = data.data.hijri.day;
            const hijriMonth = data.data.hijri.month.en;
            const hijriYear = data.data.hijri.year;

            // تحديد مرحلة القمر
            let phaseName = '';
            let phaseEmoji = '';
            let illumination = 0;

            if (hijriDay <= 1) {
                phaseName = 'مـحـاق';
                phaseEmoji = '🌑';
                illumination = 0;
            } else if (hijriDay <= 7) {
                phaseName = 'هـلال مـتـزايـد';
                phaseEmoji = '🌒';
                illumination = Math.round((hijriDay / 30) * 100);
            } else if (hijriDay <= 14) {
                phaseName = 'الـربـع الأول';
                phaseEmoji = '🌓';
                illumination = Math.round((hijriDay / 30) * 100);
            } else if (hijriDay <= 15) {
                phaseName = 'أحـدب مـتـزايـد';
                phaseEmoji = '🌔';
                illumination = Math.round((hijriDay / 30) * 100);
            } else if (hijriDay <= 16) {
                phaseName = 'بـدر';
                phaseEmoji = '🌕';
                illumination = 100;
            } else if (hijriDay <= 22) {
                phaseName = 'أحـدب مـتـنـاقـص';
                phaseEmoji = '🌖';
                illumination = Math.round(((30 - hijriDay) / 30) * 100);
            } else if (hijriDay <= 29) {
                phaseName = 'الـربـع الأخـيـر';
                phaseEmoji = '🌗';
                illumination = Math.round(((30 - hijriDay) / 30) * 100);
            } else {
                phaseName = 'هـلال مـتـنـاقـص';
                phaseEmoji = '🌘';
                illumination = Math.round(((30 - hijriDay) / 30) * 100);
            }

            const moonAge = hijriDay;
            
            // ✅ المسار الصحيح للصورة
            const imagePath = path.join(process.cwd(), 'media', 'moon.jpg');

            console.log('📁 مسار الصورة:', imagePath); // للتأكد من المسار

            const resultMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*🌙 مـرحـلـة الـقـمـر الـيـوم*
*───━━━⊱  ${phaseEmoji}  ⊰━━━───*

*📅 الـتـاريـخ الـهـجـري:*
⦓ *${hijriDay} ${hijriMonth} ${hijriYear}* ⦔

*${phaseEmoji} الـمـرحـلـة:* ⦓ *${phaseName}* ⦔

*🔆 نـسـبـة الإضـاءة:* ⦓ *${illumination}%* ⦔

*🌍 عـمر الـقـمـر:* ⦓ *${moonAge} يـوم* ⦔

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            // التحقق من وجود الصورة
            if (fs.existsSync(imagePath)) {
                await bot.sendMessage(jid, {
                    image: fs.readFileSync(imagePath),
                    caption: resultMsg,
                    mentions: [userJid]
                }, { quoted: message });
            } else {
                // لو الصورة مش موجودة، نرسل النص فقط
                await bot.sendMessage(jid, {
                    text: resultMsg,
                    mentions: [userJid]
                }, { quoted: message });
                
                console.log(`⚠️ الصورة غير موجودة: ${imagePath}`);
            }

            await react("🌕");

        } catch (error) {
            console.error("❌ خطأ في جلب بيانات القمر:", error);

            const errorMsg = `*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*

*❌ فـشـل جـلـب بـيـانـات الـقـمـر*

*───━━━⊱  ⚠️  ⊰━━━───*

*📋 الأسباب المحتملة:*

*• مـشـكـلة فـي الـاتـصـال*
*• الـ API غـيـر مـتـوفـر*

*───━━━⊱  𝐒 𝐎 𝐋 𝐎  ⊰━━━───*
*~『𝑺𝑶𝑳𝑶⊰🏮⊱𝑳𝑬𝑽𝑬𝑳𝑰𝑵𝑮』~*`;

            await bot.sendMessage(jid, {
                text: errorMsg,
                mentions: [userJid]
            }, { quoted: message });
        }
    }
};